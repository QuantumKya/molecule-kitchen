class Atom3D extends Atom {
    constructor(element, position = new Victor3(0, 0, 0)) {
        super(element, position);

        const r0 = 1.2; // 1.2 fm
        this.nRadius = r0 * Math.cbrt(this.neutrons);
    }

    static protonColor = '#ff9090';
    static neutronColor = '#dedede';
    static orbitalColor = '#9090ff';

    static nucleusColor = ''
}