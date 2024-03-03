import Renderer from './renderer.js';
import Scene from './scene.js';

window.addEventListener('load', () => {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector('#canvas');
    const renderer = new Renderer(canvas);
    const scene = new Scene();

    renderer.initialize();
    scene.initialize(renderer.gl, renderer.renderProgram);

    const render = () => {
        scene.onUpdate(renderer.gl);
        renderer.render(scene);
        window.requestAnimationFrame(render);
    }
    render();
});

// resizeCanvas() {
//     const parent = this.canvas.parentElement;
//     this.canvas.style.width = parent.clientWidth + 'px';
//     this.canvas.style.height = parent.clientHeight + 'px';
//     this.canvas.width = parent.clientWidth * this.pixelRatio;
//     this.canvas.height = parent.clientHeight * this.pixelRatio;
// }
