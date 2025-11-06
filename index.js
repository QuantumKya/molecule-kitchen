const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 700;

const canvascenter = new Victor(canvas.width / 2, canvas.height / 2);

function getCanvasImage() {
    const data = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = data;

    const d = new Date();
    a.download = `molecule_kitchen_${d.toISOString().slice(0, 10).replace(/-/g, '')}.png`;

    canvas.appendChild(a);
    a.click();
    canvas.removeChild(a);
}


function makeEthene() {
    const C1 = new Atom(atoms.carbon, new Victor(200, 300), 65);
    const C2 = new Atom(atoms.carbon, new Victor(500, 300), 65);
    const H11 = new Atom(atoms.hydrogen, new Victor(200, 150), 45);
    const H12 = new Atom(atoms.hydrogen, new Victor(200, 450), 45);
    const H21 = new Atom(atoms.hydrogen, new Victor(500, 150), 45);
    const H22 = new Atom(atoms.hydrogen, new Victor(500, 450), 45);
    
    const methane = new Molecule(C1, C2, H11, H12, H21, H22);
    methane.createCovalentBond(0, 1, 2);
    methane.createCovalentBond(0, 2);
    methane.createCovalentBond(0, 3);
    methane.createCovalentBond(1, 4);
    methane.createCovalentBond(1, 5);
    return methane;
}

function makeMethane() {
    const offsetvectors = [];
    for (let i = 0; i < 4; i++) {
        const angleoff = Math.PI / 2 + (i / 4) * Math.PI * 2;
        offsetvectors.push(polarVec(angleoff, 200));
    }

    const C = new Atom(atoms.carbon, canvascenter.clone(), 60);
    const Hs = offsetvectors.map(vec => new Atom(atoms.hydrogen, canvascenter.clone().add(vec), 45));
    
    const methane = new Molecule(C, ...Hs);
    for (let i = 0; i < 4; i++) methane.createCovalentBond(0, i+1);
    return methane;
}

function makeWater() {
    const anglebetween = 104.45;
    const offsetvectors = [-1, 1].map((sign) => {
        const angleoff = -Math.PI / 2 + sign * anglebetween / 2;
        return polarVec(angleoff, 200);
    });
    
    const O = new Atom(atoms.oxygen, canvascenter, 70);
    const H1 = new Atom(atoms.hydrogen, canvascenter.clone().add(offsetvectors[0]), 45);
    const H2 = new Atom(atoms.hydrogen, canvascenter.clone().add(offsetvectors[1]), 45);

    const h2o = new Molecule(O, H1, H2);
    h2o.createCovalentBond(0, 1);
    h2o.createCovalentBond(0, 2);
    return h2o;
}

function makeAmmonia() {
    const offsetvectors = [];
    for (let i = 0; i < 3; i++) {
        const angleoff = Math.PI / 2 + (i / 3) * Math.PI * 2;
        offsetvectors.push(polarVec(angleoff, 200));
    }

    const N = new Atom(atoms.nitrogen, canvascenter.clone(), 65);
    const Hs = offsetvectors.map(vec => new Atom(atoms.hydrogen, canvascenter.clone().add(vec), 45));

    const ammonia = new Molecule(N, ...Hs);
    for (let i = 0; i < 3; i++) ammonia.createCovalentBond(0, i+1);
    return ammonia;
}

const ethene = makeEthene();
const methane = makeMethane();
const h2o = makeWater();
const ammonia = makeAmmonia();

let mol = h2o;

function loadTemplateMolecule() {
    const newmolecule = dropdowns['templatemolecules'];
    if (!newmolecule) return;
    eval(`mol = ${newmolecule};`);
}



let draggingAtom = -1;
let lastMousePos = new Victor(0, 0);

let organizeStage = 'null';
let centerId = -1;
let anchorId = -1;

