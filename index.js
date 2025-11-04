const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 700;


function makeEthene() {
    const C1 = new Atom(atoms.carbon, new Victor(200, 310), 65);
    const C2 = new Atom(atoms.carbon, new Victor(500, 310), 65);
    const H1 = new Atom(atoms.hydrogen, new Victor(200, 150), 45);
    const H2 = new Atom(atoms.hydrogen, new Victor(200, 450), 45);
    const H3 = new Atom(atoms.hydrogen, new Victor(500, 150), 45);
    const H4 = new Atom(atoms.hydrogen, new Victor(500, 450), 45);
    
    const methane = new Molecule(C1, C2, H1, H2, H3, H4);
    methane.createCovalentBond(0, 1, 2);
    methane.createCovalentBond(0, 2, 1);
    methane.createCovalentBond(0, 3, 1);
    methane.createCovalentBond(1, 4, 1);
    methane.createCovalentBond(1, 5, 1);
    return methane;
}

function makeMethane() {
    const C = new Atom(atoms.carbon, new Victor(300, 300), 65);
    const H1 = new Atom(atoms.hydrogen, new Victor(450, 300), 45);
    const H2 = new Atom(atoms.hydrogen, new Victor(300, 150), 45);
    const H3 = new Atom(atoms.hydrogen, new Victor(150, 300), 45);
    const H4 = new Atom(atoms.hydrogen, new Victor(300, 450), 45);
    
    const methane = new Molecule(C, H1, H2, H3, H4);
    methane.createCovalentBond(0, 1, 1);
    methane.createCovalentBond(0, 2, 1);
    methane.createCovalentBond(0, 3, 1);
    methane.createCovalentBond(0, 4, 1);
    return methane;
}

const ethene = makeEthene();
const methane = makeMethane();



let draggingAtom = -1;

let organizeStage = 'null';
let centerId = -1;
let anchorId = -1;

function init(mol) {
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
    
        const hovereeId = mol.findHoveredAtom();
    
        if (e.button === 0) {
    
            if (hovereeId === undefined) {
                
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
                    const angle = getMousePos().subtract(mol.atoms[centerId].pos).horizontalAngle();
                    if (confirm(`Organize neighbors of atom ${centerId},\nwith anchor of atom ${anchorId},\nat a horizontal angle of ${(-angle * 180 / Math.PI).toPrecision(4+3)}º?`)) {
                        mol.organizeNeighbors(centerId, anchorId, angle);
                        organizeStage = 'null';
                    }
                    break;
                default:
                    break;
            }
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            
            if (organizeStage !== 'null') organizeStage = 'null';
            
        }
    });
}

        
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.pageX - rect.left;
    const my = e.pageY - rect.top;
    currentMousePos = new Victor(mx, my); 
});


function main(mol) {
    // Update ----------------------------

    mol.update();
    
    // Draw ------------------------------
    let bgColor = '#87b5ffff';

    if (organizeStage !== 'null') bgColor = darkenColor(bgColor, 0.8);
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    mol.draw(ctx);

    if (organizeStage === 'setAngle') {
        const centerpos = mol.atoms[centerId].pos;
        const mousepos = getMousePos();
        const angle = mousepos.clone().subtract(centerpos).horizontalAngle();

        const angleradius = mol.atoms[centerId].radius + 10;

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(canvas.width, centerpos.y);
        ctx.lineTo(centerpos.x, centerpos.y);
        ctx.arc(centerpos.x, centerpos.y, angleradius, 0, angle, true);
        ctx.moveTo(centerpos.x, centerpos.y);
        ctx.lineTo(mousepos.x, mousepos.y);
        ctx.stroke();
        ctx.restore();
    }
}

function run() {
    CURRENTFRAME++;
    const startTime = Date.now();
    
    
    main(methane);
    
    
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    if (elapsed < 1000 / FPS) setTimeout(run, 1000 / FPS - elapsed);
    else requestAnimationFrame(run);
}


init(methane);
run();