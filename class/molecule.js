let activeAnimations = [];

class Molecule {
    /** @param {...Atom} atoms */
    constructor(...atoms) {
        /** @type {Array<Atom>} */
        this.atoms = atoms;
        /** @type {Array<{type: string, atom1: number, atom2: number, degree: number}>} */
        this.bonds = [];
        this.ionizations = atoms.map(a=>0);

        this.selectedAtoms = [];
    }

    get covalentBonds() {
        return this.bonds.filter(bond => bond.type === 'covalent');
    }

    get ionicBonds() {
        return this.bonds.filter(bond => bond.type === 'ionic');
    }
    
    /** @param {Atom} a */
    addAtom(a) {
        this.atoms.push(a);
    }



    findHoveredAtom() {
        let foundId = 0;
        for (const atom of this.atoms) {
            if (atom.checkIfMouseHover()) return foundId;
            foundId++;
        }
        return undefined;
    }

    findHoveredBond() {
        let foundId = 0;
        for (const bond of this.bonds) {
            const p1 = this.atoms[bond.atom1].pos.clone();
            const p2 = this.atoms[bond.atom2].pos.clone();
            const dist = findDistance(p1, p2, getMousePos());
            if (dist <= 15) return foundId;
            foundId++;
        }
        return undefined;
    }

    findBond(atomId1, atomId2) {
        return this.bonds.find(b => ((b.atom1 === atomId1) && (b.atom2 === atomId2)) || ((b.atom1 === atomId2) && (b.atom2 === atomId1)));
    }
    
    findBondIndex(atomId1, atomId2) {
        return this.bonds.findIndex(b => ((b.atom1 === atomId1) && (b.atom2 === atomId2)) || ((b.atom1 === atomId2) && (b.atom2 === atomId1)));
    }

    findBondsOf(atomId) {
        return this.bonds.filter(bond => (bond.atom1 === atomId || bond.atom2 === atomId));
    }

    destroyAtom(atomId) {
        this.destroyBondsOf(atomId);

        this.atoms.splice(atomId, 1);
        this.ionizations.splice(atomId, 1);
        this.bonds.forEach((b, i) => {
            b.atom1 -= (b.atom1 > atomId);
            b.atom2 -= (b.atom2 > atomId);
        });
    }

    destroyAtoms(...atomIds) {
        for (const atomId of atomIds.sort((a,b)=>b-a))
            this.destroyAtom(atomId);
    }

    createBond(type, atom1, atom2, degree) {
        if (degree <= 0) {
            alert("Hey, there can't be a nonpositive-order bond!");
            return false;
        }
        /*
        if (degree > this.atoms[atom1].valence || degree > this.atoms[atom2].valence) {
            alert("One or more of those molecules are already full.");
            return false;
        }
        */
        const match = this.findBondIndex(atom1, atom2);
        if (match !== -1) {
            if (this.bonds[match].type !== type) {
                alert("A bond of a different type is already there.");
                return false;
            }
            this.bonds[match].degree += Math.min(4-this.bonds[match].degree, degree);
            /*
            if (this.bonds[match].degree + degree <= 3) this.bonds[match].degree += degree;
            else {
                alert("Too much bonding! Sorry.");
                return;
            }
            */
        }
        else {
            this.bonds.push({ type, atom1, atom2, degree });
        }

        if (type === 'covalent') {
            this.atoms[atom1].share(degree);
            this.atoms[atom2].share(degree);
        }
        else if (type === 'ionic') {
            this.atoms[atom1].take(degree); // cation
            this.atoms[atom2].give(degree); // anion
        }
        return true;
    }

    destroyBond(atomId1, atomId2, degree = 1) {
        if (degree <= 0) {
            alert("Hey, there can't be a negative (or zero) covalent bond!");
            return;
        }
        const bondIndex = this.findBondIndex(atomId1, atomId2);
        if (bondIndex === -1) {
            alert("Uh, you're trying to break a bond that doesn't exist.");
            return;
        }

        const bond = this.bonds[bondIndex];

        if (bond.type === 'ionic') {
            const atom1 = this.atoms[atomId1];
            const atom2 = this.atoms[atomId2];
            if (bond.atom1 === atomId1) {
                atom1.give(degree);
                atom2.take(degree);
            }
            else {
                atom1.take(degree);
                atom2.give(degree);
            }
        }
        
        if (bond.degree > degree) bond.degree -= degree;
        else if (bond.degree <= degree) {
            this.bonds.splice(bondIndex, 1);
        }
    }

