class Atom2D extends Atom {
    constructor(atomicNumber, position = new Victor(0, 0)) {
        super(atomicNumber, position);
        this.color = getElement(atomicNumber).color;
        
        this.radius = 42.5 + 7.5 * getElementPeriod(atomicNumber);
        if (atomicNumber === 1) this.radius = 40;
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
        ctx.font = `${TEXTSIZE*this.radius/75}px Helvetica Neue`;

        ctx.fillText(this.symbol, position.x, position.y);
    }

    checkIfMouseHover() {
        return (getMousePos().distanceSq(this.pos) < this.radius * this.radius);
    }
}