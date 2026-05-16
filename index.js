const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVASWIDTH;
canvas.height = CANVASHEIGHT;

const ccenter = new Victor(canvas.width / 2, canvas.height / 2);

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



let mol = water();

function loadTemplateMolecule() {
    const newmolecule = dropdowns['templatemolecules'];
    if (!newmolecule) return;
    eval(`mol = ${newmolecule}();`);
    saveChange();
}


// undo/redo stuff

let debugMode = false;

let workSaved = true;
window.addEventListener('beforeunload', e => {
    if (!workSaved && debugMode) e.preventDefault();
    e.returnValue = '';
});

function cloneMolecule(molecule) {
    const mAtoms = molecule.atoms.map((a) => {
        const newA = new Atom(a.elemData, new Victor(a.pos.x, a.pos.y));
        return newA;
    });

    const m = new Molecule(...mAtoms);
    for (const bond of molecule.bonds) {
        m.createBond(bond.type, bond.atom1, bond.atom2, bond.degree);
    }
    for (const [aidStr, charge] of Object.entries(molecule.ionizations)) m.ionize(Number(aidStr), charge);
    return m;
}

const stateBuffer = [cloneMolecule(mol)];
let stateIndex = 0;

function updateState() {
    mol = cloneMolecule(stateBuffer[stateIndex]);
    workSaved = false;
}

function undo() {
    if (stateIndex <= 0) return;
    stateIndex--;
    updateState();
}

function redo() {
    if (stateIndex >= stateBuffer.length - 1) return;
    stateIndex++;
    updateState();
}

function saveChange() {
    stateBuffer.splice(stateIndex+1)
    stateBuffer.push(cloneMolecule(mol));
    stateIndex = stateBuffer.length - 1;
    updateState();
}



let draggingAtom = -1;
let lastMousePos = new Victor(0, 0);

let selectingAtoms = false;
let boxCorner = new Victor(0, 0);

let addingAtom = false;

