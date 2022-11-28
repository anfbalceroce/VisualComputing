precision mediump float;

// source (image or video) is sent by the sketch
uniform sampler2D source;
// displays original
uniform bool original;
// target horizontal & vertical resolution
uniform float resolution;

// interpolated texcoord (same name and type as in vertex shader)
// defined as a (normalized) vec2 in [0..1]
varying vec2 texcoords2;

void main() {
  if (original) {
    gl_FragColor = texture2D(source, texcoords2);
  }
  else {
    // define stepCoord to sample the texture source as a 3-step process:
    // i. define stepCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 stepCoord = texcoords2 * resolution;
    // ii. remap stepCoord in [0.0, resolution] ∈ Z
    // see: https://thebookofshaders.com/glossary/?search=floor
    stepCoord = floor(stepCoord);
    // iii. remap stepCoord in [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);
    // source texel
    gl_FragColor = texture2D(source, stepCoord);
    // ✨ source texels may be used to compute image palette lookup keys,
    // such as in video & photographic mosaics or ascii art visualizations.
  }
}