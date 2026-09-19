
/**
 * @typedef {Object} ElementData
 * @property {number} number
 * @property {string} symbol
 * @property {Array<number>} valences
 * @property {string} color
 * @property {number} electronegativity
 */

const shells = [2, 8, 8, 18, 18, 32, 32];


/** @type {Object.<string, ElementData>} */
const ELEMENTS = {
    hydrogen: {
        number: 1,
        symbol: 'H',
        valences: [+1, -1],
        color: '#ffffff',
    },
    helium: {
        number: 2,
        symbol: 'He',
        valences: [0],
        color: '#ffeded'
    },
    lithium: {
        number: 3,
        symbol: 'Li',
        valences: [+1],
        color: '#ecb394'
    },
    beryllium: {
        number: 4,
        symbol: 'Be',
        valences: [0, +2, -2],
        color: '#938a7e'
    },
    boron: {
        number: 5,
        symbol: 'B',
        valences: [0, -3],
        color: '#987a5b'
    },
    carbon: {
        number: 6,
        symbol: 'C',
        valences: [-4],
        color: '#505050',
    },
    nitrogen: {
        number: 7,
        symbol: 'N',
        valences: [-3],
        color: '#3434d5',
    },
    oxygen: {
        number: 8,
        symbol: 'O',
        valences: [-2],
        color: '#ba0909',
    },
    flourine: {
        number: 9,
        symbol: 'F',
        valences: [-1],
        color: '#b7faff'
    },
    neon: {
        number: 10,
        symbol: 'Ne',
        valences: [0],
        color: '#4be791'
    },
    sodium: {
        number: 11,
        symbol: 'Na',
        valences: [+1],
        color: '#ff1500',
    },
    magnesium: {
        number: 12,
        symbol: 'Mg',
        valences: [0, +2],
        color: '#e45c32',
    },
    aluminum: {
        number: 13,
        symbol: 'Al',
        valences: [0, +3, -3],
        color: '#c3d0d9',
    },
    silicon: {
        number: 14,
        symbol: 'Si',
        valences: [-4],
        color: '#7393b3'
    },
    phosphorus: {
        number: 15,
        symbol: 'P',
        valences: [-3],
        color: '#c18f2c',
    },
    sulfur: {
        number: 16,
        symbol: 'S',
        valences: [-2, -6],
        color: '#ecd800',
    },
    chlorine: {
        number: 17,
        symbol: 'Cl',
        valences: [-1],
        color: '#00e980',
    },
    argon: {
        number: 18,
        symbol: 'Ar',
        valences: [0],
        color: '#c097e3'
    },
    potassium: {
        number: 19,
        symbol: 'K',
        valences: [+1],
        color: '#cecece',
    },
    calcium: {
        number: 20,
        symbol: 'Ca',
        valences: [0, +2],
        color: '#f1f1f1',
    },
    scandium: {
        number: 21,
        symbol: 'Sc',
        valences: [0, +3],
        color: '#b0c4de'
    },
    titanium: {
        number: 22,
        symbol: 'Ti',
        valences: [0, +2, +3, +4],
        color: '#c2d6d6'
    },
    vanadium: {
        number: 23,
        symbol: 'V',
        valences: [0, +2, +3, +4, +5],
        color: '#9fb1c8'
    },
    chromium: {
        number: 24,
        symbol: 'Cr',
        valences: [0, +2, +3, +6],
        color: '#8aa29a'
    },
    manganese: {
        number: 25,
        symbol: 'Mn',
        valences: [0, +2, +3, +4, +7],
        color: '#d08b6a'
    },
    iron: {
        number: 26,
        symbol: 'Fe',
        valences: [0, +2, +3],
        color: '#b7410e'
    },
    cobalt: {
        number: 27,
        symbol: 'Co',
        valences: [0, +2, +3],
        color: '#2a52be'
    },
    nickel: {
        number: 28,
        symbol: 'Ni',
        valences: [0, +2, +3],
        color: '#50c878'
    },
    copper: {
        number: 29,
        symbol: 'Cu',
        valences: [0, +1, +2],
        color: '#b87333'
    },
    zinc: {
        number: 30,
        symbol: 'Zn',
        valences: [0, +2],
        color: '#7da0b0'
    },
    gallium: {
        number: 31,
        symbol: 'Ga',
        valences: [+3],
        color: '#c39bd3'
    },
    germanium: {
        number: 32,
        symbol: 'Ge',
        valences: [-4, +2, +4],
        color: '#9ea7a6'
    },
    arsenic: {
        number: 33,
        symbol: 'As',
        valences: [-3, +3, +5],
        color: '#6e6e6e'
    },
    selenium: {
        number: 34,
        symbol: 'Se',
        valences: [-2, +4, +6],
        color: '#ffcc99'
    },
    bromine: {
        number: 35,
        symbol: 'Br',
        valences: [-1, +1, +5],
        color: '#a52a2a'
    },
    krypton: {
        number: 36,
        symbol: 'Kr',
        valences: [0, +2],
        color: '#9be3ff'
    },
    rubidium: {
        number: 37,
        symbol: 'Rb',
        valences: [+1],
        color: '#702f1f'
    },
    strontium: {
        number: 38,
        symbol: 'Sr',
        valences: [+2],
        color: '#fdbf5e'
    },
    yttrium: {
        number: 39,
        symbol: 'Y',
        valences: [0, +3],
        color: '#94ffff'
    },
    zirconium: {
        number: 40,
        symbol: 'Zr',
        valences: [0, +4],
        color: '#94e4e4'
    },
    niobium: {
        number: 41,
        symbol: 'Nb',
        valences: [0, +3, +5],
        color: '#73c2c9'
    },
    molybdenum: {
        number: 42,
        symbol: 'Mo',
        valences: [0, +3, +6],
        color: '#54b9b9'
    },
    technetium: {
        number: 43,
        symbol: 'Tc',
        valences: [0, +4, +6, +7],
        color: '#3d9fa0'
    },
    ruthenium: {
        number: 44,
        symbol: 'Ru',
        valences: [0, +3],
        color: '#248482'
    },
    rhodium: {
        number: 45,
        symbol: 'Rh',
        valences: [0, +3],
        color: '#0a7d8c'
    },
    palladium: {
        number: 46,
        symbol: 'Pd',
        valences: [0, +2, +4],
        color: '#006985'
    },
    silver: {
        number: 47,
        symbol: 'Ag',
        valences: [0, +1],
        color: '#c0c0c0'
    },
    cadmium: {
        number: 48,
        symbol: 'Cd',
        valences: [0, +2],
        color: '#ffd98d'
    },
    indium: {
        number: 49,
        symbol: 'In',
        valences: [+3],
        color: '#a67573'
    },
    tin: {
        number: 50,
        symbol: 'Sn',
        valences: [+2, +4],
        color: '#668080'
    },
    antimony: {
        number: 51,
        symbol: 'Sb',
        valences: [-3, +3, +5],
        color: '#9e63b5'
    },
    tellurium: {
        number: 52,
        symbol: 'Te',
        valences: [-2, +4, +6],
        color: '#d47a6a'
    },
    iodine: {
        number: 53,
        symbol: 'I',
        valences: [-1, +1, +5, +7],
        color: '#940094'
    },
    xenon: {
        number: 54,
        symbol: 'Xe',
        valences: [0, +2, +4, +5],
        color: '#429eb0'
    },
    cesium: {
        number: 55,
        symbol: 'Cs',
        valences: [+1],
        color: '#57178f'
    },
    barium: {
        number: 56,
        symbol: 'Ba',
        valences: [+2],
        color: '#00560f'
    },
    lanthanum: {
        number: 57,
        symbol: 'La',
        valences: [0, +3],
        color: '#70d4ff'
    },
    cerium: {
        number: 58,
        symbol: 'Ce',
        valences: [0, +3, +4],
        color: '#eeeedc'
    },
    praseodymium: {
        number: 59,
        symbol: 'Pr',
        valences: [0, +3],
        color: '#dafdb3'
    },
    neodymium: {
        number: 60,
        symbol: 'Nd',
        valences: [0, +3],
        color: '#ededc7'
    },
    promethium: {
        number: 61,
        symbol: 'Pm',
        valences: [0, +3],
        color: '#a1ffc0'
    },
    samarium: {
        number: 62,
        symbol: 'Sm',
        valences: [0, +2, +3],
        color: '#00ff99'
    },
    europium: {
        number: 63,
        symbol: 'Eu',
        valences: [0, +2, +3],
        color: '#eeeedc'
    },
    gadolinium: {
        number: 64,
        symbol: 'Gd',
        valences: [0, +3],
        color: '#eeeedc'
    },
    terbium: {
        number: 65,
        symbol: 'Tb',
        valences: [0, +3],
        color: '#eeeedc'
    },
    dysprosium: {
        number: 66,
        symbol: 'Dy',
        valences: [0, +3],
        color: '#eeeedc'
    },
    holmium: {
        number: 67,
        symbol: 'Ho',
        valences: [0, +3],
        color: '#eeeedc'
    },
    erbium: {
        number: 68,
        symbol: 'Er',
        valences: [0, +3],
        color: '#eeeedc'
    },
    thulium: {
        number: 69,
        symbol: 'Tm',
        valences: [0, +3],
        color: '#eeeedc'
    },
    ytterbium: {
        number: 70,
        symbol: 'Yb',
        valences: [0, +2, +3],
        color: '#eeeedc'
    },
    lutetium: {
        number: 71,
        symbol: 'Lu',
        valences: [0, +3],
        color: '#eeeedc'
    },
    hafnium: {
        number: 72,
        symbol: 'Hf',
        valences: [0, +4],
        color: '#4dc2ff'
    },
    tantalum: {
        number: 73,
        symbol: 'Ta',
        valences: [0, +5],
        color: '#4da6ff'
    },
    tungsten: {
        number: 74,
        symbol: 'W',
        valences: [0, +6],
        color: '#6a9dbb'
    },
    rhenium: {
        number: 75,
        symbol: 'Re',
        valences: [0, +4, +6, +7],
        color: '#267dab'
    },
    osmium: {
        number: 76,
        symbol: 'Os',
        valences: [0, +3, +4],
        color: '#266696'
    },
    iridium: {
        number: 77,
        symbol: 'Ir',
        valences: [0, +3, +4],
        color: '#175487'
    },
    platinum: {
        number: 78,
        symbol: 'Pt',
        valences: [0, +2, +4],
        color: '#d0d0e0'
    },
    gold: {
        number: 79,
        symbol: 'Au',
        valences: [0, +1, +3],
        color: '#ffd123'
    },
    mercury: {
        number: 80,
        symbol: 'Hg',
        valences: [0, +1, +2],
        color: '#b8b8d0'
    },
    thallium: {
        number: 81,
        symbol: 'Tl',
        valences: [0, +1, +3],
        color: '#a6544d'
    },
    lead: {
        number: 82,
        symbol: 'Pb',
        valences: [0, +2, +4],
        color: '#575961'
    },
    bismuth: {
        number: 83,
        symbol: 'Bi',
        valences: [0, +3, +5],
        color: '#af59bb'
    },
    polonium: {
        number: 84,
        symbol: 'Po',
        valences: [0, +2, +4],
        color: '#ab5c00'
    },
    astatine: {
        number: 85,
        symbol: 'At',
        valences: [],
        color: '#a99f66'
    },
    radon: {
        number: 86,
        symbol: 'Rn',
        valences: [0],
        color: '#42964f'
    },
    francium: {
        number: 87,
        symbol: 'Fr',
        valences: [+1],
        color: '#420066'
    },
    radium: {
        number: 88,
        symbol: 'Ra',
        valences: [+2],
        color: '#007d00'
    },
    actinium: {
        number: 89,
        symbol: 'Ac',
        valences: [0, +3],
        color: '#aaaaaa'
    },
    thorium: {
        number: 90,
        symbol: 'Th',
        valences: [0, +4],
        color: '#aaaaaa'
    },
    protactinium: {
        number: 91,
        symbol: 'Pa',
        valences: [0, +4, +5],
        color: '#aaaaaa'
    },
    uranium: {
        number: 92,
        symbol: 'U',
        valences: [0, +3, +4, +5, +6],
        color: '#6dcc7c'
    },
    neptunium: {
        number: 93,
        symbol: 'Np',
        valences: [0, +3, +4, +5, +6],
        color: '#45d7ae'
    },
    plutonium: {
        number: 94,
        symbol: 'Pu',
        valences: [0, +3, +4, +5, +6],
        color: '#e09c3d'
    },
    americium: {
        number: 95,
        symbol: 'Am',
        valences: [0, +3, +4, +5, +6],
        color: '#d0a3eb'
    },
    curium: {
        number: 96,
        symbol: 'Cm',
        valences: [0, +3],
        color: '#c1e9bd'
    },
    berkelium: {
        number: 97,
        symbol: 'Bk',
        valences: [0, +3, +4],
        color: '#617e6a'
    },
    californium: {
        number: 98,
        symbol: 'Cf',
        valences: [0, +3],
        color: '#617e6a'
    },
    einsteinium: {
        number: 99,
        symbol: 'Es',
        valences: [0],
        color: '#ff92df'
    },
    fermium: {
        number: 100,
        symbol: 'Fm',
        valences: [0],
        color: '#aaaaaa'
    },
    mendelevium: {
        number: 101,
        symbol: 'Md',
        valences: [0],
        color: '#aaaaaa'
    },
    nobelium: {
        number: 102,
        symbol: 'No',
        valences: [0],
        color: '#aaaaaa'
    },
    lawrencium: {
        number: 103,
        symbol: 'Lr',
        valences: [0],
        color: '#aaaaaa'
    },
    rutherfordium: {
        number: 104,
        symbol: 'Rf',
        valences: [0],
        color: '#aaaaaa'
    },
    dubnium: {
        number: 105,
        symbol: 'Db',
        valences: [0],
        color: '#aaaaaa'
    },
    seaborgium: {
        number: 106,
        symbol: 'Sg',
        valences: [0],
        color: '#aaaaaa'
    },
    bohrium: {
        number: 107,
        symbol: 'Bh',
        valences: [0],
        color: '#aaaaaa'
    },
    hassium: {
        number: 108,
        symbol: 'Hs',
        valences: [0],
        color: '#aaaaaa'
    },
    meitnerium: {
        number: 109,
        symbol: 'Mt',
        valences: [0],
        color: '#aaaaaa'
    },
    darmstadtium: {
        number: 110,
        symbol: 'Ds',
        valences: [0],
        color: '#aaaaaa'
    },
    roentgenium: {
        number: 111,
        symbol: 'Rg',
        valences: [0],
        color: '#aaaaaa'
    },
    copernicium: {
        number: 112,
        symbol: 'Cn',
        valences: [0],
        color: '#aaaaaa'
    },
    nihonium: {
        number: 113,
        symbol: 'Nh',
        valences: [0],
        color: '#aaaaaa'
    },
    flerovium: {
        number: 114,
        symbol: 'Fl',
        valences: [0],
        color: '#aaaaaa'
    },
    moscovium: {
        number: 115,
        symbol: 'Mc',
        valences: [0],
        color: '#aaaaaa'
    },
    livermorium: {
        number: 116,
        symbol: 'Lv',
        valences: [0],
        color: '#aaaaaa'
    },
    tennessine: {
        number: 117,
        symbol: 'Ts',
        valences: [0],
        color: '#aaaaaa'
    },
    oganesson: {
        number: 118,
        symbol: 'Og',
        valences: [0],
        color: '#aaaaaa'
    }
};

