class Atom {
    constructor(element, position = new Victor(0, 0)) {
        this.elemData = element;
        this.valence = element.valence;
        this.pos = position;

        this.charge = 0;

        let e = element.number;
        let count = 0;
        for (const size of shells) {
            e -= size;
            count++;
            if (e < 0) break;
        }
        this.radius = 45 + 7.5 * count;
        if (element.symbol === 'H') this.radius = 40;
    }

    draw(ctx) {
        this.drawFromColor(ctx, this.elemData.color ?? '#888888');
    }

    drawUnhighlighted(ctx) {
        this.drawFromColor(ctx, darkenColor(this.elemData.color ?? '#888888', 0.8));
    }

    drawFromColor(ctx, color) {
        this.drawSuperCustom(ctx, color, this.pos);
    }

    drawFromPos(ctx, position) {
        this.drawSuperCustom(ctx, this.elemData.color ?? '#888888', position);
    }

    drawSuperCustom(ctx, color, position) {
        const TEXTSIZE = 70;
        const clr = color;

        ctx.fillStyle = clr;
        ctx.strokeStyle = 'black';
        ctx.strokeWidth = 3;
        ctx.beginPath();
        ctx.arc(position.x, position.y, this.radius, 0, 360);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = getTextColorFromBG(clr);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${TEXTSIZE*this.radius/75}px Arial`;
        ctx.fillText(this.elemData.symbol + ['', '⁺', '⁻'].at(Math.sign(this.charge)), position.x, position.y);
    }

    checkIfMouseHover() {
        return (getMousePos().distanceSq(this.pos) < this.radius * this.radius);
    }
}