let bonding = false;
let bondingAtom = -1;
let bondingDegree = 1;
let bondingType = 'covalent';

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

    if (option === 't_intersection') {
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
            if (bonding) {
                if (bondingType === 'covalent') bondingType = 'ionic';
                else if (bondingType === 'ionic') bondingType = 'covalent';
                break;
            }
            
            if (organizeStage !== 'null') {
                if (dropdowns['organizeoptions'] === 't_intersection') {
                    bendIndex += 1;
                    if (bendIndex >= 2) bendIndex = -1;
                }
                break;
            }

            if (e.shiftKey) {
                boxCorner = getMousePos();
                if (!selectingAtoms) selectingAtoms = true;
                break;
            }
            
            
            if (hovereeId === undefined) {
                console.log("Nothin!");
                break;
            }
            else {
                draggingAtom = hovereeId;
                lastMousePos = getMousePos();
                canvas.style.cursor = 'grabbing';
                break;
            }
            
            break;
        case 2:
            if (bonding) {
                bondingDegree++;
                if (bondingDegree > 3 || bondingDegree <= 0) bondingDegree = 1;
                break;
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

                    if (orgoption === 't_intersection') {
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

                    if (!mol.findNeighborIndices(centerId).includes(anchorId)) {
                        alert("Anchor atom isn't a neighbor!");
                        organizeStage = 'setAnchor';
                        anchorId = -1;
                        break;
                    }

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
                    saveChange();
                    organizeStage = 'null';

                    centerId = -1;
                    anchorId = -1;

                    if (orgoption === 't_intersection') {
                        bendIndex = NaN;
                    }
                    break;
                default:
                    break;
            }
        default:
            break;
    }
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    
    const hovereeId = mol.findHoveredAtom();
    
    if (e.button === 0) {

        if (selectingAtoms) {
            selectingAtoms = false;
            mol.findInBox(boxCorner, getMousePos());
        }
        else if (draggingAtom !== -1) {
            draggingAtom = -1;
            saveChange();
        }
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (addingAtom) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.pageX - rect.left;
    const my = e.pageY - rect.top;
    const mv = new Victor(mx, my);
    currentMousePos = mv.clone().multiply(CANVASSIZE).divide(new Victor(rect.width, rect.height));

    const hovereeId = mol.findHoveredAtom();

    if (draggingAtom !== -1) {
        canvas.style.cursor = 'grabbing';
        const diff = getMousePos().subtract(lastMousePos);
        
        if (e.ctrlKey) {
            if (mol.selectedAtoms.length > 0) mol.translateSome(diff, ...mol.selectedAtoms);
            else mol.translateOne(draggingAtom, diff);
        }
        else {
            mol.translateAllConnected(draggingAtom, diff);
        }
        saveChange();
        lastMousePos = getMousePos();
        return;
    }
    else if (hovereeId) {
        canvas.style.cursor = 'grab';
    }
    else {
        canvas.style.cursor = 'default';
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
            clearDraw('bonding');
        }

        if (addingAtom) {
            closePeriodicTable();
            addingAtom = false;
        }

        mol.selectedAtoms.length = 0;
        return;
    }

    if (organizeStage !== 'null') {
        return;
    }

    if (e.code === 'KeyZ' && e.ctrlKey) {
        if (e.shiftKey) {
            redo();
            return;
        }
        undo();
        return;
    }
    else if ((e.code === 'KeyY' && e.ctrlKey)) {
        redo();
        return;
    }

    const hovereeId = mol.findHoveredAtom();
    
    if (e.ctrlKey) return;

    if (e.code === 'KeyA') {
        if (e.shiftKey) {
            if (mol.selectedAtoms.length > 0) {
                mol.destroyAtoms(...mol.selectedAtoms);
                mol.selectedAtoms.length = 0;
                saveChange();
                return;
            }

            if (hovereeId === undefined) return;

            mol.destroyAtom(hovereeId);
            saveChange();
            return;
        }
        else {
            if (addingAtom) return;

            addingAtom = true;
            atomDropdown();
        }
    }
    else if (e.code === 'KeyB') {
        if (e.shiftKey) {
            const bondHoveree = mol.findHoveredBond();

            if (mol.selectedAtoms.length > 0) {

                let didsomething = false;
                for (const bond of [...mol.bonds]) {
                    if (mol.selectedAtoms.includes(bond.atom1) && mol.selectedAtoms.includes(bond.atom2)) {
                        mol.destroyBond(bond.atom1, bond.atom2, bond.degree);
                        didsomething = true;
                    }
                }
                if (didsomething) saveChange();
                return;
            }
            
            if (bondHoveree === undefined) return;

            const a1 = mol.bonds[bondHoveree].atom1;
            const a2 = mol.bonds[bondHoveree].atom2;
            mol.destroyBond(a1, a2);
            saveChange();
            return;
        }
        else {
            if (hovereeId === undefined) {
                console.log("Nothin!");
                return;
            }

            if (!bonding) {
                bonding = true;
                bondingAtom = hovereeId;
                bondingType = 'covalent';
                bondingDegree = 1;

                setDraw('bonding', (ctx) => {
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'black';
                    ctx.font = '30px Roboto';
                    ctx.fillText('Choose another atom to bond with!', canvas.width / 2, 15);
                    ctx.font = '20px Roboto';
                    ctx.fillText('Right click to change degree of bond, Left click to change type', canvas.width / 2, 45);
                    ctx.fillText(`Bond degree: ${bondingDegree}`, canvas.width / 2, 75);
                    ctx.fillText(`Bond type: ${bondingType}`, canvas.width / 2, 105);
                    ctx.restore();

                    const mousepos = getMousePos();
                    const atompos = mol.atoms[bondingAtom].pos;

                    ctx.save();
                    
                    ctx.globalAlpha = 0.5;

                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = BONDWIDTH;
                    ctx.beginPath();
                    ctx.moveTo(atompos.x, atompos.y);
                    ctx.lineTo(mousepos.x, mousepos.y);
                    ctx.stroke();

                    ctx.restore();
                });
            }
            else {
                if (hovereeId === bondingAtom) return;

                if (bondingType === 'covalent') mol.createCovalentBond(bondingAtom, hovereeId, bondingDegree);
                else if (bondingType === 'ionic') mol.createIonicBond(bondingAtom, hovereeId, bondingDegree);

                bonding = false;
                bondingAtom = -1;
                bondingType = '';
                clearDraw('bonding');

                saveChange();
            }
        }
    }
    else if (e.code === 'KeyR') {
        if (hovereeId === undefined) return;
        if (e.shiftKey) mol.oxidize(hovereeId);
        else mol.reduce(hovereeId);
        saveChange();
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') SHIFTING = false;
    if (e.key === 'Control') CTRLING = false;
});

