precision mediump float;

uniform sampler2D palette;
// source (image or video) is sent by the sketch
uniform sampler2D source;
uniform bool keys;
// displays original
uniform bool original;
// target horizontal & vertical resolution
uniform float resolution;
uniform float n;

// interpolated texcoord (same name and type as in vertex shader)
// defined as a (normalized) vec2 in [0..1]
varying vec2 texcoords2;

float luma(vec3 texel) {
    return 0.299 * texel.r + 0.587 * texel.g + 0.114 * texel.b; // min 0, max 255
}

void main() {
  if (original) {
    gl_FragColor = texture2D(source, texcoords2);
  }
  else {
    // i. define coord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 coord = texcoords2 * resolution;
    // ii. remap stepCoord in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(coord);
    vec2 symbolCoord = coord - stepCoord;
    // iii. remap stepCoord in [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution); // normalized step coord
    // source texel
    vec4 key = texture2D(source, stepCoord); // texel will be the key to look up

    // we calculate key color luma
    float kluma = luma(key.rgb);

    // palette is an image containing the 30 images but with 1.0 x 1.0 dimensions.
    // each key will get an image from the palette: we have the symbol coord (x, y).
    // images are ordered horizontally, so we take x, which indicates the starting coordinate of our key, and divide it by n because we have n images, 
    // with this we can start counting from the left-most image to the right
    // to this quotient, we add kluma, which is a value between 0 a 1. It will ensure we are going to use the correct image texel. 
    // y coordinate need no special treatment.
    // for each texel, we need to paint the correct portion of the image that will represent

    vec4 paletteTexel = texture2D(palette, vec2(symbolCoord.x / n + kluma, symbolCoord.y));

    gl_FragColor = keys ? key : paletteTexel;
  }
}