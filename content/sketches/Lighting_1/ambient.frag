precision mediump float;

// emitted by p5 color-group commands
// https://p5js.org/reference/#group-Color
uniform vec4 uMaterialColor;
uniform vec4 lightColor;
uniform float ambient;

void main() {
  vec4 ambient4 = lightColor * ambient;
  gl_FragColor = ambient4 * uMaterialColor;
}