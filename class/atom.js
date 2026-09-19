class Atom {
    /** @param {number|string|object} element @param {Victor | Victor3} position */
    constructor(element, position) {
        const el = getElement(element);
        if (!el) return;
        const atomicNumber = el.number;

        this.protons = atomicNumber;
        this.neutrons = atomicNumber; // implement ACTUAL isotopes later
        this.electrons = atomicNumber;
        this.charge = 0;
        
        this.pos = position;
    }

    get atomicNumber() { return this.protons; }
    get elemData() { return getElement(this.protons); }

    /**
     * The difference in electrons of this atom from its neutral state.
     * Used for determining electron-happiness and ionization forms.
     */
    get valenceCharge() { return this.protons - this.electrons; }

    get symbol() {
        const chargeNum = toSuperscript(Math.abs(this.charge).toString());

        let sym = this.elemData.symbol;
        sym += ['', '⁺', '⁻'].at(Math.sign(this.charge));
        if (Math.abs(this.charge) > 1) sym += chargeNum;

        return sym;
    }

    share(amount) {
        if (amount <= 0) return;
        this.electrons += amount;
    }
    /**
     * Gives the atom a certain number of electrons.
     * Takes electrons away if `amount < 0`.
     * @param {number} amount 
     */
    ionize(amount) {
        this.electrons += amount;
        this.charge -= amount;
    }
    give(amount) { this.ionize(amount); }
    take(amount) { this.ionize(-amount); }
}

/** @param {Atom} atom @returns {Atom} */
function cloneAtomOnto(atom, objatom) {
    objatom.ionize(-atom.charge);
    objatom.share(atom.valenceCharge + atom.charge);
    return objatom;
}
/** @param {Atom} atom @returns {Atom} */
function cloneAtom(atom) {
    const a = new Atom(atom.protons, new Victor(atom.pos.x, atom.pos.y));
    cloneAtomOnto(atom, a);
    return a;
}
/** @param {Atom} atom @returns {Atom2D} */
function cloneAtom2D(atom) {
    const a = new Atom2D(atom.protons, new Victor(atom.pos.x, atom.pos.y));
    cloneAtomOnto(atom, a);
    return a;
}
/** @param {Atom} atom @returns {Atom3D} */
function cloneAtom3D(atom) {
    const a = new Atom3D(atom.protons, new Victor(atom.pos.x, atom.pos.y));
    cloneAtomOnto(atom, a);
    return a;
}