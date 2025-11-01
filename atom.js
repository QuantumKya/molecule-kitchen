class Atom {
    constructor(element, position = new Victor(0, 0), rad = 100) {
        this.elemData = element;
        this.valence = element.valence;
        this.pos = position;
        this.radius = rad;
    }
    
    update() {
        
    }

    draw(ctx) {
        const TEXTSIZE = 70;

        ctx.fillStyle = this.elemData.color;
        ctx.strokeStyle = 'black';
        ctx.strokeWidth = 3;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 360);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = getTextColorFromBG(this.elemData.color);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${TEXTSIZE*this.radius/75}px Arial`;
        ctx.fillText(this.elemData.symbol, this.pos.x, this.pos.y);
    }

    checkIfMouseHover() {
        return (currentMousePos.distanceSq(this.pos) < this.radius * this.radius);
    }
}