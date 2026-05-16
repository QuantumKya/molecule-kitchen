function water() {
    const anglebetween = 104.45;
    const offsetvectors = [-1, 1].map((sign) => {
        const angleoff = -Math.PI / 2 + sign * anglebetween / 2;
        return polarVec(angleoff, 200);
    });
    
    const O = new Atom(ELEMENTS.oxygen, ccenter);
    const H1 = new Atom(ELEMENTS.hydrogen, ccenter.clone().add(offsetvectors[0]));
    const H2 = new Atom(ELEMENTS.hydrogen, ccenter.clone().add(offsetvectors[1]));

    const h2o = new Molecule(O, H1, H2);
    h2o.createCovalentBond(0, 1);
    h2o.createCovalentBond(0, 2);
    return h2o;
}

function carbon_dioxide() {
    const C = new Atom(ELEMENTS.carbon, ccenter);
    const O1 = new Atom(ELEMENTS.oxygen, ccenter.clone().add(new Victor(175, 0)));
    const O2 = new Atom(ELEMENTS.oxygen, ccenter.clone().add(new Victor(-175, 0)));

    const co2 = new Molecule(C, O1, O2);
    co2.createCovalentBond(0, 1, 2);
    co2.createCovalentBond(0, 2, 2);
    return co2;
}

function ethylene() {
    const C1 = new Atom(ELEMENTS.carbon, new Victor(ccenter.x - 100, ccenter.y));
    const C2 = new Atom(ELEMENTS.carbon, new Victor(ccenter.x + 100, ccenter.y));
    const H11 = new Atom(ELEMENTS.hydrogen, new Victor(ccenter.x - 150, ccenter.y - 150));
    const H12 = new Atom(ELEMENTS.hydrogen, new Victor(ccenter.x - 150, ccenter.y + 150));
    const H21 = new Atom(ELEMENTS.hydrogen, new Victor(ccenter.x + 150, ccenter.y - 150));
    const H22 = new Atom(ELEMENTS.hydrogen, new Victor(ccenter.x + 150, ccenter.y + 150));
    
    const methane = new Molecule(C1, C2, H11, H12, H21, H22);
    methane.createCovalentBond(0, 1, 2);
    methane.createCovalentBond(0, 2);
    methane.createCovalentBond(0, 3);
    methane.createCovalentBond(1, 4);
    methane.createCovalentBond(1, 5);
    return methane;
}

function methane() {
    const offsetvectors = [];
    for (let i = 0; i < 4; i++) {
        const angleoff = Math.PI / 2 + (i / 4) * Math.PI * 2;
        offsetvectors.push(polarVec(angleoff, 200));
    }

    const C = new Atom(ELEMENTS.carbon, ccenter.clone());
    const Hs = offsetvectors.map(vec => new Atom(ELEMENTS.hydrogen, ccenter.clone().add(vec)));
    
    const methane = new Molecule(C, ...Hs);
    for (let i = 0; i < 4; i++) methane.createCovalentBond(0, i+1);
    return methane;
}

function ammonia() {
    const offsetvectors = [];
    for (let i = 0; i < 3; i++) {
        const angleoff = Math.PI / 2 + (i / 3) * Math.PI * 2;
        offsetvectors.push(polarVec(angleoff, 200));
    }

    const N = new Atom(ELEMENTS.nitrogen, ccenter.clone());
    const Hs = offsetvectors.map(vec => new Atom(ELEMENTS.hydrogen, ccenter.clone().add(vec)));

    const ammonia = new Molecule(N, ...Hs);
    for (let i = 0; i < 3; i++) ammonia.createCovalentBond(0, i+1);
    return ammonia;
}

function salt() {
    const Na = new Atom(ELEMENTS.sodium, ccenter.clone().add(new Victor(-200, 0)));
    const Cl = new Atom(ELEMENTS.chlorine, ccenter.clone().add(new Victor(200, 0)));

    const salt = new Molecule(Na, Cl);
    salt.createIonicBond(0, 1);
    return salt;
}

function methanol() {
    const C = new Atom(ELEMENTS.carbon, ccenter);
    const Hs = [1/3, 5/6, 4/3].map(a => new Atom(ELEMENTS.hydrogen, ccenter.clone().add(polarVec(-a*Math.PI, 175))));
    const O = new Atom(ELEMENTS.oxygen, ccenter.clone().add(new Victor(200, 0)));
    const H = new Atom(ELEMENTS.hydrogen, ccenter.clone().add(new Victor(200, 0)).add(polarVec(Math.PI/3, 150)));

    const methanol = new Molecule(C, ...Hs, O, H);
    methanol.createCovalentBond(0, 1);
    methanol.createCovalentBond(0, 2);
    methanol.createCovalentBond(0, 3);
    methanol.createCovalentBond(0, 4);
    methanol.createCovalentBond(4, 5);
    return methanol;
}

