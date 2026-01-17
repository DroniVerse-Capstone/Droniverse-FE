
export function normalizeAngle(deg: number) {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
}
