const dropdowns = {};

function adddropdown(nodeid, autoclose = false, display = false, defaultValue = 'none') {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdownbox = dropdowndiv.querySelector('.dropdown-box');

    dropdownbox.childNodes.forEach((node) => {
        node.addEventListener('mousedown', (e) => {
            const value = e.target.innerHTML.toLowerCase();

            dropdowns[nodeid] = value;
            console.log(dropdowns[nodeid]);

            [...dropdownbox.children].forEach(
                (option) => option.classList.toggle('dropdown-item-selected', dropdowns[nodeid] === option.innerHTML.toLowerCase())
            );
            
            if (display) {
                const display = dropdowndiv.querySelector('.dropdown-display');
                display.innerHTML = `Selected: <i>${toTitle(e.target.innerHTML)}</i>`;
            }
            if (autoclose) setTimeout(() => dropdown(nodeid), 150);
        });
    });

    const entries = [...dropdownbox.children].map(option => option.innerHTML.toLowerCase());
    if (entries.includes(defaultValue)) setDropdown(nodeid, defaultValue);

    if (display) {
        const display = dropdowndiv.querySelector('.dropdown-display');
        display.innerHTML = `Selected: <i>${toTitle(defaultValue)}</i>`;
    }
}

function dropdown(nodeid) {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdowncontent = dropdowndiv.querySelector('.dropdown-box');
    dropdowncontent.classList.toggle('dropdown-show');
    
    if (nodeid === 'edittools') updateLeftManual();
    if (nodeid === 'organizeoptions') updateRightManual();
}

function setDropdown(nodeid, value) {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdownbox = dropdowndiv.querySelector('.dropdown-box');

    dropdowns[nodeid] = value;
    [...dropdownbox.children].forEach(
        (option) => option.classList.toggle('dropdown-item-selected', value === option.innerHTML.toLowerCase())
    );
}

function closePeriodicTable() {
    const ptable = document.getElementById('periodic_table');
    ptable.style.display = 'none';
}

function openPeriodicTable() {
    const ptable = document.getElementById('periodic_table');
    ptable.style.display = 'block';
}

function initPeriodicTable() {
    const ptable = document.getElementById('periodic_table');
    for (const divpp of ptable.querySelectorAll('div')) {
        for (const divp of divpp.querySelectorAll('div')) {
            for (const div of divp.querySelectorAll('div')) {
                const element = Object.entries(ELEMENTS).find(el => el[1].symbol === div.innerHTML);
                if (!element) continue;

                div.addEventListener('click', e => {
                    if (e.button === 0) {
                        dropdowns['atomoptions'] = element[0];
                        addAtomFromDropdown();
                        closePeriodicTable();
                    }
                });
            }
        }
    }

    dropdowns['atomoptions'] = 'none';
}


const addAtomFromDropdown = (e) => {
    addingAtom = false;
    const selectedAtom = dropdowns['atomoptions'];
    if (selectedAtom !== 'none') {
        mol.atoms.push(new Atom(ELEMENTS[selectedAtom], getMousePos()));
        saveChange();
    }
}

function atomDropdown() {
    const atomdropdown = document.getElementById('atomoptions');
    const canvas = document.querySelector('canvas').getBoundingClientRect();
    
    const mp = getMousePos().clone().divide(CANVASSIZE).multiply(new Victor(canvas.width, canvas.height));
    const x = mp.x + canvas.left;
    const y = mp.y + canvas.top;
    
    atomdropdown.style.left = `${x}px`;
    atomdropdown.style.top = `${y}px`;
    
    atomdropdown.querySelector('button').click();
}