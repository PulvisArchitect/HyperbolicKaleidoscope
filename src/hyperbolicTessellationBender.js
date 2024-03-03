import Vec2 from './vec2.js';
import Vec3 from './vec3.js';
import Circle from './circle.js';
import StereoProjector from './stereoProjector.js';

export default class HyperbolicTessellation {
    /** @type {Vec2} */
    isect1;
    /** @type {Vec2} */
    isect2;
    constructor() {
        this.circle1 = new Circle(new Vec2(1.2631, 0), 0.771643);
        this.circle2 = new Circle(new Vec2(0, 1.2631), 0.771643);

        this.bendX = 0;
        this.bendY = 0;//-0.6;
        this.x = 0.57735;
        this.y = 0.57735;
        const xRotate = [1, 0, 0,
                         0, Math.cos(this.bendX), Math.sin(this.bendX),
                         0, Math.sin(this.bendX), Math.cos(this.bendX)];
        const yRotate = [Math.cos(this.bendY), 0, Math.sin(this.bendY),
                         0, 1, 0,
                         -Math.sin(this.bendY), 0, Math.cos(this.bendY)];

        this.c1 = this.computeCircleFromUpperAndLower(
            this.applyMat3(xRotate,
                           new Vec3(0, this.y, Math.sqrt(1. - this.y * this.y))),
            this.applyMat3(xRotate,
                           new Vec3(0, this.y, -Math.sqrt(1. - this.y * this.y))));
        this.c2 = this.computeCircleFromUpperAndLower(
            this.applyMat3(yRotate,
                           new Vec3(this.x, 0, Math.sqrt(1. - this.x * this.x))),
            this.applyMat3(yRotate,
                           new Vec3(this.x, 0, -Math.sqrt(1. - this.x * this.x))));
        console.log(this.c1, this.c2);
        [this.isect1, this.isect2] = Circle.getIntersection(this.c1, this.c2);
        console.log(this.isect1, this.isect2);
    }

    /**
     * @param {Vec3} upper
     * @param {Vec3} lower
     * @returns {Circle}
     */
    computeCircleFromUpperAndLower(upper, lower) {
        const p1 = StereoProjector.reverseProject(upper);
        const p2 = StereoProjector.reverseProject(lower);
        return new Circle(p1.add(p2).scale(0.5),
                          Vec2.distance(p1, p2) * 0.5);
    }

    /**
     * @param {Array<number>} m
     * @param {Vec3} p
     * @returns {Vec3}
     */
    applyMat3(m, p) {
        return new Vec3(p.x * m[0] + p.y * m[1] + p.z * m[2],
                        p.x * m[3] + p.y * m[4] + p.z * m[5],
                        p.x * m[6] + p.y * m[7] + p.z * m[8]);
    }
}
