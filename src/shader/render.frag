#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_cameraTexture;
uniform vec2 u_cameraResolution;
uniform vec2 u_translation;
uniform float u_scale;
uniform vec3 u_circle1;
uniform vec3 u_circle2;
uniform vec2 u_cornerUpperRight;

const float GAMMA = 2.2;
const float DISPLAY_GAMMA_COEFF = 1. / GAMMA;
vec4 gammaCorrect(vec4 rgba) {
    return vec4((min(pow(rgba.r, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.g, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.b, DISPLAY_GAMMA_COEFF), 1.)),
                rgba.a);
}

vec4 deGamma(vec4 rgba) {
    return vec4((min(pow(rgba.r, GAMMA), 1.)),
                (min(pow(rgba.g, GAMMA), 1.)),
                (min(pow(rgba.b, GAMMA), 1.)),
                rgba.a);
}


vec3 hsv2rgb(const float h, const float s, const float v){
    vec3 c = vec3(h, s, v);
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec2 circleInversion(const vec2 pos, const vec3 circle){
    vec2 p = pos - circle.xy;
    float d = length(p);
    return (p * circle.z * circle.z)/(d * d) + circle.xy;
}

const int MAX_ITERATIONS = 20;
vec2 iis(vec2 pos, out bool isOuter) {
    int numInversions = 0;
    vec3 c3 = vec3(-u_circle1.xy, u_circle1.z);
    vec3 c4 = vec3(-u_circle2.xy, u_circle2.z);
    isOuter = false;

    float x = 0.57735;
    bool revC2 = false;
    if(x > u_circle2.x){
        revC2 = true;
    }
    for(int i = 0 ; i < MAX_ITERATIONS ; i++){
        bool loopEnd = true;
        if(distance(pos, c3.xy) < c3.z) {
            pos = circleInversion(pos, c3);
            loopEnd = false;
            numInversions++;
        } else if (distance(pos, u_circle1.xy) < u_circle1.z) {
            pos = circleInversion(pos, u_circle1);
            loopEnd = false;
            numInversions++;
        }
        if(revC2) {
            if (distance(pos, u_circle2.xy) > u_circle2.z) {
                pos = circleInversion(pos, u_circle2);
                loopEnd = false;
                numInversions++;
            }
            if (distance(pos, c4.xy) > c4.z) {
                pos = circleInversion(pos, c4);
                loopEnd = false;
                numInversions++;
            }       
        } else {
            if (distance(pos, u_circle2.xy) < u_circle2.z) {
                pos = circleInversion(pos, u_circle2);
                loopEnd = false;
                numInversions++;
            }
            if (distance(pos, c4.xy) < c4.z) {
                pos = circleInversion(pos, c4);
                loopEnd = false;
                numInversions++;
            }    
        }

        if(loopEnd) break;
    }
    if(length(pos) > 1.5) {
        isOuter = true;
    }
    return pos;
}

const float MAX_SAMPLES = 100.;
out vec4 outColor;
void main() {
    vec4 sum = vec4(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    vec2 cornerLowerLeft = -u_cornerUpperRight;
    vec2 tileSize = u_cornerUpperRight - cornerLowerLeft;
    //  sum = texture(u_cameraTexture, abs((position - cornerLowerLeft) / size));
    float cameraAspect = u_cameraResolution.y / u_cameraResolution.x;
    float tileAspect = tileSize.y / tileSize.x;
    vec2 cameraSizeOnScreen;
    vec2 offset;
    if(tileAspect >= cameraAspect) {
        // 幅を1としてときにタイルの方が高さが大きい
        // 横方向をクリップ
        //cameraWidth = u_cameraResolution.x * (tileSize.x / tileSize.y);
        //cameraHeight = u_cameraResolution.y;
        //offsetX = (u_cameraResolution.x - cameraWidth) / 2.;
        cameraSizeOnScreen = vec2(tileSize.y * (u_cameraResolution.x / u_cameraResolution.y), tileSize.y);
        offset = vec2((cameraSizeOnScreen.x - tileSize.x) * 0.5, 0);
    } else {
        // 幅を1としてときに画像の方が高さが大きい
        // 縦方向でクリップ
        //cameraWidth = u_cameraResolution.x;
        //cameraHeight = u_cameraResolution.x * tileAspect;
        //offsetY = (u_cameraResolution.y - cameraHeight) / 2.;
        cameraSizeOnScreen = vec2(tileSize.x, tileSize.x * (u_cameraResolution.y / u_cameraResolution.x));
        offset = vec2(0, (cameraSizeOnScreen.y - tileSize.y) * 0.5);
    }
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_scale;
        position += u_translation;

        // if(distance(position, u_circle1.xy) < u_circle1.z) {
        //     sum += vec4(1, 0, 0, 1);
        //     continue;
        // }
        // if(distance(position, u_circle2.xy) < u_circle2.z) {
        //     sum += vec4(1, 0, 0, 1);
        //     continue;
        // }
        
        //sum += texture(u_cameraTexture, gl_FragCoord.xy / u_cameraResolution);

        vec2 cornerLowerLeft = -u_cornerUpperRight;
        vec2 tileSize = u_cornerUpperRight - cornerLowerLeft;
        //  sum = texture(u_cameraTexture, abs((position - cornerLowerLeft) / size));
        float cameraAspect = u_cameraResolution.y / u_cameraResolution.x;
        float tileAspect = tileSize.y / tileSize.x;
        bool isOuter;
        vec2 pos = iis(position, isOuter);
        if(isOuter) {
            sum += vec4(0, 0, 0, 1);
        } else {
            vec2 uv = 1.0 - ((pos - cornerLowerLeft + offset) / cameraSizeOnScreen);
            //sum += vec4(uv, 0, 1);
            sum += texture(u_cameraTexture, uv);
        }
    }
    
    outColor = sum / MAX_SAMPLES;
}
