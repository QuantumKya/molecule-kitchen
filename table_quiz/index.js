const iSymbol = document.getElementById('symbol-input');
const iNumber = document.getElementById('number-input');
const iName = document.getElementById('name-input');
const inputlist = [iSymbol, iNumber, iName];
const whiches = ['symbol', 'number', 'name'];

inputlist.forEach(inp => inp.value = '');

let targetId = -1;
let targetStr = 'unobtainium';

let currentMode = 'symbol';


// `which` can be 'symbol', 'number', or 'name'
function newGuess(which) {
    let whichId = whiches.indexOf(which);
    if (whichId === -1) return;


    const randElem = Math.floor(118*Math.random()); console.log(randElem);
    const elem = getElement(randElem); console.log(elem);

    iSymbol.value = elem.symbol;
    iNumber.value = elem.number;
    iName.value = toTitle(getElementName(randElem));

    iSymbol.disabled = true;
    iNumber.disabled = true;
    iName.disabled = true;


    targetStr = inputlist[whichId].value;
    targetId = whichId;
    inputlist[whichId].disabled = false;
    inputlist[whichId].value = '';

    if (which === 'symbol') iName.style.opacity = '0';

    document.getElementById('main').style.backgroundColor = '#ffffff';
    document.getElementById('btn-next').disabled = true;
    document.getElementById('btn-reveal').disabled = false;
}

function revealAnswer(skipped) {
    const elemFinder = whiches[targetId] === 'number' ? Number(targetStr) : targetStr;
    const elem = getElement(elemFinder);

    iSymbol.value = elem.symbol;
    iNumber.value = elem.number;
    iName.value = getElementName(elemFinder);

    inputlist.forEach(inp => { inp.disabled = true; inp.style.opacity = '100%'; });

    document.getElementById('main').style.backgroundColor = skipped ? '#ebadb3' : '#adebb3';
    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-reveal').disabled = true;
}

inputlist.forEach((inp, i) => inp.addEventListener('input', e => {
    if (targetId !== i) return;
    if (inp.value.toLowerCase() === targetStr.toLowerCase()) revealAnswer(false);
}));