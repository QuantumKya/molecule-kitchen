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

    draw(ctx) {
        const shakecheck = (a) => (a.elemData.valence >= 0) ? (a.valence > a.elemData.valence || a.valence < 0) : (a.valence < a.elemData.valence || a.valence > 0);
        
        for (const bond of this.bonds) {
            const pos1 = this.atoms[bond.atom1].pos;
            const pos2 = this.atoms[bond.atom2].pos;

            const color = [bond.atom1, bond.atom2].map(i=>this.atoms[i]).some(shakecheck) ? `#${getIntOscillation(getCurrentFrame(), FPS/1.75, 120, 240).toString(16)}0000` : 'black';

            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = BONDWIDTH;

            if (bond.degree === 1) {
                bond.type === 'covalent' ? this.drawCovalentBond(ctx, pos1, pos2) : this.drawIonicBond(ctx, pos1, pos2);
            }
            else {
                const offsetwidth = 20;
                
                const direction = pos2.clone().subtract(pos1).normalize();
                const normal = direction.clone().rotate(-Math.PI / 2);

                for (let i = 0; i < bond.degree; i++) {
                    const offset = (i - (bond.degree - 1) / 2) * offsetwidth;

                    const newp1 = pos1.clone().add(normal.clone().multiplyScalar(offset));
                    const newp2 = pos2.clone().add(normal.clone().multiplyScalar(offset));
                    
                    bond.type === 'covalent' ? this.drawCovalentBond(ctx, newp1, newp2) : this.drawIonicBond(ctx, newp1, newp2);
                }
            }
            ctx.restore();
        }
        for (let i = 0; i < this.atoms.length; i++) {
            const atom = this.atoms[i];

            shakecheck(atom)
            ? atom.drawFromPos(ctx, atom.pos.clone().add(new Victor(10*(0.5-Math.random()), 5*(0.5-Math.random()))))
            : atom.draw(ctx);

            if (this.selectedAtoms.includes(i)) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#2252ffff';
                ctx.beginPath();
                ctx.arc(atom.pos.x, atom.pos.y, atom.radius, 0, 360);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    drawCovalentBond(ctx, p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    drawIonicBond(ctx, p1, p2) {
        const dist = p1.distance(p2);
        const direction = p2.clone().subtract(p1).normalize();
        const sectlength = 60;

        const times = Math.round(dist / sectlength);

        let start = p1.clone();

        for (let i = 0; i < times; i++) {
            const buffer = 8;
            
            const line1 = start.clone().add(direction.clone().multiplyScalar(sectlength/3 - buffer));
            const ball = start.clone().add(direction.clone().multiplyScalar(sectlength/2));
            const line2 = start.clone().add(direction.clone().multiplyScalar(sectlength*2/3 + buffer));
            const end = start.clone().add(direction.clone().multiplyScalar(sectlength));
            
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(line1.x, line1.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(line2.x, line2.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            start.add(direction.clone().multiplyScalar(sectlength));
        }
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
            alert("Hey, there can't be a negative (or zero) covalent bond!");
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

    findInBox(c1, c2) {
        this.selectedAtoms.length = 0;
        for (let i = 0; i < this.atoms.length; i++) {
            const p = this.atoms[i].pos;
            const r = this.atoms[i].radius;

            const clt = new Victor(Math.min(c1.x, c2.x), Math.min(c1.y, c2.y));
            const cbr = new Victor(Math.max(c1.x, c2.x), Math.max(c1.y, c2.y));

            const pad = 1.75/3*r;

            if (
                p.x + pad >= clt.x &&
                p.x - pad <= cbr.x &&
                p.y + pad >= clt.y &&
                p.y - pad <= cbr.y
            ) {
                this.selectedAtoms.push(i);
            }
        }
    }

    organizeNeighbors(atomId, anchorId, initAngle, transformation, ...args) {
        const centerPos = this.atoms[atomId].pos.clone();
        const anchorPos = this.atoms[anchorId].pos.clone();

        const anchorangle = anchorPos.clone().subtract(centerPos).angle();
        const compareAnchor = clampToAngleSpace(anchorangle - initAngle);
        const ccwise = compareAnchor < 0;
        
        const neighbors = this.findNeighbors(atomId).sort(
            (atomA, atomB) => {
                const angleA = atomA.pos.clone().subtract(centerPos).angle();
                const angleB = atomB.pos.clone().subtract(centerPos).angle();

                return angleA - angleB;
            }
        );

        const connected = neighbors.map((n,i) => {
            const paths = [[n]];
            const visited = new Set([this.atoms[atomId], n]);

            while (paths.length > 0) {
                const currentPath = paths.shift();
                const currentAtom = currentPath.at(-1);

                for (const a of this.findNeighbors(this.atoms.indexOf(currentAtom))) {
                    if (visited.has(a)) continue;
                    visited.add(a);
                    const newPath = [...currentPath, a];
                    paths.push(newPath);
                }
            }

            return [...visited].toSpliced(0,2);
        });
        
        while (this.atoms.indexOf(neighbors[0]) !== anchorId) {
            neighbors.push(neighbors.shift());
        }



        const offsetVectors = transformation.function(neighbors, initAngle, centerPos, anchorPos, this, ...args);
        if (offsetVectors.length === 0) return;



        const animDuration = FPS/2;

        const startFrame = getCurrentFrame();

        const startPositions = neighbors.map(neigh => neigh.pos.clone());
        const startConnectedPositions = connected.map(set => set.map(n => n.pos.clone()));
        const targetPositions = offsetVectors.map(vec => centerPos.clone().add(vec));
        const targetConnectedPositions = connected.map((set,i) => set.map(n => {
            const offsetFromNeighbor = n.pos.clone().subtract(neighbors[i].pos);
            const rotatedOffset = offsetFromNeighbor.clone().rotate(
                targetPositions[i].clone().subtract(centerPos).angle() -
                startPositions[i].clone().subtract(centerPos).angle()
            );
            return targetPositions[i].clone().add(rotatedOffset);
        }));

        const moveAnimation = () => {
            const framesElapsed = getCurrentFrame() - startFrame;
            const lerprogress = Math.min(1, framesElapsed / animDuration);

            neighbors.forEach((neigh, i) => {
                const thisconnected = connected[i];
                neigh.pos = polarLerp(startPositions[i], targetPositions[i], lerprogress, centerPos, ccwise);
                thisconnected.forEach((conn, c) => {
                    conn.pos = polarLerp(startConnectedPositions[i][c], targetConnectedPositions[i][c], lerprogress, centerPos, ccwise);
                });
            });
            
            if (framesElapsed >= animDuration) {
                neighbors.forEach((neigh, i) => {
                    neigh.pos = targetPositions[i].clone();
                });
                return true; // done with animation
            }
            return false; // not done yet
        };
        activeAnimations.push(moveAnimation);
    }

    static transformFunctions = {
        'rotate_one': {
            needsAngle: true,
            function: (neighbors, initAngle, centerPos, anchorPos, mol) => {

                const distanceOut = anchorPos.clone().subtract(centerPos).length();

                const offsetvectors = neighbors.map(
                    (neigh) => mol.atoms.indexOf(neigh) === anchorId ? polarVec(initAngle, distanceOut) : neigh.pos.clone().subtract(centerPos)
                );
                return offsetvectors;

            }
        },
        'rotate_all': {
            needsAngle: true,
            function: (neighbors, initAngle, centerPos, anchorPos) => {

                const anchorangle = anchorPos.clone().subtract(centerPos).angle();

                const offsetVectors = neighbors.map((neigh) => {
                    const diffvec = neigh.pos.clone().subtract(centerPos);
                    const ang = diffvec.angle() + initAngle - anchorangle;

                    return polarVec(ang, diffvec.length());
                });
                return offsetVectors;

            }
        },
        'same_distance': {
            needsAngle: false,
            function: (neighbors, initAngle, centerPos, anchorPos) => {

                const distanceOut = anchorPos.clone().subtract(centerPos).length();

                const offsetVectors = neighbors.map(
                    (neigh) => polarVec(neigh.pos.clone().subtract(centerPos).angle(), distanceOut)
                );
                return offsetVectors;

            }
        },
        'equally_angled': {
            needsAngle: true,
            function: (neighbors, initAngle, centerPos) => {

                const betweenAngle = 2 * Math.PI / neighbors.length;

                const orientAngles = [];
                for (let i = 0; i < neighbors.length; i++) {
                    orientAngles.push(initAngle + i*betweenAngle);
                }

                const offsetVectors = orientAngles.map(
                    (angle, i) => polarVec(angle, neighbors[i].pos.clone().subtract(centerPos).length())
                );
                return offsetVectors;

            }
        },
        't_intersection': {
            needsAngle: true,
            function: (neighbors, initAngle, centerPos, anchorPos, mol, anchorside) => {

                if (neighbors.length !== 3) {
                    alert("T Intersection only works with 3 atoms around the center!");
                    return [];
                }

                const orientAngles = [-Math.PI / 2, 0, Math.PI / 2];

                const anchOffset = -Math.sign(anchorside) * Math.PI / 2;

                const offsetVectors = orientAngles.map(
                    (angle, i) => polarVec(angle + initAngle + anchOffset, neighbors[i].pos.distance(centerPos))
                );
                return offsetVectors;

            }
        },
    };

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
                ['C', 'O', 'H'],
                ['0>1', '1>2']
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

class FunctionalGroupMolecule {
    constructor(atomStrs, bondStrs) {
        this.atoms = atomStrs;
        this.bonds = bondStrs;
    }
}