const SORTERS = {
    // sorting functions take in two objects each in the form ["element_name", element_count]

    // if no carbon, sort alphabetically
    kakhaga: (a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;

        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;

        let i = 1;
        while (i < a.length) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
            i++;
        }
        return 0;
    },

    // if carbon present, sort organically
    carbon: (a, b) => {
        // first priority — carbon
        if (a[0] === 'C') return -1;
        if (b[0] === 'C') return 1;

        // second priority — hydrogen
        if (a[0] === 'H') return -1;
        if (b[0] === 'H') return 1;

        // otherwise alphabetical
        return SORTERS.kakhaga(a, b);
    },

    electronegativity: (a, b) => {
        const aobj = getElement(a[0]), bobj = getElement(b[0]);
        return aobj.electronegativity - bobj.electronegativity;
    },
}

const CHECKERS = {
    isItOrganic: (cObj) => {
        const elems = Object.keys(cObj);

        // is carbon present?
        if (!elems.includes('C')) return false; // if no, it's not organic!

        // is it an allotrope?
        if (elems.length === 1) return false; // then it's not organic!
        

        // is it a simple oxide, halide, or a binary metal carbide?
        if (elems.length === 2 && elems.some(
            k => (getElementGroup(k) === 17 || k === 'O' || isMetal(k) || isMetalloid(k))
        )) return false; // then it ain't organic!


        // is that carbon just part of some functional group?
        // ...those being carbonate, cyanide, cyanate, or thiocyanate...
        const m = new Molecule(
            ...(Object.entries(cObj).map(co => [...Array.from(co[1]).values()].map(a => new Atom(co[0]))).flat())
        );

        if ([
            GROUPS.carbonate, GROUPS.cyanide,
            GROUPS.cyanate, GROUPS.thiocyanate
        ].some(fg => m.matchesFunctionalGroup(fg).length > 0)) {
            return false; // then it IS NOT ORGANIC.
        }

        return true;
    },
}

/**
 * @typedef {Object} FuncGroupTemplate
 * @property {string[]} atoms
 * @property {string[]} bonds
 */

/** @type {Object.<string, FuncGroupTemplate>} */
const GROUPS = {
    'hydroxy': {
        atoms: ['O', 'H'],
        bonds: ['0>1']
    },
    'carboxyl': {
        atoms: ['C', 'O', 'O', 'H'],
        bonds: ['0>1:2', '0>2', '2>3']
    },
    'amino': {
        atoms: ['N', 'H', 'H'],
        bonds: ['0>1', '0>2']
    },
    'phosphate': {
        atoms: ['O', 'P', 'O', 'O', 'H', 'O', 'H'],
        bonds: ['0>1', '1>2:2', '1>3', '3>4', '1>5', '5>6']
    },
    'methyl': {
        atoms: ['C', 'H', 'H', 'H'],
        bonds: ['0>1', '0>2', '0>3']
    },
    'alkene': {
        atoms: ['C', 'C'],
        bonds: ['0>1:2']
    },
    'alkyne': {
        atoms: ['C', 'C'],
        bonds: ['0>1:3']
    },
    'benzene ring': {
        atoms: ['C', 'C', 'C', 'C', 'C', 'C'],
        bonds: ['0>1:2', '1>2', '2>3:2', '3>4', '4>5:2', '5>1']
    },
    'sulfate': {
        atoms: ['S', 'H'],
        bonds: ['0>1']
    },
    'aldehyde': {
        atoms: ['C', 'O', 'H'],
        bonds: ['0>1:2', '0>2']
    },
    'carboxylic acid': {
        atoms: ['C', 'O', 'O', 'H'],
        bonds: ['0>1:2', '0>2', '2>3']
    },
    'alkyl halide': {
        atoms: ['F,Cl,Br,I'],
        bonds: []
    },

    'carbonate': {
        atoms: ['C', 'O', 'O', 'O'],
        bonds: ['0>1', '0>2', '0>3']
    },
    'sulfate': {
        atoms: ['S', 'O', 'O', 'O', 'O'],
        bonds: ['0>1', '0>2', '0>3', '0>4']
    },
    'chlorate': {
        atoms: ['Cl', 'O', 'O', 'O'],
        bonds: ['0>1', '0>2', '0>3']
    },

    'cyanide': {
        atoms: ['C', 'N'],
        bonds: ['0>1:3']
    },
    'cyanate': {
        atoms: ['N', 'C', 'O'],
        bonds: ['0>1:2', '1>2:2']
    },
    'thiocyanate': {
        atoms: ['S', 'C', 'N'],
        bonds: ['0>1', '1>2:3']
    },
};



// --------------------------------- TS IS UNFINISHED ------------------------------- //
/**
 * Function must be used with a connected molecule.
 * @param {Molecule} mol
 */
function getOrganicRep(mol, atomId) {
    const m = mol.findMolConnected(atomId);
    const originAtom = m.atoms.findIndex(a => a.atomicNumber === 6);
    if (originAtom < 0) return {};

    // paths will be recorded as lists of atoms that go in sequence.
    // when a path of carbon branches, it will create two new paths,
    // which are named by index. Example:
    // path 0 has a branch -> paths 00 and 01 are created
    // path 01 has a branch -> paths 010. 011, and 012 are created
    const paths = {
        '0': [originAtom]
    };
    
    let currentA = originAtom;
    let currentPath = '0';
    
    const pathBuffer = ['0'];
    const atomsFound = [originAtom];
    while (pathBuffer.length > 0) {
        const set = m.findNeighborIndices(currentA).filter(aid => !atomsFound.includes(aid));

        const carbons = set.filter(aid => m.atoms[aid].atomicNumber === 6);
        if (carbons.length > 1) carbons.forEach((c, i) => { // branch in the path!
            paths[currentPath + String(i)] = [c];
            pathBuffer.push(currentPath + String(i));
            atomsFound.push(c);
        });
        else if (carbons.length === 1) {
            paths[currentPath].push(carbons[0]);
            atomsFound.push(carbons[0]);
        }

        const hydros = set.filter(aid => m.atoms[aid].atomicNumber === 1);
        hydros.forEach(h => {
            if (currentPath.includes('-')) // if connected to a non-carbon element
                paths[currentPath].push(h);
            atomsFound.push(h);
        });

        const allelse = set.filter(aid => ![1,6].includes(m.atoms[aid].atomicNumber));
        allelse.forEach(a => {
            if (currentPath.includes('-')) {
                paths[currentPath].push(a);
                return;
            }
            else {
                const pathname = String(currentPath) + '-' + String(paths[currentPath].length);
                paths[pathname] = [a];
                pathBuffer.push(pathname);
            }
            atomsFound.push(a);
        });

        if (set.filter(aid => !atomsFound.includes(aid)).length === 0) {
            currentPath = pathBuffer.shift();
            currentA = paths[currentPath][0];
        }
    }

    return paths;
}