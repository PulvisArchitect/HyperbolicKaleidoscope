import Vec2 from './vec2.js';

export default class Circle {
    /** @type {Vec2} */
    center;
    /** @type {number} */
    r;
    /**
     * @param {Vec2} center
     * @param {number} r
     */
    constructor(center, r) {
        this.center = center;
        this.r = r;
    }

    /**
     * Apply inversion to a given point
     * @param {Vec2} p
     * @returns {Vec2}
     */
    invertOnPoint (p) {
        const r2 = this.r * this.r;
        const d = p.sub(this.center);
        const lenSq = d.lengthSq();
        return d.scale(r2 / lenSq).add(this.center);
    }

    /**
     * Apply inversion to a given circle
     * @param {Circle} c
     * @returns {Circle}
     */
    invertOnCircle (c) {
        const coeffR = c.r * Math.sqrt(2) / 2;
        const p1 = this.invertOnPoint(c.center.add(new Vec2(coeffR, coeffR)));
        const p2 = this.invertOnPoint(c.center.add(new Vec2(-coeffR, -coeffR)));
        const p3 = this.invertOnPoint(c.center.add(new Vec2(coeffR, -coeffR)));
        return Circle.fromPoints(p1, p2, p3);
    }

    /**
     * @param {Circle} c1
     * @param {Circle} c2
     * @returns {[Vec2, Vec2]}
     */
    static getIntersection(c1, c2) {
        const d = c1.center.sub(c2.center);
        const dot = Vec2.dot(d, d);
        const a = Math.pow((dot + c2.r * c2.r - c1.r * c1.r) / 2, 2);
        if (dot * c2.r * c2.r - a < 2) throw new Error('Unable to compute intersections');
        const numR = Math.sqrt(dot * c2.r * c2.r - a);
        return [new Vec2((a * d.x + d.y * numR) / dot + c2.center.x, (a * d.y - d.x * numR) / dot + c2.center.y),
                new Vec2((a * d.x - d.y * numR) / dot + c2.center.x, (a * d.y + d.x * numR) / dot + c2.center.y)];
    }

    /**
     * Compute a circle passing through three points
     * @param {Vec2} a
     * @param {Vec2} b
     * @param {Vec2} c
     * @returns {Circle}
     */
    static fromPoints (a, b, c) {
        const lA = Vec2.distance(b, c);
        const lB = Vec2.distance(a, c);
        const lC = Vec2.distance(a, b);
        const coefA = lA * lA * (lB * lB + lC * lC - lA * lA);
        const coefB = lB * lB * (lA * lA + lC * lC - lB * lB);
        const coefC = lC * lC * (lA * lA + lB * lB - lC * lC);
        const denom = coefA + coefB + coefC;
        const center = new Vec2((coefA * a.x + coefB * b.x + coefC * c.x) / denom,
                                (coefA * a.y + coefB * b.y + coefC * c.y) / denom);
        const r = Vec2.distance(center, a);
        return new Circle(center, r);
    }
}
