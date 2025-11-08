const dropdowns = {};

function adddropdown(nodeid, autoclose = false, display = false, defaultValue = '') {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdownbox = dropdowndiv.querySelector('.dropdown-box');

    dropdownbox.childNodes.forEach((node) => {
        node.addEventListener('mousedown', (e) => {
            const value = node.innerHTML.toLowerCase();

            dropdowns[nodeid] = value;
            console.log(dropdowns[nodeid]);

            [...dropdownbox.children].forEach(
                (option) => option.classList.toggle('dropdown-item-selected', dropdowns[nodeid] === option.innerHTML.toLowerCase())
            );
            
            if (display) {
                const display = dropdowndiv.querySelector('.dropdown-display');
                display.innerHTML = `Selected: <i>${node.innerHTML}</i>`;
            }
            if (autoclose) setTimeout(() => dropdown(nodeid), 150);
        });
    });

    dropdowns[nodeid] = defaultValue;
}

function dropdown(nodeid) {
    const dropdowndiv = document.getElementById(nodeid);
    const dropdowncontent = dropdowndiv.querySelector('.dropdown-box');
    dropdowncontent.classList.toggle('dropdown-show');
}