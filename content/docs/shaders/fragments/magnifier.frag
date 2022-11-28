precision mediump float;

uniform sampler2D texture;
varying vec2 texcoords2;
uniform float mradius;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float depth;

void main() {

    // https://www.shadertoy.com/view/llsSz7
    
    vec2 uv = texcoords2.xy;
    vec2 center = vec2(mouse.x, 500. - mouse.y) / resolution.xy;
    float ax = ((uv.x - center.x) * (uv.x - center.x)) / (0.25 * 0.25) + ((uv.y - center.y) * (uv.y - center.y)) / (0.25 / (resolution.x / resolution.y));
    float dx = 0.0 + (- depth / mradius) * ax + (depth / (mradius * mradius)) * ax * ax;
    float f =  (ax + dx);
    if (ax > mradius) f = ax;

    vec2 magnifierArea = center + (uv - center) * f / ax;

    gl_FragColor = texture2D(texture, magnifierArea); 

}