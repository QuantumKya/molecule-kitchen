const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

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


function ethylene() {
    const C1 = new Atom(ATOMS.carbon, new Victor(200, 300));
    const C2 = new Atom(ATOMS.carbon, new Victor(500, 300));
    const H11 = new Atom(ATOMS.hydrogen, new Victor(200, 150));
    const H12 = new Atom(ATOMS.hydrogen, new Victor(200, 450));
    const H21 = new Atom(ATOMS.hydrogen, new Victor(500, 150));
    const H22 = new Atom(ATOMS.hydrogen, new Victor(500, 450));
    
    const methane = new Molecule(C1, C2, H11, H12, H21, H22);
    methane.createCovalentBond(0, 1, 2);
    methane.createCovalentBond(0, 2);
    methane.createCovalentBond(0, 3);
    methane.createCovalentBond(1, 4);
    methane.createCovalentBond(1, 5);
    return methane;
}

function methane() {
    const offsetvectors = [];
    for (let i = 0; i < 4; i++) {
        const angleoff = Math.PI / 2 + (i / 4) * Math.PI * 2;
        offsetvectors.push(polarVec(angleoff, 200));
    }

    const C = new Atom(ATOMS.carbon, canvascenter.clone());
    const Hs = offsetvectors.map(vec => new Atom(ATOMS.hydrogen, canvascenter.clone().add(vec)));
    
    const methane = new Molecule(C, ...Hs);
    for (let i = 0; i < 4; i++) methane.createCovalentBond(0, i+1);
    return methane;
}

function h2o() {
    const anglebetween = 104.45;
    const offsetvectors = [-1, 1].map((sign) => {
        const angleoff = -Math.PI / 2 + sign * anglebetween / 2;
        return polarVec(angleoff, 200);
    });
    
    const O = new Atom(ATOMS.oxygen, canvascenter);
    const H1 = new Atom(ATOMS.hydrogen, canvascenter.clone().add(offsetvectors[0]));
    const H2 = new Atom(ATOMS.hydrogen, canvascenter.clone().add(offsetvectors[1]));

    const h2o = new Molecule(O, H1, H2);
    h2o.createCovalentBond(0, 1);
    h2o.createCovalentBond(0, 2);
    return h2o;
}

function ammonia() {
    const offsetvectors = [];
    for (let i = 0; i < 3; i++) {
        const angleoff = Math.PI / 2 + (i / 3) * Math.PI * 2;
        offsetvectors.push(polarVec(angleoff, 200));
    }

    const N = new Atom(ATOMS.nitrogen, canvascenter.clone());
    const Hs = offsetvectors.map(vec => new Atom(ATOMS.hydrogen, canvascenter.clone().add(vec)));

    const ammonia = new Molecule(N, ...Hs);
    for (let i = 0; i < 3; i++) ammonia.createCovalentBond(0, i+1);
    return ammonia;
}

let mol = h2o();

function loadTemplateMolecule() {
    const newmolecule = dropdowns['templatemolecules'];
    if (!newmolecule) return;
    eval(`mol = ${newmolecule}();`);
}



let draggingAtom = -1;
let lastMousePos = new Victor(0, 0);

let selectingAtoms = false;
let boxCorner = new Victor(0, 0);

let addingAtom = false;

let bonding = false;
let bondingAtom = -1;
let bondingDegree = 1;

let organizeStage = 'null';
let centerId = -1;
let anchorId = -1;

let bendIndex = NaN;

