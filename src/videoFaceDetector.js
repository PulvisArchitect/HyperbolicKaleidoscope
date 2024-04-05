import {
  FaceDetector,
  FilesetResolver
} from '@mediapipe/tasks-vision';

export default class VideoFaceDetector {
    /**
     * @param {HTMLVideoElement} video
     */
    constructor(video) {
        this.video = video;
    }

    async initialize() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        this.faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                delegate: "GPU"
            },
            runningMode: 'VIDEO'
        });
    }

    /**
     * @returns {Array<import("@mediapipe/tasks-vision").Detection>}
     */
    detect() {
        const detections = this.faceDetector.detectForVideo(this.video, Date.now()).detections;
        return detections;
    }
}
