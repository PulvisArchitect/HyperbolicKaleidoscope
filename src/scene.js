import CameraTexture from './cameraTexture.js';
import HyperbolicTessellation from './hyperbolicTessellationBender.js';
import Vec2 from './vec2.js';
import VideoFaceDetector from './videoFaceDetector.js';

export default class Scene {
    /** @type {Array<import("@mediapipe/tasks-vision").Detection>} */
    detectedFaces = [];
    prevFaceRatio = -1;
    faceRatio = -1;
    constructor() {
        this.uniLocations = [];
        this.cameraTexture = new CameraTexture();
        this.hyperbolicTessellation = new HyperbolicTessellation();
        this.videoFaceDetector = new VideoFaceDetector(this.cameraTexture.video);

        this.translation = new Vec2(0, 0);
        this.scale = 4.5;
    }

    processDetection() {
        if(this.detectedFaces.length === 0) {
            return;
        }

        let maxFaceSize = -1;
        for(const detection of this.detectedFaces) {
            maxFaceSize = Math.max(maxFaceSize,
                                   detection.boundingBox.height);
        }

        this.prevFaceRatio = this.faceRatio;
        this.faceRatio = maxFaceSize / (this.cameraTexture.height);

        const defaultScale = 4.5;

        this.faceRatio = (Math.round(this.faceRatio * 100) / 100);
        console.log(this.faceRatio);
        const targetScale = defaultScale - 5 * ((this.faceRatio - 0.3));

        // face scaleと対応するスケール基準値を設定しておく
        // 常にそれに合うようにスケールが上下する
        // 顔が検出されなくなった時にはデフォルト値に戻る
        if(Math.abs(targetScale - this.scale) < 0.015) {
            this.scale = targetScale;
        } else if(targetScale < this.scale){
            this.scale -= 0.01;
        } else {
            this.scale += 0.01;
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLProgram} program
     */
    async initialize(gl, program) {
        this.gl = gl;
        this.cameraTexture.connectToCamera(gl);
        await this.videoFaceDetector.initialize();

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
     * @param {number} elapsedTimeMillis
     */
    animate(elapsedTimeMillis) {
        let t = elapsedTimeMillis / 100;
        const limit = 617;
        t = t % limit * 2;
        if(t >= limit) {
            t = limit - (t - limit);
        }
        //t = 617
        //console.log(t);
        this.hyperbolicTessellation.bendY = - t / 1000;
        this.hyperbolicTessellation.compute();
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    onUpdate(gl) {
        this.cameraTexture.updateTexture(gl);
        if(this.cameraTexture.isPlayingVideo) {
            this.detectedFaces = this.videoFaceDetector.detect();
            this.processDetection();
        }
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