    destroyBondRef(bond) {
        this.destroyBond(bond.atom1, bond.atom2, bond.degree);
    }

    destroyBondsOf(atomId) {
        this.findBondsOf(atomId).forEach(b => this.destroyBondRef(b));
    }

    createCovalentBond(atomId1, atomId2, degree = 1) {
        this.createBond('covalent', atomId1, atomId2, degree);
    }

    createIonicBond(donor, recipient, degree = 1) {
        this.createBond('ionic', donor, recipient, degree);
    }

    ionize(atomId, amount) {
        if (this.ionizations[atomId] === undefined) this.ionizations[atomId] = 0;
        this.ionizations[atomId] += amount;
        this.atoms[atomId].ionize(amount);
    }

    reduce(atomId, amount = 1) {
        if (amount <= 0) return;
        this.ionize(atomId, amount);
    }

    oxidize(atomId, amount = 1) {
        if (amount <= 0) return;
        this.ionize(atomId, -amount);
    }

    flipBond(bondId) {
        const b =  this.bonds[bondId];
        if (b.type !== 'ionic') return;

        const a1 = b.atom1;
        b.atom1 = b.atom2;
        b.atom2 = a1;
    }



    findNeighborIndices(atomId) {
        const neighborBonds = this.bonds.filter(
            bond => bond.atom1 === atomId || bond.atom2 === atomId
        );

        const neighbors = neighborBonds.map(
            bond => bond.atom1 === atomId ? bond.atom2 : bond.atom1
        );
        return neighbors;
    }

    findNeighbors(atomId) {
        return this.findNeighborIndices(atomId).map((id) => this.atoms[id]);
    }

    findMolConnected(atomId) {
        const allConnected = [atomId];
        const bondsUsed = [];
        const newBonds = [];
        
        let sampleBonds = this.findBondsOf(atomId);
        while (sampleBonds.length > 0) {
            let connectedAtoms = [];

            for (const bond of sampleBonds) {
                const fa1 = allConnected.indexOf(bond.atom1);
                const fa2 = allConnected.indexOf(bond.atom2);
                
                const newBond = {};
                newBond.type = bond.type;
                newBond.degree = bond.degree;
                if (fa1 < 0) {
                    newBond.atom1 = allConnected.length;
                    allConnected.push(bond.atom1);
                    
                    connectedAtoms.push(bond.atom1);
                }
                else newBond.atom1 = fa1;
                if (fa2 < 0) {
                    newBond.atom2 = allConnected.length;
                    allConnected.push(bond.atom2);

                    connectedAtoms.push(bond.atom2);
                }
                else newBond.atom2 = fa2;

                newBonds.push(newBond);
                bondsUsed.push(bond);
            }
            
            sampleBonds = connectedAtoms.map(a => this.findBondsOf(a)).flat().filter(b => !bondsUsed.includes(b));
        }

        const m = new Mol2D(...allConnected.map(aid => cloneAtom2D(this.atoms[aid])));
        for (const b of newBonds) m.createBond(b.type, b.atom1, b.atom2, b.degree);

        return m;
    }

    /**
     * Finds the set of all atoms connected to a certain atom, including itself.
     * @param {number} atomId
     * @returns {number[]}
     */
    findAllConnected(atomId) {
        const allConnected = [atomId];
        
        let sampleAtoms = this.findNeighborIndices(atomId);
        while (sampleAtoms.length > 0) {
            for (const atom of sampleAtoms) allConnected.push(atom);

            sampleAtoms = sampleAtoms.map((aid) =>
                this.findNeighborIndices(aid)).flat()
                .filter(aid => !allConnected.includes(aid));
        }

        return [...allConnected];
    }

    /**
     * Finds the set of all atoms connected to a certain atom, including itself.
     * Outputs all atoms, separated into parts that are ionically bonded.
     * @param {number} atomId
     * @returns {number[][]}
     */
    findIonsConnected(atomId) {
        const allConnected = [[atomId]];
        
        let sampleAtoms = [[atomId, 0]];
        while (sampleAtoms.length > 0) {
            const slice = sampleAtoms.splice(0, 1)[0];

            const neighs = this.findNeighborIndices(slice[0]).filter(aid => !allConnected.flat().includes(aid));
            const grpIds = [];
            for (const n of neighs) {
                if (this.findBond(slice[0], n).type === 'ionic') {
                    allConnected.push([n]);
                    grpIds.push(allConnected.length-1);
                }
                else {
                    allConnected[slice[1]].push(n);
                    grpIds.push(slice[1]);
                }
            }


            sampleAtoms.push(
                ...neighs.map((n, i) => [n, grpIds[i]])
            );
        }

        return [...allConnected];
    }

    

