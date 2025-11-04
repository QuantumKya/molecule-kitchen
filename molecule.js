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
        for (const atom of this.atoms) atom.draw(ctx);
    }


    findHoveredAtom() {
        let foundId = 0;
        for (const atom of this.atoms) {
            if (atom.checkIfMouseHover()) return foundId;
            foundId++;
        }
        return undefined;
    }

    createCovalentBond(atomId1, atomId2, degree = 1) {
        if (degree <= 0) {
            alert("Hey, there can't be a negative (or zero) covalent bond!");
            return;
        }
        this.bonds.push({ atom1: atomId1, atom2: atomId2, degree });
    }

    organizeNeighbors(atomId, anchorId, initAngle) {
        const originalPos = this.atoms[atomId].pos.clone();

        const neighborBonds = this.bonds.filter(
            (bond) => bond.atom1 === atomId || bond.atom2 === atomId
        ).map(
            (bond) => bond.atom1 === atomId ? bond : { atom1: bond.atom2, atom2: bond.atom1, degree: bond.degree }
        );

        if (neighborBonds.find((bond) => bond.atom2 === anchorId) === undefined) {
            alert("Anchor atom isn't a neighbor!");
            return;
        }
        
        const neighbors = neighborBonds.map(
            (bond) => this.atoms[bond.atom2]
        ).sort(
            (atomA, atomB) => {
                if (this.atoms.indexOf(atomA) === anchorId) return -1;
                if (this.atoms.indexOf(atomB) === anchorId) return 1;

                return atomA.pos.horizontalAngle() - atomB.pos.horizontalAngle();
            }
        );

        const avgDistanceOut = neighbors.reduce(
            (pn, neigh) => pn + neigh.pos.distance(originalPos),
            0
        ) / neighbors.length;




        const betweenAngle = 2 * Math.PI / neighbors.length;

        const orientAngles = [];
        for (let i = 0; i < neighbors.length; i++) {
            orientAngles.push(initAngle + i*betweenAngle);
        }

        const offsetVectors = orientAngles.map(
            (angle) => new Victor(Math.cos(angle), Math.sin(angle)).multiplyScalar(avgDistanceOut)
        );



        const animDuration = 60;

        const startFrame = getCurrentFrame();

        const startPositions = neighbors.map(neigh => neigh.pos.clone());
        const targetPositions = offsetVectors.map(vec => originalPos.clone().add(vec));

        const moveAnimation = () => {
            const framesElapsed = getCurrentFrame() - startFrame;
            const lerprogress = framesElapsed / animDuration;

            neighbors.forEach((neigh, i) => {
                neigh.pos = polarLerp(startPositions[i], targetPositions[i], lerprogress, originalPos);
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
}