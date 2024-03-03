import Vec2 from './vec2.js';
import Vec3 from './vec3.js';

export default class StereoProjector{

    constructor() {
    }

    /**
     * @param {Vec2} pos
     * @returns {Vec3}
     */
    static project(pos) {
        const d = Vec2.dot(pos, pos);
        return new Vec3((2 * pos.x) / (1 + d),
                        (2 * pos.y) / (1 + d),
                        (-1 + d) / (1 + d));
    }

    /**
     * @param {Vec3} pos
     * @returns {Vec2}
     */
    static reverseProject(pos) {
        return new Vec2(pos.x / (1 - pos.z), pos.y / (1 - pos.z));
    }
}