function sulfuric_acid() {
    const S = new Atom(ELEMENTS.sulfur, ccenter);
    const Os = [0, 1/2, 1, 3/2].map(a => new Atom(ELEMENTS.oxygen, ccenter.clone().add(polarVec(a*Math.PI, 175))));
    const Hs = [Os[0], Os[2]].map(a => new Atom(ELEMENTS.hydrogen, a.pos.clone().add(polarVec(Math.PI/4, 85))));

    const sulfuric_acid = new Molecule(S, ...Os, ...Hs);
    sulfuric_acid.createCovalentBond(0, 1);
    sulfuric_acid.createCovalentBond(0, 2, 2);
    sulfuric_acid.createCovalentBond(0, 3);
    sulfuric_acid.createCovalentBond(0, 4, 2);
    sulfuric_acid.createCovalentBond(1, 5);
    sulfuric_acid.createCovalentBond(3, 6);
    return sulfuric_acid;
}

function carbonic_acid() {
    const C = new Atom(ELEMENTS.carbon, ccenter);
    const Os = [-5/6, -1/6, 1/2].map(a => new Atom(ELEMENTS.oxygen, ccenter.clone().add(polarVec(-a*Math.PI, 200))));
    const Hs = [0, 1].map(a => new Atom(ELEMENTS.oxygen, ccenter.clone().add(polarVec(-a*Math.PI, 300))));

    const carbonic_acid = new Molecule(C, ...Os, ...Hs);
    carbonic_acid.createCovalentBond(0, 1);
    carbonic_acid.createCovalentBond(0, 2);
    carbonic_acid.createCovalentBond(0, 3, 2);
    carbonic_acid.createCovalentBond(1, 5);
    carbonic_acid.createCovalentBond(2, 4);
    return carbonic_acid;
}

function sodium_bicarbonate() {
    const C = new Atom(ELEMENTS.carbon, ccenter.clone().add(new Victor(-50, 0)));
    const Os = [5/6, 1/6, -1/2].map(a => new Atom(ELEMENTS.oxygen, ccenter.clone().add(new Victor(-50, 0)).add(polarVec(a*Math.PI, 225))));
    const H = new Atom(ELEMENTS.hydrogen, ccenter.clone().add(new Victor(-50, 0)).add(polarVec(11/12*Math.PI, 275)));
    const Na = new Atom(ELEMENTS.sodium, ccenter.clone().add(new Victor(-50, 0)).add(polarVec(1/12, 350)));

    const sodium_bicarbonate = new Molecule(C, ...Os, H, Na);
    sodium_bicarbonate.createCovalentBond(0, 1);
    sodium_bicarbonate.createCovalentBond(0, 2);
    sodium_bicarbonate.createCovalentBond(0, 3, 2);
    sodium_bicarbonate.createCovalentBond(1, 4);
    sodium_bicarbonate.createIonicBond(5, 2);
    return sodium_bicarbonate;
}

function acetic_acid() {
    const C1 = new Atom(ELEMENTS.carbon, new Victor(ccenter.x - 100, ccenter.y));
    const C2 = new Atom(ELEMENTS.carbon, new Victor(ccenter.x + 100, ccenter.y));
    const Hs = [1/2, 1, 3/2].map(a => new Atom(ELEMENTS.hydrogen, ccenter.clone().add(polarVec(a*Math.PI, 175)).add(new Victor(-100, 0))));
    const Os = [-1/3, 1/3].map(a => new Atom(ELEMENTS.oxygen, ccenter.clone().add(polarVec(a*Math.PI, 175)).add(new Victor(100, 0))));
    const H = new Atom(ELEMENTS.hydrogen, ccenter.clone().add(polarVec(1/8*Math.PI, 225)).add(new Victor(100, 0)));

    const acetic_acid = new Molecule(C1, C2, ...Hs, ...Os, H);
    acetic_acid.createCovalentBond(0, 1);
    acetic_acid.createCovalentBond(0, 2);
    acetic_acid.createCovalentBond(0, 3);
    acetic_acid.createCovalentBond(0, 4);
    acetic_acid.createCovalentBond(1, 5, 2);
    acetic_acid.createCovalentBond(1, 6);
    acetic_acid.createCovalentBond(6, 7);
    return acetic_acid;
}

function chloroform() {
    const C = new Atom(ELEMENTS.carbon, ccenter.clone());
    const Cls = [-1/2, 1/6, 5/6].map(a => new Atom(ELEMENTS.chlorine, ccenter.clone().add(polarVec(a*Math.PI, 225))));
    const H = new Atom(ELEMENTS.hydrogen, ccenter.clone().add(new Victor(100, -50)));

    const chloroform = new Molecule(C, ...Cls, H);
    chloroform.createCovalentBond(0, 1);
    chloroform.createCovalentBond(0, 2);
    chloroform.createCovalentBond(0, 3);
    chloroform.createCovalentBond(0, 4);
    return chloroform;
}

function formaldehyde() {
    const C = new Atom(ELEMENTS.carbon, ccenter.clone());
    const Hs = [1/6, 5/6].map(a => new Atom(ELEMENTS.hydrogen, ccenter.clone().add(polarVec(a*Math.PI, 175))));
    const O = new Atom(ELEMENTS.oxygen, ccenter.clone().add(new Victor(0, -175)));

    const formaldehyde = new Molecule(C, ...Hs, O);
    formaldehyde.createCovalentBond(0, 1);
    formaldehyde.createCovalentBond(0, 2);
    formaldehyde.createCovalentBond(0, 3, 2);
    return formaldehyde;
}