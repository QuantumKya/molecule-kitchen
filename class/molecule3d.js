class Mol3D extends Molecule {
    /** @param {Molecule} mol @returns {Mol3D} */
    static from(mol) { return cloneMolecule3D(mol); }
}