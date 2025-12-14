const loadbutton = document.getElementById('loadmolecule');
const moleculeinput = loadbutton.parentElement.querySelector('input');
loadbutton.onclick = (e) => {
    moleculeinput.click();
};
moleculeinput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const fileContents = e.target.result;
            switch (file.name.split('.').pop().toLowerCase()) {
                case 'json':
                    mol = decodeMoleculeJSON(fileContents);
                    saveChange();
                    break;
                case 'mkf':
                    mol = cloneMolecule(decodeMolecule(fileContents));
                    console.log(testmol)
                    console.log(mol);
                    console.log(testmol == mol);
                    saveChange();
                    break;
                default:
                    alert('Unaccepted file type given. Try again.');
                    break;
            }
        }

        reader.onerror = (e) => {
            alert("There was an error reading your file. Check console for more details.");
            console.error("Error reading loaded file:", e.target.error);
        }

        reader.readAsText(file);
    }
};

function encodeMolecule(molecule) {
    let dataString = '';
    
    for (const atom of molecule.atoms) {
        const sym = atom.elemData.symbol;
        const pos = `${String(Math.fround(atom.pos.x))},${String(Math.fround(atom.pos.y))}`;
        
        dataString += `${sym}${pos}`;
    }

    dataString += ';';
    for (const bond of molecule.bonds) {
        dataString += `${{'covalent': 'c', 'ionic': 'i'}[bond.type]}:${bond.atom1}>${bond.atom2}^${bond.degree},`;
    }

    dataString = dataString.slice(0, -1);

    const filename = prompt('What\'s your molecule called?', 'molecule');
    saveTextToFile(dataString, `${filename}.mkf`);
}

function decodeMolecule(data) {
    const [ atomData, bondData ] = data.split(';');

    const doubleSections = atomData.split(/([A-Za-z]+)/g).filter(Boolean);
    let atoms = [];
    for (let i = 0; i < doubleSections.length; i += 2) {
        const atomElement = getElement(doubleSections[i]);
        const atomPos = Victor.fromArray(doubleSections[i+1].split(',').map(Number));

        const atom = new Atom(atomElement, atomPos);
        atoms.push(atom);
    }
    
    const molecule = new Molecule(...atoms);
    
    const bondSections = bondData.split(/[:>^,]/g);
    console.log(bondSections);
    for (let i = 0; i < bondSections.length; i += 4) {
        molecule.createBond(
            {'c': 'covalent', 'i': 'ionic'}[bondSections[i]],
            ...bondSections.slice(i+1, i+4).map(Number)
        );
    }

    return molecule;
}

function encodeMoleculeJSON(molecule) {
    const molData = {};

    molData['atoms'] = [];
    for (const atom of molecule.atoms) {
        molData.atoms.push({
            symbol: atom.elemData.symbol,
            position: { x: Math.fround(atom.pos.x), y: Math.fround(atom.pos.y) }
        });
    }

    molData['bonds'] = [];
    for (const bond of molecule.bonds) {
        molData.bonds.push({
            type: bond.type,
            atomId1: bond.atom1,
            atomId2: bond.atom2,
            order: bond.degree
        });
    }

    const filename = prompt('What\'s your molecule called?', 'molecule');
    saveTextToFile(JSON.stringify(molData), `${filename}.json`);
}

function decodeMoleculeJSON(data) {
    const moleculeData = JSON.parse(data);
    
    const atoms = moleculeData.atoms.map(atomData => new Atom(
        getElement(atomData.symbol),
        Victor.fromObject(atomData.position)
    ));
    const molecule = new Molecule(...atoms);
    moleculeData.bonds.forEach(bond => molecule.createBond(bond.type, bond.atomId1, bond.atomId2, bond.order));
    return molecule;
}