const formulaholder = document.getElementById('chemical-formula');
formulaholder.addEventListener('click', (e) => {
    e.target.parentElement.querySelectorAll('p')[1].innerHTML = 'Copied!';
    setTimeout(() => e.target.parentElement.querySelectorAll('p')[1].innerHTML = 'Click to copy', 1500);
    
    const str = e.target.innerHTML.replace(/<(.*?)>/g, '');
    navigator.clipboard.writeText(str);
});

const themeselection = document.getElementById('lightdark').querySelector('div');
themeselection.childNodes.forEach(node => {
    node.addEventListener('click', e => {
        const value = e.target.innerHTML.toLowerCase();
        document.getElementById('container').className = 'theme' + value;

        localStorage.setItem('theme-preference', value);
    });
});

function clearMolecule() {
    if (!confirm('Clear everything?')) return;

    mol = new Molecule();
    saveChange();
    workSaved = true;
}


let drawInstructions = {};
function setDraw(name, drawFunc) {
    drawInstructions[name] = drawFunc;
}
function clearDraw(name) {
    delete drawInstructions[name];
}

function updateFormula() {
    document.getElementById('chemical-formula').innerHTML = mol.getFormula();
}


function runAnalyze() {
    const { groups: matchedGroups, atoms: highlightAtoms } = mol.analyze();
    console.log(highlightAtoms);

    const groupsStr = matchedGroups.length == 0 ? 'none' : matchedGroups.join(', ');

    alert(`Groups found: ${groupsStr}`);
    if (groupsStr === 'none') return;


    const startFrame = CURRENTFRAME;
    const flash = (ctx, atoms) => {
        ctx.save();


        const max = 210;
        const min = 20;
        const time = FPS/3;

        const t = getCurrentFrame() - startFrame;
        const intensity = (Math.floor(min + (1-Math.cos(Math.PI * t / time)) * (max-min) / 2)).toString(16);


        ctx.fillStyle = `#ffff00${intensity}`;
        for (const atom of atoms) {
            const a = mol.atoms[atom];
            ctx.beginPath();
            ctx.arc(a.pos.x, a.pos.y, a.radius, 0, 360);
            ctx.fill();
        }

        ctx.fillStyle = `#00ff00${intensity}`;
        mol.atoms.forEach((a, i) => {
            if (atoms.includes(i)) return;
            ctx.beginPath();
            ctx.arc(a.pos.x, a.pos.y, a.radius, 0, 360);
            ctx.fill();
        });
        
        ctx.restore();
    }

    let i = 0;
    const setNext = () => {
        clearDraw('groupFlash');
        if (i < highlightAtoms.length) {
            const currAtoms = highlightAtoms[i] ?? [];
            setDraw('groupFlash', (ctx) => flash(ctx, currAtoms));
            setTimeout(setNext, 2/3*2000);
        }
        i++;
    }
    setNext();
}

function init() {
    updateFormula();

    const themePreference = localStorage.getItem('theme-preference');
    if (themePreference) {
        document.getElementById('container').className = 'theme' + themePreference;
        setDropdown('lightdark', themePreference);
    }
}

function main() {
    // Update ---------------------------------------------------

    mol.update();

    // Update active animations
    activeAnimations = activeAnimations.filter(anim => !anim());

    updateFormula();


    // Draw ----------------------------------------------------
    
    let bgColor = '#87b5ffff';

    if (organizeStage !== 'null' || bonding || addingAtom) bgColor = darkenColor(bgColor, 0.8);
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    mol.draw(ctx);

    if (selectingAtoms) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#000000';
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


let testmol = mol;

init();
run();