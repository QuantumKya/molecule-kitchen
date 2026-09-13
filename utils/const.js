
const shells = [2, 8, 8, 18, 18, 32, 32];

const ELEMENTS = {
    hydrogen: {
        number: 1,
        symbol: 'H',
        valence: 1,
        color: '#ffffff',
    },
    helium: {
        number: 2,
        symbol: 'He',
        valence: 0,
        color: '#ffeded'
    },
    lithium: {
        number: 3,
        symbol: 'Li',
        valence: -1,
        color: '#ecb394'
    },
    beryllium: {
        number: 4,
        symbol: 'Be',
        valence: 2,
        color: '#938a7e'
    },
    boron: {
        number: 5,
        symbol: 'B',
        valence: 3,
        color: '#987a5b'
    },
    carbon: {
        number: 6,
        symbol: 'C',
        valence: 4,
        color: '#505050',
    },
    nitrogen: {
        number: 7,
        symbol: 'N',
        valence: 3,
        color: '#3434d5',
    },
    oxygen: {
        number: 8,
        symbol: 'O',
        valence: 2,
        color: '#ba0909',
    },
    flourine: {
        number: 9,
        symbol: 'F',
        valence: 1,
        color: '#b7faff'
    },
    neon: {
        number: 10,
        symbol: 'Ne',
        valence: 0,
        color: '#4be791'
    },
    sodium: {
        number: 11,
        symbol: 'Na',
        valence: -1,
        color: '#ff1500',
    },
    magnesium: {
        number: 12,
        symbol: 'Mg',
        valence: -2,
        color: '#e45c32',
    },
    aluminum: {
        number: 13,
        symbol: 'Al',
        valence: -3,
        color: '#c3d0d9',
    },
    silicon: {
        number: 14,
        symbol: 'Si',
        valence: 4,
        color: '#7393b3'
    },
    phosphorus: {
        number: 15,
        symbol: 'P',
        valence: 3,
        color: '#c18f2c',
    },
    sulfur: {
        number: 16,
        symbol: 'S',
        valence: 6,
        color: '#ecd800',
    },
    chlorine: {
        number: 17,
        symbol: 'Cl',
        valence: 1,
        color: '#00e980',
    },
    argon: {
        number: 18,
        symbol: 'Ar',
        valence: 0,
        color: '#c097e3'
    },
    potassium: {
        number: 19,
        symbol: 'K',
        valence: -1,
        color: '#cecece',
    },
    calcium: {
        number: 20,
        symbol: 'Ca',
        valence: -2,
        color: '#f1f1f1',
    },
    scandium: {
        number: 21,
        symbol: 'Sc',
        valence: 3,
        color: '#b0c4de'
    },
    titanium: {
        number: 22,
        symbol: 'Ti',
        valence: 4,
        color: '#c2d6d6'
    },
    vanadium: {
        number: 23,
        symbol: 'V',
        valence: 5,
        color: '#9fb1c8'
    },
    chromium: {
        number: 24,
        symbol: 'Cr',
        valence: 6,
        color: '#8aa29a'
    },
    manganese: {
        number: 25,
        symbol: 'Mn',
        valence: 7,
        color: '#d08b6a'
    },
    iron: {
        number: 26,
        symbol: 'Fe',
        valence: 2,
        color: '#b7410e'
    },
    cobalt: {
        number: 27,
        symbol: 'Co',
        valence: 2,
        color: '#2a52be'
    },
    nickel: {
        number: 28,
        symbol: 'Ni',
        valence: 2,
        color: '#50c878'
    },
    copper: {
        number: 29,
        symbol: 'Cu',
        valence: 1,
        color: '#b87333'
    },
    zinc: {
        number: 30,
        symbol: 'Zn',
        valence: 2,
        color: '#7da0b0'
    },
    gallium: {
        number: 31,
        symbol: 'Ga',
        valence: 3,
        color: '#c39bd3'
    },
    germanium: {
        number: 32,
        symbol: 'Ge',
        valence: 4,
        color: '#9ea7a6'
    },
    arsenic: {
        number: 33,
        symbol: 'As',
        valence: 3,
        color: '#6e6e6e'
    },
    selenium: {
        number: 34,
        symbol: 'Se',
        valence: 2,
        color: '#ffcc99'
    },
    bromine: {
        number: 35,
        symbol: 'Br',
        valence: 1,
        color: '#a52a2a'
    },
    krypton: {
        number: 36,
        symbol: 'Kr',
        valence: 0,
        color: '#9be3ff'
    },
    rubidium: {
        number: 37,
        symbol: 'Rb',
        valence: -1,
        color: '#702f1f'
    },
    strontium: {
        number: 38,
        symbol: 'Sr',
        valence: -2,
        color: '#fdbf5e'
    },
    yttrium: {
        number: 39,
        symbol: 'Y',
        valence: 3,
        color: '#94ffff'
    },
    zirconium: {
        number: 40,
        symbol: 'Zr',
        valence: 4,
        color: '#94e4e4'
    },
    niobium: {
        number: 41,
        symbol: 'Nb',
        valence: 5,
        color: '#73c2c9'
    },
    molybdenum: {
        number: 42,
        symbol: 'Mo',
        valence: 6,
        color: '#54b9b9'
    },
    technetium: {
        number: 43,
        symbol: 'Tc',
        valence: 7,
        color: '#3d9fa0'
    },
    ruthenium: {
        number: 44,
        symbol: 'Ru',
        valence: 8,
        color: '#248482'
    },
    rhodium: {
        number: 45,
        symbol: 'Rh',
        valence: 3,
        color: '#0a7d8c'
    },
    palladium: {
        number: 46,
        symbol: 'Pd',
        valence: 2,
        color: '#006985'
    },
    silver: {
        number: 47,
        symbol: 'Ag',
        valence: 1,
        color: '#c0c0c0'
    },
    cadmium: {
        number: 48,
        symbol: 'Cd',
        valence: 2,
        color: '#ffd98d'
    },
    indium: {
        number: 49,
        symbol: 'In',
        valence: 3,
        color: '#a67573'
    },
    tin: {
        number: 50,
        symbol: 'Sn',
        valence: 4,
        color: '#668080'
    },
    antimony: {
        number: 51,
        symbol: 'Sb',
        valence: 3,
        color: '#9e63b5'
    },
    tellurium: {
        number: 52,
        symbol: 'Te',
        valence: 2,
        color: '#d47a6a'
    },
    iodine: {
        number: 53,
        symbol: 'I',
        valence: 1,
        color: '#940094'
    },
    xenon: {
        number: 54,
        symbol: 'Xe',
        valence: 0,
        color: '#429eb0'
    },
    cesium: {
        number: 55,
        symbol: 'Cs',
        valence: -1,
        color: '#57178f'
    },
    barium: {
        number: 56,
        symbol: 'Ba',
        valence: -2,
        color: '#00560f'
    },
    lanthanum: {
        number: 57,
        symbol: 'La',
        valence: 3,
        color: '#70d4ff'
    },
    cerium: {
        number: 58,
        symbol: 'Ce',
        valence: 3,
        color: '#eeeedc'
    },
    praseodymium: {
        number: 59,
        symbol: 'Pr',
        valence: 3,
        color: '#dafdb3'
    },
    neodymium: {
        number: 60,
        symbol: 'Nd',
        valence: 3,
        color: '#ededc7'
    },
    promethium: {
        number: 61,
        symbol: 'Pm',
        valence: 3,
        color: '#a1ffc0'
    },
    samarium: {
        number: 62,
        symbol: 'Sm',
        valence: 3,
        color: '#00ff99'
    },
    europium: {
        number: 63,
        symbol: 'Eu',
        valence: 3,
        color: '#eeeedc'
    },
    gadolinium: {
        number: 64,
        symbol: 'Gd',
        valence: 3,
        color: '#eeeedc'
    },
    terbium: {
        number: 65,
        symbol: 'Tb',
        valence: 3,
        color: '#eeeedc'
    },
    dysprosium: {
        number: 66,
        symbol: 'Dy',
        valence: 3,
        color: '#eeeedc'
    },
    holmium: {
        number: 67,
        symbol: 'Ho',
        valence: 3,
        color: '#eeeedc'
    },
    erbium: {
        number: 68,
        symbol: 'Er',
        valence: 3,
        color: '#eeeedc'
    },
    thulium: {
        number: 69,
        symbol: 'Tm',
        valence: 3,
        color: '#eeeedc'
    },
    ytterbium: {
        number: 70,
        symbol: 'Yb',
        valence: 3,
        color: '#eeeedc'
    },
    lutetium: {
        number: 71,
        symbol: 'Lu',
        valence: 3,
        color: '#eeeedc'
    },
    hafnium: {
        number: 72,
        symbol: 'Hf',
        valence: 4,
        color: '#4dc2ff'
    },
    tantalum: {
        number: 73,
        symbol: 'Ta',
        valence: 5,
        color: '#4da6ff'
    },
    tungsten: {
        number: 74,
        symbol: 'W',
        valence: 6,
        color: '#6a9dbb'
    },
    rhenium: {
        number: 75,
        symbol: 'Re',
        valence: 6,
        color: '#267dab'
    },
    osmium: {
        number: 76,
        symbol: 'Os',
        valence: 4,
        color: '#266696'
    },
    iridium: {
        number: 77,
        symbol: 'Ir',
        valence: 4,
        color: '#175487'
    },
    platinum: {
        number: 78,
        symbol: 'Pt',
        valence: 4,
        color: '#d0d0e0'
    },
    gold: {
        number: 79,
        symbol: 'Au',
        valence: 3,
        color: '#ffd123'
    },
    mercury: {
        number: 80,
        symbol: 'Hg',
        valence: 2,
        color: '#b8b8d0'
    },
    thallium: {
        number: 81,
        symbol: 'Tl',
        valence: 1,
        color: '#a6544d'
    },
    lead: {
        number: 82,
        symbol: 'Pb',
        valence: 4,
        color: '#575961'
    },
    bismuth: {
        number: 83,
        symbol: 'Bi',
        valence: 3,
        color: '#af59bb'
    },
    polonium: {
        number: 84,
        symbol: 'Po',
        valence: 2,
        color: '#ab5c00'
    },
    astatine: {
        number: 85,
        symbol: 'At',
        valence: 1,
        color: '#a99f66'
    },
    radon: {
        number: 86,
        symbol: 'Rn',
        valence: 0,
        color: '#42964f'
    },
    francium: {
        number: 87,
        symbol: 'Fr',
        valence: -1,
        color: '#420066'
    },
    radium: {
        number: 88,
        symbol: 'Ra',
        valence: -2,
        color: '#007d00'
    },
    actinium: {
        number: 89,
        symbol: 'Ac',
        valence: 3,
        color: '#aaaaaa'
    },
    thorium: {
        number: 90,
        symbol: 'Th',
        valence: 4,
        color: '#aaaaaa'
    },
    protactinium: {
        number: 91,
        symbol: 'Pa',
        valence: 5,
        color: '#aaaaaa'
    },
    uranium: {
        number: 92,
        symbol: 'U',
        valence: 6,
        color: '#6dcc7c'
    },
    neptunium: {
        number: 93,
        symbol: 'Np',
        valence: 6,
        color: '#45d7ae'
    },
    plutonium: {
        number: 94,
        symbol: 'Pu',
        valence: 6,
        color: '#e09c3d'
    },
    americium: {
        number: 95,
        symbol: 'Am',
        valence: 6,
        color: '#d0a3eb'
    },
    curium: {
        number: 96,
        symbol: 'Cm',
        valence: 6,
        color: '#c1e9bd'
    },
    berkelium: {
        number: 97,
        symbol: 'Bk',
        valence: 3,
        color: '#617e6a'
    },
    californium: {
        number: 98,
        symbol: 'Cf',
        valence: 3,
        color: '#617e6a'
    },
    einsteinium: {
        number: 99,
        symbol: 'Es',
        valence: 3,
        color: '#ff92df'
    },
    fermium: {
        number: 100,
        symbol: 'Fm',
        valence: 3,
        color: '#aaaaaa'
    },
    mendelevium: {
        number: 101,
        symbol: 'Md',
        valence: 3,
        color: '#aaaaaa'
    },
    nobelium: {
        number: 102,
        symbol: 'No',
        valence: 3,
        color: '#aaaaaa'
    },
    lawrencium: {
        number: 103,
        symbol: 'Lr',
        valence: 3,
        color: '#aaaaaa'
    },
    rutherfordium: {
        number: 104,
        symbol: 'Rf',
        valence: 4,
        color: '#aaaaaa'
    },
    dubnium: {
        number: 105,
        symbol: 'Db',
        valence: 5,
        color: '#aaaaaa'
    },
    seaborgium: {
        number: 106,
        symbol: 'Sg',
        valence: 6,
        color: '#aaaaaa'
    },
    bohrium: {
        number: 107,
        symbol: 'Bh',
        valence: 7,
        color: '#aaaaaa'
    },
    hassium: {
        number: 108,
        symbol: 'Hs',
        valence: 8,
        color: '#aaaaaa'
    },
    meitnerium: {
        number: 109,
        symbol: 'Mt',
        valence: 9,
        color: '#aaaaaa'
    },
    darmstadtium: {
        number: 110,
        symbol: 'Ds',
        valence: 10,
        color: '#aaaaaa'
    },
    roentgenium: {
        number: 111,
        symbol: 'Rg',
        valence: 11,
        color: '#aaaaaa'
    },
    copernicium: {
        number: 112,
        symbol: 'Cn',
        valence: 12,
        color: '#aaaaaa'
    },
    nihonium: {
        number: 113,
        symbol: 'Nh',
        valence: 1,
        color: '#aaaaaa'
    },
    flerovium: {
        number: 114,
        symbol: 'Fl',
        valence: 4,
        color: '#aaaaaa'
    },
    moscovium: {
        number: 115,
        symbol: 'Mc',
        valence: 1,
        color: '#aaaaaa'
    },
    livermorium: {
        number: 116,
        symbol: 'Lv',
        valence: 2,
        color: '#aaaaaa'
    },
    tennessine: {
        number: 117,
        symbol: 'Ts',
        valence: 1,
        color: '#aaaaaa'
    },
    oganesson: {
        number: 118,
        symbol: 'Og',
        valence: 0,
        color: '#aaaaaa'
    }
};

function getElementBroad(search) {
    let findf = elem => false;
    if (typeof search === 'string') findf = (search.length > 2) ? (elem => elem[0] === search) : (elem => elem[1].symbol === search);
    else if (typeof search === 'number') findf = (elem => elem[1].number === search);
    else if (typeof search === 'object') findf = (elem => search.symbol === elem.symbol);
    
    return Object.entries(ELEMENTS).find(findf);
}

/** @param {string|number} search @returns {object} */
function getElement(search) {
    let el = getElementBroad(search);
    if (!el) return undefined;
    return el[1];
}
/** @param {string|number} search @returns {string} */
function getElementName(search) {
    return getElementBroad(search)[0];
}