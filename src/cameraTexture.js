import GLUtils from './glUtils.js';

export default class CameraTexture {
    /** @type {HTMLVideoElement} */
    video;
    /** @type {boolean} */
    isPlayingVideo;
    /** @type {WebGLTexture} */
    texture;
    /** @type {number} */
    width;
    /** @type {number} */
    height;
    
    constructor() {
        this.video = document.createElement('video');
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    connectToCamera(gl) {
        const media = { video: true, audio: false };
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(media).then(
                (localMediaStream) => {
                    this.video.srcObject = localMediaStream;
                    const canplayListener = () => {
                        this.video.play();
                        this.isPlayingVideo = true;
                        this.width = this.video.videoWidth;
                        this.height = this.video.videoHeight;
                        this.texture = GLUtils.CreateRGBUnsignedByteTextures(gl,
                                                                             this.video.videoWidth,
                                                                             this.video.videoHeight,
                                                                             1)[0];
                        this.video.removeEventListener('canplay', canplayListener);
                    };
                    this.video.addEventListener('canplay', canplayListener);
                },
                (error) => {
                    console.error(error);
                });
        } else {
            console.error('getUserMedia is not supported.');
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    updateTexture(gl) {
        if (this.isPlayingVideo) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                          gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        }
    }
}