    translateWhole(delta) {
        for (const atom of this.atoms) atom.pos.add(delta);
        saveChange();
    }

    translateAllConnected(id, delta) {
        const connectedAtoms = this.findAllConnected(id);
        for (const id of connectedAtoms) this.atoms[id].pos.add(delta);
        saveChange();
    }
    
    translateOne(id, delta) {
        this.atoms[id].pos.add(delta);
        saveChange();
    }

    translateSome(delta, ...ids) {
        for (const id of ids) this.atoms[id].pos.add(delta);
        saveChange();
    }



    findShortestPath(startId, endId) {
        const paths = [[startId]];
        const visited = new Set();
        visited.add(startId);

        while (paths.length > 0) {
            const currentPath = paths.shift();
            const currentAtom = currentPath.at(-1);

            if (currentAtom === endId) {
                return currentPath;
            }

            for (const neigh of this.findNeighborIndices(currentAtom)) {
                if (visited.has(neigh)) continue;
                visited.add(neigh);
                const newPath = [...currentPath, neigh];
                paths.push(newPath);
            }
        }
        return null;
    }

    findCenterAtom(sampleeId) {
        const atomSample = this.findAllConnected(sampleeId);

        let max = Infinity;
        const sums = atomSample.map(aId => {
            // finding distance sums for each atom
            const distances = atomSample.filter(bId => bId !== aId).map(bId => {
                return this.findShortestPath(aId, bId).length - 1;
            });
            const sum = distances.reduce((a,b)=>a+b, 0);
            if (sum < max) max = sum;
            return sum;
        });

        const centers = sums.filter(sum => sum === max).map((sum, i) => atomSample[i]);
        return Boolean(centers) ? centers : null;
    }

    getSectionObjs() {
        // get different sections
        const sections = [];
        this.atoms.forEach((atom, id) => {
            if (sections.flat(2).includes(id)) return;
            sections.push(this.findAllConnected(id));
        });

        // get counts per section
        // counts is an array of arrays of cObjs. Each subfolder is a different section,
        // and each subsubfolder is an ion in a compound.
        const counts = [];
        const sectionCharges = [];
        for (const sec of sections) {
            const ions = this.findIonsConnected(sec[0]);

            const ionCounts = [];
            const ionCharges = [];
            for (const ion of ions) {
                let subsectionCharge = 0;

                const cObj = {};
                for (const aid of ion) {
                    const atom = this.atoms[aid];
                    subsectionCharge += atom.charge || 0;
    
                    const chargediff = Math.abs(atom.charge) > 1 ? Math.abs(atom.charge) : '';
                    const sym = atom.elemData.symbol;
    
                    if (cObj[sym] === undefined) cObj[sym] = 0;
                    cObj[sym]++;
                }

                ionCounts.push(cObj);
                ionCharges.push(subsectionCharge);
            }
            sectionCharges.push(ionCharges);
            counts.push(ionCounts);
        }

        const newCounts = counts.map((cObjs, i) => {
            if (cObjs.length > 1) {
                const cations = cObjs.filter((ion, ii) => sectionCharges[i][ii] >= 0);
                const anions = cObjs.filter((ion, ii) => sectionCharges[i][ii] < 0);
                const newCat = {};
                const newAn = {};
                cations.forEach(cation => {
                    for (const [el, cnt] of Object.entries(cation)) {
                        if (newCat[el] === undefined) newCat[el] = 0;
                        newCat[el] += cnt;
                    }
                });
                anions.forEach(anion => {
                    for (const [el, cnt] of Object.entries(anion)) {
                        if (newAn[el] === undefined) newAn[el] = 0;
                        newAn[el] += cnt;
                    }
                });
                sectionCharges[i] = sectionCharges[i].reduce((a, b) => a + b, 0);
                return { cations: newCat, anions: newAn };
            }
            else {
                const compound = cObjs[0];
                const newCmp = {};

                for (const [el, cnt] of Object.entries(compound)) {
                    if (newCmp[el] === undefined) newCmp[el] = 0;
                    newCmp[el] += cnt;
                }

                sectionCharges[i] = sectionCharges[i].reduce((a, b) => a + b, 0);
                return newCmp;
            }
        });

        const sectionObjs = newCounts.map((cmpd, idx) => {
            const findFunc = (cObj) => (
                CHECKERS.isItOrganic(cObj)
                ? SORTERS.carbon
                : (
                    Object.keys(cObj).length === 2
                    ? SORTERS.electronegativity
                    : SORTERS.kakhaga
                )
            );

            if (cmpd.cations !== undefined) {
                const sortedCats = Object.entries(cmpd.cations).toSorted(findFunc(cmpd.cations));
                const sortedAns = Object.entries(cmpd.anions).toSorted(findFunc(cmpd.anions));
    
                return {
                    cations: Object.fromEntries(sortedCats),
                    anions: Object.fromEntries(sortedAns),
                    charge: sectionCharges[idx]
                };
            }
            else {
                const sortedCmpd = Object.entries(cmpd).toSorted(findFunc(cmpd));
                return Object.fromEntries(sortedCmpd);
            }
        });

        return sectionObjs;
    }