function init() {
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
    
        const hovereeId = mol.findHoveredAtom();
    
        if (e.button === 0) {
    
            if (hovereeId === undefined) {
                console.log("Nothin!");
            }
            else {
                draggingAtom = hovereeId;
                lastMousePos = getMousePos();
                canvas.style.cursor = 'grabbing';
            }
    
        }
        else if (e.button === 2) {
    
            switch (organizeStage) {
                case 'null':
                    if (hovereeId === undefined) {
                        organizeStage = 'null';
                        break;
                    }
                    centerId = hovereeId;
                    organizeStage = 'setAnchor';
                    break;
                case 'setAnchor':
                    if (hovereeId === undefined) {
                        organizeStage = 'null';
                        alert("Must select a second atom as the anchor!");
                        break;
                    }
                    anchorId = hovereeId;
                    organizeStage = 'setAngle';
                    break;
                case 'setAngle':
                    const mousepos = getMousePos();
                    const centerpos = mol.atoms[centerId].pos;

                    let angle = mousepos.subtract(centerpos).angle();
                    if (SHIFTING) angle = roundToInterval(angle, Math.PI / 4);

                    clearDraw('mouseangleselect');

                    if (confirm(`Organize neighbors of atom ${centerId},\nwith anchor of atom ${anchorId},\nat a horizontal angle of ${(-angle * 180 / Math.PI).toPrecision(4+2)}º?`)) {
                        mol.rotateAll(centerId, anchorId, angle);
                        organizeStage = 'null';
                    }
                    break;
                default:
                    break;
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        e.preventDefault();
    
        const hovereeId = mol.findHoveredAtom();
    
        if (e.button === 0) {
    
            if (hovereeId === undefined) {
                
            }
            else {
                draggingAtom = -1;
                canvas.style.cursor = 'default';
            }
    
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.pageX - rect.left;
        const my = e.pageY - rect.top;
        currentMousePos = new Victor(mx, my);
    
        const hovereeId = mol.findHoveredAtom();

        if (hovereeId === undefined) {
            canvas.style.cursor = 'default';
        }
        else {
            canvas.style.cursor = 'grab';
        }

        if (organizeStage === 'setAngle') {
            const mousepos = getMousePos();
            const centerpos = mol.atoms[centerId].pos;

            let angle = mousepos.subtract(centerpos).angle();
            if (SHIFTING) angle = roundToInterval(angle, Math.PI / 4);

            setDraw((ctx) => {
                const atomrad = mol.atoms[anchorId].pos.clone().subtract(centerpos).length();
                const projpoint = polarVec(angle, atomrad).add(centerpos);

                const angleradius = mol.atoms[centerId].radius + 10;

                ctx.save();
                
                ctx.globalAlpha = 0.5;

                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(canvas.width, centerpos.y);
                ctx.lineTo(centerpos.x, centerpos.y);
                ctx.arc(centerpos.x, centerpos.y, angleradius, 0, angle, angle < 0);
                ctx.moveTo(centerpos.x, centerpos.y);
                ctx.lineTo(projpoint.x, projpoint.y);
                ctx.stroke();

                ctx.restore();
            }, 'mouseangleselect');
        }
    });
}

        
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') SHIFTING = true;
    if (e.key === 'Control') CTRLING = true;

    if (e.key === 'Escape') {
        
        if (organizeStage !== 'null') organizeStage = 'null';
        
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') SHIFTING = false;
    if (e.key === 'Control') CTRLING = false;
});


let drawInstructions = {};
function setDraw(drawFunc, name) {
    drawInstructions[name] = drawFunc;
}
function clearDraw(name) {
    delete drawInstructions[name];
}

function main() {
    // Update ---------------------------------------------------

    mol.update();

    if (draggingAtom !== -1) {
        const diff = getMousePos().subtract(lastMousePos);

        if (SHIFTING) {
            mol.translateOne(draggingAtom, diff);
        }
        else {
            mol.translateWhole(diff);
        }
        lastMousePos = getMousePos();
    }



    // Draw ----------------------------------------------------
    
    let bgColor = '#87b5ffff';

    if (organizeStage !== 'null') bgColor = darkenColor(bgColor, 0.8);
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    mol.draw(ctx);

    for (const drawfunc of Object.values(drawInstructions)) drawfunc(ctx);

    // DEBUG ZONE -----------------------------------------------

    console.log(SHIFTING);
}

function run() {
    CURRENTFRAME++;
    const startTime = Date.now();
    
    
    main();
    
    
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    if (elapsed < 1000 / FPS) setTimeout(run, 1000 / FPS - elapsed);
    else requestAnimationFrame(run);
}


init();
run();