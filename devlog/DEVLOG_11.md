## Devlog #11 - 11/9/2025
# Formula Finding

#### Wait, we have to do math in chemistry?!

After my last addition, I thought for a while about what to add next. I decided to add a display of the chemical formula of your creation to the right of the dashboard.

How would I get that, you ask? With a very large and complex class method.

I named mine `getFormula`. Here's the first half of it:
```js
// get different sections
const sections = [];
this.atoms.forEach((atom, id) => {
    if (sections.flat().includes(id)) return;
    sections.push(this.findAllConnected(id));
});

// get counts per section
const counts = [];
for (const sec of sections) {
    const cObj = {};
    for (const aid of sec) {
        const atom = this.atoms[aid];
        const sym = atom.elemData.symbol;

        if (cObj[sym] === undefined) cObj[sym] = 0;
        cObj[sym]++;
    }

    counts.push(cObj);
}
```
This code finds each distinct molecule and then finds the totals of the atoms within.

Now, I had to do some research on chemical formula notation. I found a helpful Wikipedia passage on the [Hill system](https://en.wikipedia.org/wiki/Chemical_formula#Hill_system).
The essentials of the format are as such:
- If there is carbon, carbon and hydrogen go first and all else go alphabetically.
- If there is no carbon, all go alphabetically.

Here's how I added that into my function—with two more functions!

```js
// if no carbon, sort alphabetically
const kakhaga = (a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
}

// if carbon present, sort organically
const carbon = (a, b) => {
    // first priority — carbon
    if (a[0] === 'C') return -1;
    if (b[0] === 'C') return 1;

    // second priority — hydrogen
    if (a[0] === 'H') return -1;
    if (b[0] === 'H') return 1;

    // otherwise alphabetical
    return kakhaga(a, b);
}
```
Those were quite simple because of Javascript's built in string comparison.

These functions were designed to be passed into Javascript's `sort` function, to sort elements in this block of code:
```js
// get each part's formula
const sectionStrs = counts.map((cObj) => {
    const sortedPairs = Object.entries(cObj).toSorted(
        (Object.keys(cObj).includes('C')) ? carbon : kakhaga
    );

    const str = sortedPairs.map(pair => {
        const s = `${pair[0]}<sub>${pair[1]}</sub>`;
        if (pair[1] === 1) return s.split('<')[0];
        return s;
    }).join('');
    return str;
});
```

<br>
<br>

I hope that wasn't too much code to look at... See you next time!

[<-- Previous Devlog](DEVLOG_10.md)<!--   [Next Devlog --\>](DEVLOG_12.md)-->