    getFormula() {
        const secObj = this.getSectionObjs();
        
        // get each part's formula
        const sectionStrs = secObj.map(cmpd => {

            const getS = cm => Object.entries(cm).map(([sym, count]) => {
                if (count === 1) return sym;
                return sym + toSubscript(count);
            }).join('');

            let symbolout = '';
            if (cmpd.cations === undefined)
                symbolout = getS(cmpd);
            else
                symbolout = getS(cmpd.cations) + getS(cmpd.anions);

    
            const tCharge = cmpd.charge;

            // build unicode superscript for net charge (sign then magnitude)
            let netChargeSup = '';
            if (tCharge !== 0 && tCharge !== undefined) {
                const signChar = tCharge > 0 ? '⁺' : '⁻';
                const mag = Math.abs(tCharge);
                const magSup = mag > 1 ? String(mag).split('').map(d => superscriptMap[d]).join('') : '';
                netChargeSup = signChar + magSup;
            }
            return symbolout + netChargeSup;
        });

        const seenObj = {};
        for (const section of sectionStrs) {
            if (Object.keys(seenObj).includes(section)) seenObj[section]++;
            else seenObj[section] = 1;
        }
        return Object.entries(seenObj).map((ent) => (ent[1] > 1 ? `${ent[1]} ` : '') + ent[0]).join(' + ');
    };

    getName() {
        const secObj = this.getSectionObjs();

        const mixprefix = (pref, root) => {
            const fix = [pref[pref.length-1], root[0]].every(c => 'oa'.includes(c))
                ? root.slice(1, root.length) : root;
            return pref + fix;
        }
        const getOnesWith = (num, suffix) => {
            if (num <= 0 || num >= 10) return undefined;

            let on;
            if (num === 1) on = 'hen';
            if (num === 2) on = 'do';
            else on = numericPrefixes[num];
            
            return on + (num > 1 ? suffix.slice(1, suffix.length - 1) : suffix);
        }
        
        const sectionStrs = secObj.map(cmpd => {

            const getS = cm => Object.entries(cm).map(([sym, count], i) => {
                const root = getElementName(sym);
                let pfix;

                const rem = count % 10;
                const tens = (count - rem) / 10;
                if (count === 1 && i === 0) pfix = '';
                else if (count <= 12) pfix = numericPrefixes[count];
                else if (count < 20) pfix = numericPrefixes[rem] + 'deca';
                else if (count < 30) pfix = getOnesWith(rem, 'icosa');
                else if (count < 100) pfix = getOnesDigit(rem) + numericPrefixes[tens] + 'conta';

                return mixprefix(pfix, (i <= 0) ? root : getElementIdeName(root));
            }).filter(s => !!s).join(' ');

            const getBinIonic = (cm, an) => Object.entries(cm).map(([sym, count], i) => {
                const root = getElementName(sym);
                return (an) ? getElementIdeName(root) : root;
            }).filter(s => !!s).join(' ');


            if (cmpd.cations === undefined) {
                if (Object.keys(cmpd).length > 2) return '';
                return getS(cmpd);
            }
            else {
                if (Object.keys(cmpd.cations).length > 2 || Object.keys(cmpd.anions).length > 2) return '';
                const catStr = getBinIonic(cmpd.cations, false);
                const anStr = getBinIonic(cmpd.anions, true);
                return catStr + ' ' + anStr;
            }
        });

        return sectionStrs.filter(s => !!s).join(' and ');
    }



