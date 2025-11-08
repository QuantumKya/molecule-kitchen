class Molecule {
    constructor(...atoms) {
        this.atoms = atoms;
        this.bonds = [];
    }
    
    update() {

    }

    draw(ctx) {
        const BONDWIDTH = 10;
        
        for (const bond of this.bonds) {
            const pos1 = this.atoms[bond.atom1].pos;
            const pos2 = this.atoms[bond.atom2].pos;

            ctx.save();
            ctx.beginPath();
            if (bond.degree === 1) {
                ctx.moveTo(pos1.x, pos1.y);
                ctx.lineTo(pos2.x, pos2.y);
            }
            else {
                const offsetwidth = 20;
                
                const direction = pos2.clone().subtract(pos1).normalize();
                const normal = direction.clone().rotateBy(Math.PI / 2);

                for (let i = 0; i < bond.degree; i++) {
                    const offset = (i - (bond.degree - 1) / 2) * offsetwidth;

                    const newp1 = pos1.clone().add(normal.clone().multiplyScalar(offset));
                    const newp2 = pos2.clone().add(normal.clone().multiplyScalar(offset));
                    
                    ctx.moveTo(newp1.x, newp1.y);
                    ctx.lineTo(newp2.x, newp2.y);
                }
            }

            ctx.strokeStyle = 'black';
            ctx.lineWidth = BONDWIDTH;
            ctx.stroke();
            ctx.restore();
        }
        for (const atom of this.atoms.toReversed()) atom.draw(ctx);
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

    createCovalentBond(atomId1, atomId2, degree = 1) {
        if (degree <= 0) {
            alert("Hey, there can't be a negative (or zero) covalent bond!");
            return;
        }
        if (degree > this.atoms[atomId1].valence || degree > this.atoms[atomId2].valence) {
            alert("One or more of those molecules are already full.");
            return;
        }
        this.bonds.push({ atom1: atomId1, atom2: atomId2, degree });
    }

    destroyCovalentBond(atomId1, atomId2, degree = 1) {
        if (degree <= 0) {
            alert("Hey, there can't be a negative (or zero) covalent bond!");
            return;
        }
        const bondIndex = this.bonds.findIndex((bond) => {
            return (bond.atom1 === atomId1 && bond.atom2 === atomId2);
        });
        if (bondIndex === -1) {
            alert("Uh, you're trying to break a bond that doesn't exist.\nThat sounds like it could be poetic but I can't let you do it here.");
            return;
        }

        const bond = this.bonds[bondIndex];
        
        if (bond.degree > degree) bond.degree -= degree;
        else if (bond.degree < degree) {
            alert(`There aren't even enough bonds to delete that many! {${degree}}`);
            return;
        }
        else if (bond.degree === degree) {
            this.bonds.splice(bondIndex, 1);
        }
    }

    findNeighbors(atomId) {
        const neighborBonds = this.bonds.filter(
            (bond) => bond.atom1 === atomId || bond.atom2 === atomId
        ).map(
            (bond) => bond.atom1 === atomId ? bond : { atom1: bond.atom2, atom2: bond.atom1, degree: bond.degree }
        );

        const neighbors = neighborBonds.map(
            (bond) => this.atoms[bond.atom2]
        );
        return neighbors;
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
        
        if (neighbors.find((atom) => this.atoms.indexOf(atom) === anchorId) === undefined) {
            alert("Anchor atom isn't a neighbor!");
            return;
        }
        
        while (this.atoms.indexOf(neighbors[0]) !== anchorId) {
            neighbors.push(neighbors.shift());
        }



        const offsetVectors = transformation.function(neighbors, initAngle, centerPos, anchorPos, this, ...args);
        if (offsetVectors.length === 0) return;



        const animDuration = 15;

        const startFrame = getCurrentFrame();

        const startPositions = neighbors.map(neigh => neigh.pos.clone());
        const targetPositions = offsetVectors.map(vec => centerPos.clone().add(vec));

        const moveAnimation = () => {
            const framesElapsed = getCurrentFrame() - startFrame;
            const lerprogress = framesElapsed / animDuration;

            neighbors.forEach((neigh, i) => {
                neigh.pos = polarLerp(startPositions[i], targetPositions[i], lerprogress, centerPos, ccwise);
            });
            
            if (framesElapsed >= animDuration) {
                neighbors.forEach((neigh, i) => {
                    neigh.pos = targetPositions[i].clone();
                });
            }
            else requestAnimationFrame(moveAnimation);
        };
        moveAnimation();
    }

    static transformFunctions = {
        'rotate one': {
            needsAngle: true,
            function: (neighbors, initAngle, centerPos, anchorPos, mol) => {

                const distanceOut = anchorPos.clone().subtract(centerPos).length();

                const offsetvectors = neighbors.map(
                    (neigh) => mol.atoms.indexOf(neigh) === anchorId ? polarVec(initAngle, distanceOut) : neigh.pos.clone().subtract(centerPos)
                );
                return offsetvectors;

            }
        },
        'rotate all': {
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
        'same distance': {
            needsAngle: false,
            function: (neighbors, initAngle, centerPos, anchorPos) => {

                const distanceOut = anchorPos.clone().subtract(centerPos).length();

                const offsetVectors = neighbors.map(
                    (neigh) => polarVec(neigh.pos.clone().subtract(centerPos).angle(), distanceOut)
                );
                return offsetVectors;

            }
        },
        'equally angled': {
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
        't intersection': {
            needsAngle: true,
            function: (neighbors, initAngle, centerPos, anchorPos, mol, anchorside) => {

                if (neighbors.length !== 3) {
                    alert("T Intersection only works with 3 atoms around the center!");
                    return [];
                }

                const orientAngles = [-Math.PI / 2, 0, Math.PI / 2];


                orientAngles.forEach(angle => angle -= Math.sign(anchorside) * Math.PI / 2);

                const offsetVectors = orientAngles.map(
                    (angle, i) => polarVec(angle + initAngle, neighbors[i].pos.clone().subtract(centerPos).length())
                );
                return offsetVectors;

            }
        },
    };

    translateWhole(delta) {
        for (const atom of this.atoms) atom.pos.add(delta);
    }
    /*

    translateAllConnected(id, delta) {
        const connectedAtoms = [];
        for (let i = 0; i < this.atoms.length; i++) {
            const neigh = this.findNeighbors(i);
            const atomid = neigh.indexOf(id);
            if (atomid !== -1) connectedAtoms.push(i);
        }
        for (const id of connectedAtoms) this.atoms[id].pos.add(delta);
    }
    
    */
    translateOne(id, delta) {
        this.atoms[id].pos.add(delta);
    }
}