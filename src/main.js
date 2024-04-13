import GUI from 'lil-gui';
import Renderer from './renderer.js';
import Scene from './scene.js';

window.addEventListener('load', async () => {

    const gui = new GUI();
    
    const queryParams = new URL(decodeURIComponent(document.location.href)).searchParams;
    console.log(queryParams.get('hoge'));
    console.log(queryParams.get('debug') === 'true');
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector('#canvas');
    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.style.width = parent.clientWidth + 'px';
        canvas.style.height = parent.clientHeight + 'px';
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }
    resizeCanvas();
    const renderer = new Renderer(canvas);
    const scene = new Scene();

    renderer.initialize();
    await scene.initialize(renderer.gl, renderer.renderProgram);
    gui.add(scene, 'defaultScale', 0, 10, 0.1).onChange(
        /** @param {number} value */
        value => {
            scene.scale = value
        });
    gui.add(scene.cameraTexture, 'frameDelayMillis', 0, 1000, 1);
    gui.add(scene, 'enableFaceDetection').onChange(() => {
        scene.scale = scene.defaultScale;
    });
    gui.addColor(scene, 'backgroundColor');

    const startTime = Date.now();
    const render = async () => {
        scene.animate(Date.now() - startTime);
        await scene.onUpdate(renderer.gl);
        renderer.render(scene);
        window.requestAnimationFrame(render);
    }
    render();

    let resizeTimer = setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        window.setTimeout(resizeCanvas, 500);
    });
});
