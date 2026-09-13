class Mol2D extends Molecule {
    /** @param {Molecule} mol @returns {Mol2D} */
    static from(mol) { return cloneMolecule2D(mol); }

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
}