function runOrganize(centerId, anchorId, angle) {
    const option = dropdowns['organizeoptions'];
    if (!Object.keys(Molecule.transformFunctions).includes(option)) {
        alert('Yo that is not a thing that is in the dropdown, how did you get that?!');
        return;
    }

    if (option === 't intersection') {
        mol.organizeNeighbors(centerId, anchorId, angle, Molecule.transformFunctions[option], bendIndex);
    }

    mol.organizeNeighbors(centerId, anchorId, angle, Molecule.transformFunctions[option]);
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const hovereeId = mol.findHoveredAtom();

    switch (e.button) {
        case 0:
            if (dropdowns['organizeoptions'] === 't intersection') {
                bendIndex += 1;
                if (bendIndex >= 2) bendIndex = -1;
            }

            if (organizeStage !== 'null') return;

            if (e.shiftKey) {
                boxCorner = getMousePos();
                if (!selectingAtoms) selectingAtoms = true;
            }

            if (hovereeId === undefined) {
                console.log("Nothin!");
                break;
            }
            
            draggingAtom = hovereeId;
            lastMousePos = getMousePos();
            canvas.style.cursor = 'grabbing';
            break;
        case 2:
            if (bonding) {
                bondingDegree++;
                if (bondingDegree > 3 || bondingDegree <= 0) bondingDegree = 1;
                return;
            }

            const orgoption = dropdowns['organizeoptions'];

            if (orgoption === 'none') break;

            switch (organizeStage) {
                case 'null':
                    if (!orgoption) break;
                    if (hovereeId === undefined) {
                        organizeStage = 'null';
                        break;
                    }

                    centerId = hovereeId;
                    organizeStage = 'setAnchor';

                    if (orgoption === 't intersection') {
                        bendIndex = 0;
                        setDraw('organizetext', (ctx) => {
                            ctx.save();
                            ctx.textAlign = 'center';
                            ctx.fillStyle = 'black';
                            ctx.font = '30px Roboto';
                            ctx.fillText('T Intersection', canvas.width / 2, 15);
                            ctx.font = '20px Roboto';
                            ctx.fillText('Left click to change location of anchor', canvas.width / 2, 45);
                            ctx.fillText(`bend index: ${bendIndex}`, canvas.width / 2, 70);
                            ctx.restore();
                        });
                    }

                    break;
                case 'setAnchor':
                    if (hovereeId === undefined) {
                        organizeStage = 'null';
                        alert("Must select a second atom as the anchor!");
                        break;
                    }
                    anchorId = hovereeId;

                    console.log(Molecule.transformFunctions);
                    if (Molecule.transformFunctions[orgoption].needsAngle) {
                        organizeStage = 'setAngle';

                        setDraw('mouseangleselect', (ctx) => {
                            const mousepos = getMousePos();
                            const centerpos = mol.atoms[centerId].pos;

                            let angle = mousepos.subtract(centerpos).angle();
                            if (SHIFTING) angle = roundToInterval(angle, Math.PI / 4);

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
                        });
                        break;
                    }
                    else {
                        runOrganize(centerId, anchorId, 0);
                        organizeStage = 'null';
                        break;
                    }
                case 'setAngle':
                    const mousepos = getMousePos();
                    const centerpos = mol.atoms[centerId].pos;

                    let angle = mousepos.subtract(centerpos).angle();
                    if (SHIFTING) angle = roundToInterval(angle, Math.PI / 4);

                    clearDraw('mouseangleselect');
                    clearDraw('organizetext');

                    runOrganize(centerId, anchorId, angle);
                    organizeStage = 'null';

                    centerId = -1;
                    anchorId = -1;

                    if (orgoption === 't intersection') {
                        bendIndex = NaN;
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

        if (e.shiftKey) {
            if (selectingAtoms) selectingAtoms = false;
            mol.findInBox(boxCorner, getMousePos());
        }
        draggingAtom = -1;
        canvas.style.cursor = 'default';
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
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') SHIFTING = true;
    if (e.key === 'Control') CTRLING = true;

    if (e.key === 'Escape') {
        
        if (organizeStage !== 'null') {
            if (organizeStage === 'setAngle') clearDraw('mouseangleselect');
            organizeStage = 'null';

            clearDraw('organizetext');
        }

        if (bonding) {
            bonding = false;
            clearDraw('bondtext');
        }

        if (addingAtom) {
            atomDropdown(()=>{});
            addingAtom = false;
        }

        mol.selectedAtoms.length = 0;

    }

    if (organizeStage !== 'null') {
        return;
    }

    const hovereeId = mol.findHoveredAtom();

    if (e.code === 'KeyA') {
        if (e.shiftKey) {
            if (confirm('Delete selected atom(s)?')) {
                if (mol.selectedAtoms.length > 0) {
                    let i = 0;
                    let lastId = NaN;
                    for (const aid of mol.selectedAtoms) {
                        if (lastId < aid) i++;
                        mol.destroyAtom(aid - i);
                        lastId = aid;
                    }
                    mol.selectedAtoms.length = 0;
                }
                else {
                    if (hovereeId === undefined) {
                        console.log("Nothin!");
                    }
                    else mol.destroyAtom(hovereeId);
                }
            }
        }
        else {
            const mp = getMousePos();
            addingAtom = true;
            atomDropdown(() => {
                addingAtom = false;
                const selectedAtom = dropdowns['atomoptions'];
                if (selectedAtom !== 'none') {
                    mol.atoms.push(new Atom(ATOMS[selectedAtom], getMousePos()));
                    [...document.querySelector('#atom-dropdown-box').children].forEach(
                        (option) => option.classList.toggle('dropdown-item-selected', false)
                    );
                }
            });
        }
    }
    else if (e.code === 'KeyB') {
        if (e.shiftKey) {
            const bondHoveree = mol.findHoveredBond();

            if (bondHoveree === undefined) return;
            
            if (confirm('Delete selected bond?')) {
                const a1 = mol.bonds[bondHoveree].atom1;
                const a2 = mol.bonds[bondHoveree].atom2;
                mol.destroyCovalentBond(a1, a2);
            }
        }
        else {
            if (hovereeId === undefined) {
                console.log("Nothin!");
                return;
            }

            if (!bonding) {
                bonding = true;
                bondingAtom = hovereeId;

                setDraw('bondtext', (ctx) => {
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'black';
                    ctx.font = '30px Roboto';
                    ctx.fillText('Choose another atom to bond with!', canvas.width / 2, 15);
                    ctx.font = '20px Roboto';
                    ctx.fillText('Right click to change degree of bond', canvas.width / 2, 45);
                    ctx.fillText(`Bond degree: ${bondingDegree}`, canvas.width / 2, 75);
                    ctx.restore();
                });
            }
            else {
                mol.createCovalentBond(bondingAtom, hovereeId, bondingDegree);

                bonding = false;
                bondingAtom = -1;
                clearDraw('bondtext');
            }
        }
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') SHIFTING = false;
    if (e.key === 'Control') CTRLING = false;
});


let drawInstructions = {};
function setDraw(name, drawFunc) {
    drawInstructions[name] = drawFunc;
}
function clearDraw(name) {
    delete drawInstructions[name];
}

function updateFormula() {
    console.log(mol.getFormula());
    document.getElementById('chemical-formula').innerHTML = mol.getFormula();
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
            mol.translateAllConnected(draggingAtom, diff);
        }
        lastMousePos = getMousePos();
    }

    updateFormula();


    // Draw ----------------------------------------------------
    
    let bgColor = '#87b5ffff';

    if (organizeStage !== 'null' || bonding === true) bgColor = darkenColor(bgColor, 0.8);
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    mol.draw(ctx);

    if (selectingAtoms) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#444444';
        const mp = getMousePos();
        ctx.fillRect(boxCorner.x, boxCorner.y, mp.x - boxCorner.x, mp.y - boxCorner.y);
        ctx.restore();
    }

    for (const drawfunc of Object.values(drawInstructions)) drawfunc(ctx);

    // DEBUG ZONE -----------------------------------------------

    
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


updateFormula();
run();