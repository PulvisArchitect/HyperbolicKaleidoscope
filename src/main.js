import Renderer from './renderer.js';
import Scene from './scene.js';

window.addEventListener('load', () => {
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
    scene.initialize(renderer.gl, renderer.renderProgram);

    const startTime = Date.now();
    const render = () => {
        scene.animate(Date.now() - startTime);
        scene.onUpdate(renderer.gl);
        renderer.render(scene);
        window.requestAnimationFrame(render);
    }
    render();
3
    let resizeTimer = setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        window.setTimeout(resizeCanvas, 500);
    });
});
