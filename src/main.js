import GUI from 'lil-gui';
import Renderer from './renderer.js';
import Scene from './scene.js';

window.addEventListener('load', async () => {
    const queryParams = new URL(decodeURIComponent(document.location.href)).searchParams;
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

    const startTime = Date.now();
    if(queryParams.get('debug') === 'true') {
        const gui = new GUI();
        gui.add(scene, 'defaultScale', 0, 10, 0.1).listen().onChange(
            /** @param {number} value */
            value => {
                scene.scale = value
            });
        gui.add(scene.cameraTexture, 'frameDelayMillis', 0, 1000, 1).listen();
        gui.add(scene, 'enableFaceDetection').listen().onChange(() => {
            scene.scale = scene.defaultScale;
        });
        gui.add(scene, 'enableAnimation');
        gui.addColor(scene, 'backgroundColor').listen();
        gui.add(scene, 'speedFactor', 0, 10);
        gui.add(scene, 'timeSlide', 0, 617).listen().onChange(() => {
            scene.computeCircles(0);
            renderer.render(scene);
        })

        gui.add(scene, 'downloadParameters');
        gui.add(scene, 'faceRatio', 0, 1).listen().disable();
        gui.add(scene, 'scale', 0, 5).listen().disable();
    }

    setNumberParamIfExists(queryParams, scene, 'defaultScale');
    setNumberParamIfExists(queryParams, scene.cameraTexture, 'frameDelayMillis');
    setBooleanParamIfExists(queryParams, scene, 'enableFaceDetection');
    setArrayParamIfExists(queryParams, scene, 'backgroundColor', 3);

    if(queryParams.has('loggingURL')) {
        const url = queryParams.get('loggingURL');
        await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                text: 'Lost Mirrorsが起動されました'
            })
        });
    }

    let prevMillis = Date.now();
    const fps = 60
    const stepMillis = (1 / fps) * 1000;
    const render = async () => {
        if ((Date.now() - prevMillis) > stepMillis) {
            scene.animate(Date.now() - startTime);
            await scene.onUpdate(renderer.gl);
            renderer.render(scene);
            prevMillis = Date.now();
        }
        window.requestAnimationFrame(render);
    }
    render();

    let resizeTimer = setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        window.setTimeout(resizeCanvas, 500);
    });
});

/**
 * @param {URLSearchParams} searchParams
 * @param {object} obj
 * @param {string} propertyName
 */
function setNumberParamIfExists(searchParams, obj, propertyName) {
    if(searchParams.get(propertyName) !== null) {
        const value = parseFloat(searchParams.get(propertyName));
        if(isNaN(value)) {
            obj[propertyName] = value;
        }
    }
}

/**
 * @param {URLSearchParams} searchParams
 * @param {object} obj
 * @param {string} propertyName
 */
function setBooleanParamIfExists(searchParams, obj, propertyName) {
    if(searchParams.get(propertyName) !== null) {
        const value = searchParams.get(propertyName);
        if(value === 'true') {
            obj[propertyName] = true;
        } else if(value === 'false') {
            obj[propertyName] = false;
        }
    }
}

/**
 * @param {URLSearchParams} searchParams
 * @param {object} obj
 * @param {string} propertyName
 * @param {number} length
 */
function setArrayParamIfExists(searchParams, obj, propertyName, length) {
    if(searchParams.get(propertyName) !== null) {
        try {
            const value = JSON.parse(searchParams.get(propertyName));
            if(Array.isArray(value) && value.length === length) {
                obj[propertyName] = value;
            }
        } catch(e) {
            console.log(e);
        }
    }
}
