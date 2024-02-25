import GLUtils from './glUtils.js';
import Vec2 from './vec2.js';

/** @type {string} */
// @ts-ignore
const RENDER_VERTEX = require('./shader/render.vert');
/** @type {string} */
// @ts-ignore
const RENDER_FRAGMENT = require('./shader/render.frag');

export default class Renderer {
    /** @type {Array<WebGLUniformLocation>} */
    uniLocations;
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.isRendering = false;

        this.translation = new Vec2(0, 0);
        this.scale = 200;
    }

    initialize() {
        this.gl = GLUtils.GetWebGL2Context(this.canvas);
        this.vertexBuffer = GLUtils.CreateSquareVbo(this.gl);
        this.renderProgram = this.gl.createProgram();
        GLUtils.AttachShader(this.gl, RENDER_VERTEX,
                             this.renderProgram, this.gl.VERTEX_SHADER);
        GLUtils.AttachShader(this.gl, RENDER_FRAGMENT,
                             this.renderProgram, this.gl.FRAGMENT_SHADER);
        GLUtils.LinkProgram(this.gl, this.renderProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderProgram,
                                                       'a_vertex');
        this.gl.enableVertexAttribArray(this.renderVAttrib);
        this.initializeUniormLocations();
    }

    initializeUniormLocations() {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram, 'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram, 'u_translation'));
        this.uniLocations.push(this.gl.getUniformLocation(this.renderProgram, 'u_scale'));
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    setUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform2f(this.uniLocations[i++], this.translation.x, this.translation.y);
        this.gl.uniform1f(this.uniLocations[i++], this.scale);
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderProgram);
        this.setUniformValues(this.canvas.width, this.canvas.height);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }
}
