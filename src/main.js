import Renderer from './renderer.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas');
    const renderer = new Renderer(canvas);

    renderer.initialize();
    renderer.render();
});

// resizeCanvas() {
//     const parent = this.canvas.parentElement;
//     this.canvas.style.width = parent.clientWidth + 'px';
//     this.canvas.style.height = parent.clientHeight + 'px';
//     this.canvas.width = parent.clientWidth * this.pixelRatio;
//     this.canvas.height = parent.clientHeight * this.pixelRatio;
// }
