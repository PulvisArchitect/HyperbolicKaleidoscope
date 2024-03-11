import CameraTexture from './cameraTexture.js';
import HyperbolicTessellation from './hyperbolicTessellationBender.js';
import Vec2 from './vec2.js';

export default class Scene {
    constructor() {
        this.uniLocations = [];
        this.cameraTexture = new CameraTexture();
        this.hyperbolicTessellation = new HyperbolicTessellation();

        this.translation = new Vec2(0, 0);
        this.scale = 2;
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLProgram} program
     */
    initialize(gl, program) {
        this.gl = gl;
        this.cameraTexture.connectToCamera(gl);

        this.uniLocations = [];
        this.uniLocations.push(gl.getUniformLocation(program, 'u_translation'));
        this.uniLocations.push(gl.getUniformLocation(program, 'u_scale'));
        
        this.uniLocations.push(gl.getUniformLocation(program, 'u_cameraTexture'));
        this.uniLocations.push(gl.getUniformLocation(program, 'u_cameraResolution'));

        this.uniLocations.push(gl.getUniformLocation(program, 'u_circle1'));
        this.uniLocations.push(gl.getUniformLocation(program, 'u_circle2'));

        this.uniLocations.push(gl.getUniformLocation(program, 'u_cornerUpperRight'));
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    onUpdate(gl) {
        this.cameraTexture.updateTexture(gl);
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    setUniformValues(gl) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], this.translation.x, this.translation.y);
        this.gl.uniform1f(this.uniLocations[i++], this.scale);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.cameraTexture.texture);
        this.gl.uniform1i(this.uniLocations[i++], 0);
        this.gl.uniform2f(this.uniLocations[i++], this.cameraTexture.width, this.cameraTexture.height);

        this.gl.uniform3f(
            this.uniLocations[i++],
            this.hyperbolicTessellation.c1.center.x,
            this.hyperbolicTessellation.c1.center.y,
            this.hyperbolicTessellation.c1.r);
        this.gl.uniform3f(
            this.uniLocations[i++],
            this.hyperbolicTessellation.c2.center.x,
            this.hyperbolicTessellation.c2.center.y,
            this.hyperbolicTessellation.c2.r);

        this.gl.uniform2f(
            this.uniLocations[i++],
            this.hyperbolicTessellation.corner.x,
            this.hyperbolicTessellation.corner.y
        );
    }
}
