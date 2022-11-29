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

// nfloor is a function that gets the greatest multiple of 1.0 / n less than or equal to x
float nfloor(float x, float n) { // ex: x = 0.086, n = 30
  float a = 1.0 / n; // 1.0 / 30 = 0.033.. : a is inverse of n
  float b = x / a; //  0.086 / 0.033 = 2.606.. : b in [0.0, n] ∈ R, c in [0, n] ∈ Z
  float c = floor(b); // floor(2.606..) = 2 : integer part of b indicates how many images we must ignore from left to right
  float d = a * c; // 0.033 * 2 = 0.066.. : d is the horizontal coordinate from which we can start drawing
  return d; // d in [0.0, 1.0] ∈ R but has a finite size n: [0 * 1/n, 1 * 1/n, 2 * 1/n, ..., n-1 * 1/n = 1 - 1/n]
}

void main() {
  if (original) {
    gl_FragColor = texture2D(source, texcoords2);
  }
  else {
    // i. define symbolCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 symbolCoord = texcoords2 * resolution;
    // ii. define stepCoord as a symbolCoord remapping in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(symbolCoord);
    // iii. remap symbolCoord to [0.0, 1.0] ∈ R
    symbolCoord = symbolCoord - stepCoord;
    // remap stepCoord to [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);
    // stepCoord is the coordinate of our key, we get its color: key color
    vec4 key = texture2D(source, stepCoord); // texel will be the key to look up
    // we calculate the luma of key color: kluma in [0.0, 1.0] ∈ R
    float kluma = luma(key.rgb);
    // we calculate horizontal displacement to the right needed to start drawing an image with a luma close to kluma
    // nfloor is a function that gets the greatest multiple of 1.0 / n less than or equal to x (kluma)
    float displacement = nfloor(kluma, n);

    // using symbolcoord draws the whole pallete in each low resolution pixel
    // vec4 paletteTexel = texture2D(palette, symbolCoord);

    // using symbolcoord / n maps [0.0, 1.0] ∈ R --> [0.0, 1.0 / n] ∈ R : if n = 30 then [0.0, 0.033] ∈ R
    // 1.0 / n is the horizontal length of each image, so each draws one image, the first image in the pallete (darkest one if ordered by luma asc)
    // vec4 paletteTexel = texture2D(palette, vec2(symbolCoord.x / n, symbolCoord.y));

    // we need the displacement to start drawing the correct image each time: the correct image is the one with the luma closest to the key luma
    // displacement is in [0.0, 1.0] ∈ R with finite size n: [0 * 1/n, 1 * 1/n, 2 * 1/n, ..., n-1 * 1/n = 1 - 1/n]
    // [0.0, 0.033, 0.066, ..., 0.967] if n = 30
    // if 0.0, it draws first image, if 0.033, it draws second image, ..., if 0.967 it draws 30th image
    vec4 paletteTexel = texture2D(palette, vec2(displacement + symbolCoord.x / n, symbolCoord.y));

    gl_FragColor = keys ? key : paletteTexel;
  }
}