let CURRENTFRAME = 0;
const FPS = 50;
function getCurrentFrame() { return CURRENTFRAME; }
function incrementFrame() { CURRENTFRAME++; }



let currentMousePos = new Victor(0, 0);
function getMousePos() { return currentMousePos.clone(); }

let SHIFTING = false;
let CTRLING = false;