const sp3Angle = 109.5;

const electronegativities = [
    2.2, 0, 0.98, 1.57, 2.04, 2.55, 3.04, 3.44, 3.98, 0,
    0.93, 1.31, 1.61, 1.9, 2.19, 2.58, 3.16, 0,
    0.82, 1, 1.36, 1.54, 1.63, 1.66, 1.55, 1.83, 1.88, 1.91, 1.9, 1.65, 1.81, 2.01, 2.18, 2.55, 2.96, 3,
    0.82, 0.95, 1.22, 1.33, 1.6, 2.16, 1.9, 2.2, 2.28, 2.2, 1.93, 1.69, 1.78, 1.96, 2.05, 2.1, 2.66, 2.6,
    0.79, 0.89, 1.1, 1.12, 1.13, 1.14, 1.1, 1.2, 1.17, 1.1, 1.2, 1.2, 1.1, 1.22, 1.23, 1.24, 1.25, 1.1, 1.2, 1.27, 1.3, 1.5, 2.36, 1.9, 2.2, 2.2, 2.28, 2.54, 2, 1.62, 2.33, 2.02, 2, 2.2, 0, 0,
    0.9, 1.1, 1.3, 1.5, 1.38, 1.36, 1.28, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3
];

Object.values(ELEMENTS).forEach(element => {
    element.electronegativity = electronegativities[element.number - 1] || 0;
});


