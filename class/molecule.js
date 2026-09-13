let activeAnimations = [];

class Molecule {
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
    
    update() {

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

    getBondsOf(atomId) {
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
            this.atoms[atom1].valence -= degree;
            this.atoms[atom2].valence -= degree;
        }
        else if (type === 'ionic') {
            // cation
            this.atoms[atom1].charge += degree;
            this.atoms[atom1].valence += degree;
            // anion
            this.atoms[atom2].charge -= degree;
            this.atoms[atom2].valence -= degree;
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
            alert("Uh, you're trying to break a bond that doesn't exist.\nThat sounds like it could be poetic but I can't let you do it here.");
            return;
        }

        const bond = this.bonds[bondIndex];
        
        this.atoms[atomId1].valence += Math.min(degree, bond.degree);
        this.atoms[atomId2].valence += Math.min(degree, bond.degree);
        if (bond.type === 'ionic') {
            const atom1 = this.atoms[atomId1];
            const atom2 = this.atoms[atomId2];
            if (bond.atom1 === atomId1) {
                atom1.charge += degree;
                atom2.charge -= degree;
            }
            else {
                atom2.charge += degree;
                atom1.charge -= degree;
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
        this.getBondsOf(atomId).forEach(b => this.destroyBondRef(b));
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
        this.atoms[atomId].charge += amount;
    }

    reduce(atomId, amount = 1) {
        if (amount <= 0) return;
        this.ionize(atomId, -amount);
    }

    oxidize(atomId, amount = 1) {
        if (amount <= 0) return;
        this.ionize(atomId, amount);
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

    findAllConnected(atomId) {
        const allConnected = new Set();
        allConnected.add(atomId);
        
        let sampleAtoms = this.findNeighborIndices(atomId);
        let predicate = sampleAtoms.reduce((pc, aid) => pc || !allConnected.has(aid), false);
        while (predicate) {
            for (const atom of sampleAtoms) allConnected.add(atom);

            sampleAtoms = sampleAtoms.map((aid) => this.findNeighborIndices(aid)).flat();
            predicate = sampleAtoms.reduce((pc, aid) => pc || !allConnected.has(aid), false);
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

    getFormula() {
        // get different sections
        const sections = [];
        this.atoms.forEach((atom, id) => {
            if (sections.flat().includes(id)) return;
            sections.push(this.findAllConnected(id));
        });

        // get counts per section
        const counts = [];
        const sectionCharges = [];
        for (const sec of sections) {
            const cObj = {};
            let sectionCharge = 0;
            for (const aid of sec) {
                const atom = this.atoms[aid];
                sectionCharge += atom.charge || 0;

                const chargediff = Math.abs(atom.charge) > 1 ? Math.abs(atom.charge) : '';
                const sym = atom.elemData.symbol;

                if (cObj[sym] === undefined) cObj[sym] = 0;
                cObj[sym]++;
            }

            counts.push(cObj);
            sectionCharges.push(sectionCharge);
        }

        // if no carbon, sort alphabetically
        const kakhaga = (a, b) => {
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

        // get each part's formula
        const sectionStrs = counts.map((cObj, idx) => {
            const hasCarbon = Object.keys(cObj).some(k => k.startsWith('C'));
            const sortedPairs = Object.entries(cObj).toSorted(hasCarbon ? carbon : kakhaga);

            const totalCharge = sectionCharges[idx];

            const str = sortedPairs.map(([sym, count]) => {
                if (count === 1) return sym;
                return `${sym}${toSubscript(count)}`;
            }).join('');

            // build unicode superscript for net charge (sign then magnitude)
            let netChargeSup = '';
            if (totalCharge !== 0) {
                const signChar = totalCharge > 0 ? '⁺' : '⁻';
                const mag = Math.abs(totalCharge);
                const magSup = mag > 1 ? String(mag).split('').map(d => superscriptMap[d]).join('') : '';
                netChargeSup = signChar + magSup;
            }
            return str + netChargeSup;
        });

        const seenObj = {};
        for (const section of sectionStrs) {
            if (Object.keys(seenObj).includes(section)) seenObj[section]++;
            else seenObj[section] = 1;
        }
        return Object.entries(seenObj).map((ent) => (ent[1] > 1 ? `${ent[1]} ` : '') + ent[0]).join(' + ');
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

                if (!realBond || realBond.degree !== degree) {
                    valid = false;
                    break;
                }
            }

            if (valid) return perm;
        }

        return [];
    }

    analyze() {
        const GROUPS = {
            'hydroxy': new FunctionalGroupMolecule(
                ['O', 'H'],
                ['0>1']
            ),
            'carboxyl': new FunctionalGroupMolecule(
                ['C', 'O', 'O', 'H'],
                ['0>1:2', '0>2', '2>3']
            ),
            'amino': new FunctionalGroupMolecule(
                ['N', 'H', 'H'],
                ['0>1', '0>2']
            ),
            'phosphate': new FunctionalGroupMolecule(
                ['O', 'P', 'O', 'O', 'H', 'O', 'H'],
                ['0>1', '1>2:2', '1>3', '3>4', '1>5', '5>6']
            ),
            'methyl': new FunctionalGroupMolecule(
                ['C', 'H', 'H', 'H'],
                ['0>1', '0>2', '0>3']
            ),
            'alkene': new FunctionalGroupMolecule(
                ['C', 'C', 'H', 'H', 'H'],
                ['0>1:2', '0>2', '1>3', '1>4']
            ),
            'alkyne': new FunctionalGroupMolecule(
                ['C', 'C', 'H'],
                ['0>1:3', '1>2']
            ),
            'benzene ring': new FunctionalGroupMolecule(
                ['C', 'C', 'C', 'C', 'C', 'C'],
                ['0>1:2', '1>2', '2>3:2', '3>4', '4>5:2', '5>1']
            ),
            'sulfate': new FunctionalGroupMolecule(
                ['S', 'H'],
                ['0>1']
            ),
            'aldehyde': new FunctionalGroupMolecule(
                ['C', 'O', 'H'],
                ['0>1:2', '0>2']
            ),
            'carboxylic acid': new FunctionalGroupMolecule(
                ['C', 'O', 'O', 'H'],
                ['0>1:2', '0>2', '2>3']
            ),
            'alkyl halide': new FunctionalGroupMolecule(
                ['F,Cl,Br,I'],
                []
            )
        };

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
}



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
function cloneMoleculeOnto(molecule, objmol) {
    for (const bond of molecule.bonds) {
        objmol.createBond(bond.type, bond.atom1, bond.atom2, bond.degree);
    }
    for (const [aidStr, charge] of Object.entries(molecule.ionizations)) objmol.ionize(Number(aidStr), charge);
    return objmol;
}
function cloneMolecule2D(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.elemData, new Victor(a.pos.x, a.pos.y));
        return newA;
    });

    let m = new Mol2D(...mAtoms);
    return cloneMoleculeOnto(molecule, m);
}
function cloneMolecule3D(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.elemData, new Victor(a.pos.x, a.pos.y));
        return newA;
    });

    let m = new Mol3D(...mAtoms);
    return cloneMoleculeOnto(molecule, m);
}