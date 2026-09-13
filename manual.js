const manualContents = {
    'edit': {
        'move': "Click and drag an atom to move it and others connected to it!\nHold Shift to only move one atom at once.",
        'add_atom': "Add a new atom where you click.",
        'delete_atom': "Click on an atom to delete it and its bonds.",
        'bond': "Create a covalent bond between two atoms.",
        'unbond': "Destroy a covalent bond between two atoms.",
    },
    'organize': {
        'rotate_one': "Rotate an atom around another atom.",
        'rotate_all': "Rotate every neighbor of a certain atom by the same angle.",
        'same_distance': "Set every atom connected to a certain other atom to be the same distance from it.",
        'equally_angled': "Angle every atom connected to a certain other atom to be of a constant angle between each other. Each will be one-nth of the way around.",
        't_intersection': "Organize three atoms around a central one to form a T-shaped intersection.\nRight click on the central atom, then on a second atom. This \"anchor\" atom will be the center, left, or right of the intersection depending on what the bend index is. 0 is center, -1 is left, and 1 is right. Left click while selecting to change the bend index.",
    }
}

function updateRightManual() {
    const mode = dropdowns['organizeoptions'];

    const manual = document.getElementById('organizemanual');

    manual.querySelector('h2').innerHTML = `Right Click — ${toTitle(mode)}`;
    manual.querySelector('p').innerHTML = manualContents.organize[mode];
}