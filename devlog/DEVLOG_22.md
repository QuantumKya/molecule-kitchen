## Devlog #22 - 12/31/2025
# Polishing Up

I'm fixing a bunch of small issues right before submitting. Axiom v2 ends today at 11 P.M., so I want to get this thing working and good before then.

## Fixes

### Ion Notation

I've fixed the notation for molecules with ionic bonds—now they show the net charge of the molecule rather than the atoms' charges individually. That was achieved with this spaghetti-looking code right here:
```js
// get each part's formula
const sectionStrs = counts.map((cObj) => {
    const sortedPairs = Object.entries(cObj).toSorted(
        (Object.keys(cObj).includes('C')) ? carbon : kakhaga
    );

    let totalCharge = 0;
    const str = sortedPairs.map(pair => {
        if (pair[0].includes('<sup>')) {
            const ch = pair[0].search(/\d+(?=<\/sup>)/g);
            totalCharge += pair[0].includes('+') ? ch : -ch;
        }
        const s = `${pair[0].split('<')[0]}<sub>${pair[1]}</sub>`;
        if (pair[1] === 1) return s.split('<sub>')[0];
        return s;
    }).join('') + (totalCharge === 0 ? '' : `<sup>${(totalCharge < 0 ? '-' : '+') + (Math.abs(totalCharge) === 1 ? '' : Math.abs(totalCharge).toString(10))}</sup>`);
    return str;
});
```
But... it wasn't really achieved. It was totally buggy and weird. Now, though... it works!! And the code is much simpler too.
```js
const sectionStrs = counts.map((cObj, idx) => {
    const hasCarbon = Object.keys(cObj).some(k => k.startsWith('C'));
    const sortedPairs = Object.entries(cObj).toSorted(hasCarbon ? carbon : kakhaga);

    const totalCharge = sectionCharges[idx];

    const str = sortedPairs.map(([sym, count]) => {
        if (count === 1) return sym;
        return `${sym}${toSubscript(count)}`;
    }).join('');

    // build unicode superscript for net charge (sign then magnitude)
    let netChargeSup = '';
    if (totalCharge !== 0) {
        const signChar = totalCharge > 0 ? '⁺' : '⁻';
        const mag = Math.abs(totalCharge);
        const magSup = mag > 1 ? String(mag).split('').map(d => superscriptMap[d]).join('') : '';
        netChargeSup = signChar + magSup;
    }
    return str + netChargeSup;
});
```

### Ionization

Next, I went to add reduction and oxidation. Now you can press R to reduce an atom and Shift+R to oxidize an atom. This allows you to model way more scenarios! Well... "model"...  
Anyway, here's the code!
```js
ionize(atomId, amount) {
    if (this.ionizations[atomId] === undefined) this.ionizations[atomId] = 0;
    this.ionizations[atomId] += amount;
    this.atoms[atomId].charge += amount;
}

reduce(atomId, amount = 1) {
    if (amount <= 0) return;
    this.ionize(atomId, -amount);
}

oxidize(atomId, amount = 1) {
    if (amount <= 0) return;
    this.ionize(atomId, amount);
}
```
I created a new object called `ionizations` that the molecule keeps track of. It was kind of a workaround because of my undo/redo system. But it works!

### More Elements!!!

I added a bunch of elements to the available ones! The ones I added were...

<br>
<br>

The site's looking really good now, and I can't think of any other big issues as of writing this! See you next time! If there is one...

[<-- Previous Devlog](DEVLOG_21.md)   [Next Devlog -->](DEVLOG_23.md)