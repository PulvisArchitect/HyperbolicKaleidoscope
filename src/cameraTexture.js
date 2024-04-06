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
    /** @type {Array<WebGLTexture>} */
    textures = new Array(5);
    /** @type {Array<ImageBitmap>} */
    frames = new Array(5);
    updateTimeMillis = 0;
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
                        this.textures = GLUtils.CreateRGBUnsignedByteTextures(gl,
                                                                              this.video.videoWidth,
                                                                              this.video.videoHeight,
                                                                              5);
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
    async updateTexture(gl) {
        if (this.isPlayingVideo) {
            const frame = await createImageBitmap(this.video);
            console.log(frame);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                          gl.RGBA, gl.UNSIGNED_BYTE, frame);
            if(this.updateTimeMillis === 0) {
                console.log(this.textures);
                for(let i = 0; i < this.textures.length; i++) {
                    // const frame = await createImageBitmap(this.video);
                    gl.activeTexture(gl.TEXTURE0 + i + 1);
                    gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                                  gl.RGBA, gl.UNSIGNED_BYTE, frame);
                    this.frames[i] = await createImageBitmap(this.video);
                    //this.textures[i] = this.texture;
                }
                this.updateTimeMillis = Date.now();
                console.log(this.updateTimeMillis);
            } else {
                if(Date.now() - this.updateTimeMillis > 1000) {
                    //console.log(Date.now() - this.updateTimeMillis);
                    //console.log('updated!');
                    for(let i = this.textures.length; i >= 1; i--) {
                        this.frames[i] = this.frames[i - 1];
                    }
                    this.frames[0] = frame;
                    //console.log(this.frames);
                    for (let i = 0; i < this.textures.length; i++) {
                        gl.activeTexture(gl.TEXTURE0 + i + 1);
                        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                                      gl.RGBA, gl.UNSIGNED_BYTE, this.frames[i]);
                    }
                    // for(let i = this.textures.length; i >= 1; i--) {
                    //     this.textures[i] = this.textures[i - 1];
                    // }
                    // this.textures[0] = this.texture;
                    // for (let i = 0; this.textures.length; i++) {
                    //     gl.activeTexture(gl.TEXTURE0 + i + 1);
                    //     gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    //                   gl.RGBA, gl.UNSIGNED_BYTE, this.frames[i]);
                    // }
                    this.updateTimeMillis = Date.now();
                }
            }
        }
    }
}