const numericPrefixes = {
    1: 'mono',
    2: 'di',
    3: 'tri',
    4: 'tetra',
    5: 'penta',
    6: 'hexa',
    7: 'hepta',
    8: 'octa',
    9: 'nona',
    10: 'deca',
    11: 'undeca',
    12: 'dodeca',
    20: 'icosa',
};

function getElementIdeName(name) {

    if (name.endsWith('ium') || name.endsWith('ine')) return name.slice(0, name.length - 3) + 'ide';
    if (name.endsWith('gen')) return name.slice(0, name.length - 4) + 'ide';
    if (name.endsWith('on')) return name.replace('on', 'ide');

    if (name === 'sulfur') return 'sulfide';
    if (name === 'phosphorus') return 'phosphide';
}



/** @param {string|number|ElementData} search */
function getElementBroad(search) {
    let findf = elem => false;
    if (typeof search === 'string') findf = (search.length > 2) ? (elem => elem[0] === search.toLowerCase()) : (elem => elem[1].symbol === toTitle(search));
    else if (typeof search === 'number') findf = (elem => elem[1].number === search);
    else if (typeof search === 'object') return getElementBroad(search.number);
    
    return Object.entries(ELEMENTS).find(findf);
}

/** @param {string|number} search @returns {ElementData} */
function getElement(search) {
    let el = getElementBroad(search);
    if (!el) return undefined;
    return el[1];
}
/** @param {string|number} search @returns {string} */
function getElementName(search) {
    return getElementBroad(search)[0];
}



