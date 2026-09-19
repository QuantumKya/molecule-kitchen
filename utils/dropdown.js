const dropdowns = {};

function adddropdown(nodeid, autoclose = false, display = false, defaultValue = 'none') {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdownbox = dropdowndiv.querySelector('.dropdown-box');

    dropdownbox.childNodes.forEach((node) => {
        node.addEventListener('mousedown', (e) => {
            const value = e.target.textContent.replaceAll(' ', '_').toLowerCase();

            dropdowns[nodeid] = value;
            console.log(dropdowns[nodeid]);

            [...dropdownbox.children].forEach(
                (option) => option.classList.toggle('dropdown-item-selected', dropdowns[nodeid] === option.textContent.replaceAll(' ', '_').toLowerCase())
            );
            
            if (display) {
                const display = dropdowndiv.querySelector('.dropdown-display');
                display.innerHTML = `Selected: <i>${toTitle(e.target.textContent)}</i>`;
            }
            if (autoclose) setTimeout(() => dropdown(nodeid), 150);
        });
    });

    const entries = [...dropdownbox.children].map(option => option.textContent.replaceAll(' ', '_').toLowerCase());
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
    
    if (nodeid === 'organizeoptions') updateRightManual();
}

function setDropdown(nodeid, value) {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdownbox = dropdowndiv.querySelector('.dropdown-box');

    dropdowns[nodeid] = value;
    [...dropdownbox.children].forEach(
        (option) => option.classList.toggle('dropdown-item-selected', value === option.textContent.replaceAll(' ', '_').toLowerCase())
    );
}