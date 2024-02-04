#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_scale;

const float DISPLAY_GAMMA_COEFF = 1. / 2.2;
vec4 gammaCorrect(vec4 rgba) {
    return vec4((min(pow(rgba.r, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.g, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.b, DISPLAY_GAMMA_COEFF), 1.)),
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

const vec3 c3 = vec3(173.17, 0, 141.3);
const vec3 c4 = vec3(0, 173.17, 141.3);
const int MAX_ITERATIONS = 20;
int iis(vec2 pos) {
    int numInversions = 0;
    for(int i = 0 ; i < MAX_ITERATIONS ; i++){
        bool loopEnd = true;
        if(pos.x < 0.) {
            pos *= vec2(-1, 1);
            loopEnd = false;
            numInversions++;
        } else if (pos.y < 0.) {
            pos *= vec2(1, -1);
            loopEnd = false;
            numInversions++;
        } else if (distance(pos, c3.xy) < c3.z) {
            pos = circleInversion(pos, c3);
            loopEnd = false;
            numInversions++;
        } else if (distance(pos, c4.xy) < c4.z) {
            pos = circleInversion(pos, c4);
            loopEnd = false;
            numInversions++;
        }

        if(loopEnd) break;
    }
    return numInversions;
}

const float MAX_SAMPLES = 100.;
out vec4 outColor;
void main() {
    vec4 sum = vec4(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_scale;
        position += u_translation;

        int numInversions = iis(position);
        if(mod(float(numInversions), 2.0) == 0.) {
            sum += vec4(hsv2rgb(0.0, 1., 1.), 1);
        } else {
            sum += vec4(hsv2rgb(0.5, 1., 1.), 1);
        }
    }
    
    outColor = sum / MAX_SAMPLES;
}
