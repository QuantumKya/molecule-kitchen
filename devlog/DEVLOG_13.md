## Devlog #13 - 11/11/2025
# Enzymes Make Mistakes, Too

#### Take that, thermodynamics!

When you're making molecules, you're bound to make some mistakes. That's why I added the ability to undo and redo! Press Ctrl+Z to undo and Ctrl+Y (or Ctrl+Shift+Z) to redo!

###### Fun Fact: I prefer Ctrl+Y.

Anyway, it was very similar to an undo/redo system that I've made in the past. The elements of it are...
- an array of past molecules
- a number to keep track of how many states back in time you are
- undo/redo functions
- function to clone a datum (molecules in this case)
- state update function

The update state function is called after any event that is tracked by the undo/redo system.

Here's ALL of it (wasn't much).
```js
function cloneMolecule(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.elemData, a.pos);
        return newA;
    });

    const m = new Molecule(...mAtoms);
    for (const bond of molecule.bonds) m.createCovalentBond(bond.atom1, bond.atom2, bond.degree);
    return m;
}

const stateBuffer = [cloneMolecule(mol)];
let stateBack = 0;

function updateState() {
    const backMol = stateBuffer.at(-(stateBack+1));
    mol = backMol;
}

function undo() {
    if (stateBack + 1 >= stateBuffer.length) return;
    stateBack++;
    updateState();
}

function redo() {
    if (stateBack <= 0) return;
    stateBack--;
    updateState();
}

function saveChange() {
    if (stateBack > 0) {
        stateBuffer.splice(-(stateBack+1));
        stateBack = 0;
    }
    stateBuffer.push(cloneMolecule(mol));
    updateState();
}
```

<br>
<br>

Have fun making mistakes!

[<-- Previous Devlog](DEVLOG_12.md)<!--   [Next Devlog --\>](DEVLOG_13.md)-->