    /** @param {FuncGroupTemplate} template */
    matchesFunctionalGroup(template) {
        const atomCount = template.atoms.length;

        // Candidate molecule atoms for each template atom
        const candidates = template.atoms.map(sym =>
            this.atoms
                .map((atom, i) => sym.split(',').includes(atom.elemData.symbol) ? i : null)
                .filter(sym => sym !== null)
        );

        // If any template atom has no candidates, impossible
        if (candidates.some(c => c.length === 0)) return [];

        // Try all combinations by permutations
        const allPerms = candidates.reduce(
            (acc, curr) =>  
                acc.flatMap(a => curr.map(c => [...a, c])),
            [[]]
        ).filter(arr => arr.length === atomCount);

        for (const perm of allPerms) {
            // Ensure unique atoms
            if (new Set(perm).size !== atomCount) continue;

            // Check bonds
            let valid = true;

            for (const bond of template.bonds) {
                const entries = bond.split(/[>:]/g);

                const atomA = perm[Number(entries[0])];
                const atomB = perm[Number(entries[1])];

                
                const realBond = this.findBond(atomA, atomB);

                const degree = entries[2] ? Number(entries[2]) : 1;

                if (
                    !realBond || realBond.degree !== degree ||
                    (bond[bond.length - 1] === 'i' && realBond.type !== 'ionic')
                ) {
                    valid = false;
                    break;
                }
            }

            if (valid) return perm;
        }

        return [];
    }

    analyze() {
        const matches = [];
        const allatoms = [];

        for (const [name, fgmol] of Object.entries(GROUPS)) {
            const highlightees = this.matchesFunctionalGroup(fgmol);
            if (highlightees == '') continue;

            matches.push(name);
            allatoms.push(highlightees);
        }

        return { groups: matches, atoms: allatoms };
    }

    drawDiagram() {
        const diagramCanvas = document.querySelector('canvas#diagramcanvas');
        const ctx = diagramCanvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerAtom = this.findCenterAtom(0);
        const moleculeGroup = this.findAllConnected(0);

        // drawing settings
        ctx.save();
        ctx.translate(diagramCanvas.width / 2, diagramCanvas.height / 2);
        ctx.font = '48px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';



        const centerSymbol = this.atoms[centerAtom[0]].elemData.symbol;
        ctx.fillText(centerSymbol, 0, 0);

        // NOTE: GENERALIZE `centerAtom[0]`

        const positions = new Map();
        positions.set(centerAtom[0], new Victor(0, 0));

        const depth = new Map();
        depth.set(centerAtom[0], 0);

        let queue = [centerAtom[0]];
        let visited = new Set([centerAtom[0]]);

        while (queue.length > 0) {
            const currentAtom = queue.shift();
            const currentDepth = depth.get(currentAtom);
            const currentPos = positions.get(currentAtom);

            const neighbors = this.findNeighborIndices(currentAtom);

            neighbors.forEach(neigh => {
                if (visited.has(neigh)) return;
                visited.add(neigh);
                queue.push(neigh);


            });
        }



        ctx.restore();
    }
}



/** @param {Molecule} molecule */
function cloneMolecule(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.elemData, new Victor(a.pos.x, a.pos.y));
        return newA;
    });

    const m = new Molecule(...mAtoms);
    for (const bond of molecule.bonds) {
        m.createBond(bond.type, bond.atom1, bond.atom2, bond.degree);
    }
    for (const [aidStr, charge] of Object.entries(molecule.ionizations)) m.ionize(Number(aidStr), charge);
    return m;
}
/** @param {Molecule} molecule */
function cloneMoleculeOnto(molecule, objmol) {
    for (const bond of molecule.bonds) {
        objmol.createBond(bond.type, bond.atom1, bond.atom2, bond.degree);
    }
    for (const [aidStr, charge] of Object.entries(molecule.ionizations)) objmol.ionize(Number(aidStr), charge);
    return objmol;
}
/** @param {Molecule} molecule */
function cloneMolecule2D(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.atomicNumber, new Victor(a.pos.x ?? 0, a.pos.y ?? 0));
        return newA;
    });

    let m = new Mol2D(...mAtoms);
    return cloneMoleculeOnto(molecule, m);
}
/** @param {Molecule} molecule */
function cloneMolecule3D(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.atomicNumber, new Victor3(a.pos.x ?? 0, a.pos.y ?? 0, a.pos.z ?? 0));
        return newA;
    });

    let m = new Mol3D(...mAtoms);
    return cloneMoleculeOnto(molecule, m);
}