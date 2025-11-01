const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 700;



const C1 = new Atom(atoms.carbon, new Victor(200, 310), 65);
const C2 = new Atom(atoms.carbon, new Victor(500, 310), 65);
const H1 = new Atom(atoms.hydrogen, new Victor(200, 150), 45);
const H2 = new Atom(atoms.hydrogen, new Victor(200, 450), 45);
const H3 = new Atom(atoms.hydrogen, new Victor(500, 150), 45);
const H4 = new Atom(atoms.hydrogen, new Victor(500, 450), 45);

const m1 = new Molecule(C1, C2, H1, H2, H3, H4);
m1.createCovalentBond(0, 1, 2);
m1.createCovalentBond(0, 2, 1);
m1.createCovalentBond(0, 3, 1);
m1.createCovalentBond(1, 4, 1);
m1.createCovalentBond(1, 5, 1);





function main() {
    ctx.fillStyle = '#87b5ffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    m1.draw(ctx);
}


canvas.addEventListener('mousemove', (e) => {
    const mx = e.pageX - e.clientX;
    const my = e.pageY - e.clientY;
    currentMousePos = new Victor(mx, my); 
});



function run() {
    CURRENTFRAME++;
    const startTime = Date.now();


    main();


    const endTime = Date.now();
    const elapsed = endTime - startTime;
    if (elapsed < 1000 / FPS) setTimeout(run, 1000 / FPS - elapsed);
    else requestAnimationFrame(run);
}
run();