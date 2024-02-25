import CameraTexture from './cameraTexture';

export default class Scene {
    constructor() {
        this.uniLocations = [];
        this.cameraTexture = new CameraTexture();
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLProgram} program
     */
    initialize(gl, program) {
        this.gl = gl;
        this.cameraTexture.connectToCamera(gl);

        this.uniLocations = [];
        this.uniLocations.push(gl.getUniformLocation(program, 'u_cameraTexture'));
        this.uniLocations.push(gl.getUniformLocation(program, 'u_cameraResolution'));
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
    setUniformValue(gl) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.cameraTexture.texture);
        this.gl.uniform1i(this.uniLocations[0], 0);
        this.gl.uniform2f(this.uniLocations[1], this.cameraTexture.width, this.cameraTexture.height);
    }
}