/** @param {string|number|ElementData} search */
function getElementPeriod(search) {
    let el = (typeof search === 'object') ? search : getElement(search);
    if (!el) return undefined;

    let e = el.number;
    let count = 0;
    while (e > 0) {
        e -= shells[count];
        count++;
    }
    return count;
}

/** @param {string|number|ElementData} search */
function getElementGroup(search) {
    let el = (typeof search === 'object') ? search : getElement(search);
    if (!el) return undefined;

    const n = el.number;
    if ( // exception for the lanthanides and actinides
        (57 <= n && n <= 71) || (89 <= n && n <= 103)
    ) return 3; // they go in group 3 (IIIB)

    const p = getElementPeriod(el);
    let threshhold = 0;
    for (let i = 0; i < p-1; i++) threshhold += shells[i];
    const diff = n-threshhold;

    if (p === 1) // the gap in period 1 (poor hydrogen and helium, forever apart :broken_heart:)
        return 17*(n-1) + 1;
    if (p <= 3) // the gap in periods 2 and 3
        return diff + 10 * (diff > 2);
    return diff - 14 * (diff > 2); // periods 4 and 5 have to correct for those darn misfits (L&A)
}

/** @param {string|number|ElementData} search @returns {boolean} */
function isMetal(search) {
    let el = (typeof search === 'object') ? search : getElement(search);
    if (!el) return undefined;
    
    const g = getElementGroup(el);
    return (
        ((g < 13 && el.number > 1) || // all the metals on the left of the table
        [13, 31, 49, 50, 81, 82, 83, 84, 85].includes(el.number)) && // the weird metal staircase
        el.number < 109 // too high, so we don't know if it's a metal
    );
}

/** @param {string|number|ElementData} search @returns {boolean} */
function isMetalloid(search) {
    let el = (typeof search === 'object') ? search : getElement(search);
    if (!el) return undefined;

    return [5, 14, 32, 33, 51, 52].includes(el.number); // there aren't that many metalloids
}