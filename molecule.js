class Molecule {
    constructor(...atoms) {
        this.atoms = atoms;
        this.bonds = [];
    }

    draw(ctx) {
        const BONDWIDTH = 10;
        
        for (const bond of this.bonds) {
            const pos1 = this.atoms[bond[0]].pos;
            const pos2 = this.atoms[bond[1]].pos;

            ctx.save();
            ctx.beginPath();
            if (bond[2] === 1) {
                ctx.moveTo(pos1.x, pos1.y);
                ctx.lineTo(pos2.x, pos2.y);
            }
            else {
                const offsetwidth = 15;
                
                const direction = pos2.clone().subtract(pos1).normalize();
                const normal = direction.clone().rotateBy(Math.PI / 2);

                for (let i = 0; i < bond[2]; i++) {
                    const offset = (i - (bond[2] - 1) / 2) * offsetwidth;

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


    createCovalentBond(atomId1, atomId2, degree = 1) {
        if (degree <= 0) {
            alert("Hey, there can't be a negative (or zero) covalent bond!");
            return;
        }
        this.bonds.push([atomId1, atomId2, degree]);
    }
}