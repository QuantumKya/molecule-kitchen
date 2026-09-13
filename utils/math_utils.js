function polarLerp(start, target, t, center = new Victor(0, 0), counterclockwise = true) {
    const st = start.clone().subtract(center);
    const tg = target.clone().subtract(center);
    
    const stangle = st.angle();
    let tgangle = tg.angle();

    let deltangle = tgangle - stangle;
    deltangle = ((deltangle + Math.PI) % (2 * Math.PI)) - Math.PI;

    if (counterclockwise && deltangle < 0) deltangle += 2 * Math.PI;
    if (!counterclockwise && deltangle > 0) deltangle -= 2 * Math.PI;

    const lerpangle = stangle + deltangle * t;

    const strad = st.length();
    const tgrad = tg.length();

    const lerprad = (1-t)*strad + t*tgrad;

    return new Victor(Math.cos(lerpangle), Math.sin(lerpangle)).multiplyScalar(lerprad).add(center);
}

function findDistance(l1, l2, p) {
    const seg = l2.clone().subtract(l1);
    const pointPointer = p.clone().subtract(l1);

    const project = pointPointer.dot(seg) / seg.lengthSq();

    if (project < 0 || project > 1) return NaN;

    const parallelogramArea = Math.abs(l2.clone().subtract(l1).cross(p.clone().subtract(l1)));
    const base = l2.clone().subtract(l1).length();
    return parallelogramArea / base;
}

function polarVec(angle, radius) {
    return new Victor(Math.cos(angle), Math.sin(angle)).multiplyScalar(radius);
}

function clampToAngleSpace(angle) {
    return (angle + Math.PI) % (Math.PI * 2) - Math.PI;
}

/** @param {number} value @param {number} interval @returns {number} */
function roundToInterval(value, interval) {
    return Math.round(value / interval) * interval;
}

/** @param {Victor} vec @param {number} interval @returns {Victor} */
function roundVecInterval(vec, interval) {
    const rx = Math.round(vec.x / interval) * interval;
    const ry = Math.round(vec.y / interval) * interval;
    return new Victor(roundToInterval(vec.x, ), ry);
}

function truncateToDecimals(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
}

function getIntOscillation(t, p, min, max) { return Math.floor(min + (1 - Math.cos(2 * Math.PI * t / p)) * (max-min) / 2); }