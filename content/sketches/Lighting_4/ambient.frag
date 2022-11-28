precision mediump float;

uniform float ambient;
uniform vec4 uMaterialColor;
uniform vec4 lightColor;
// uLightPosition is given in eye space
uniform vec3 uLightPosition;
// both, normal3 and position4 are given in eye space as well
varying vec3 normal3;
varying vec4 position4;

void main() {
  vec3 direction3 = uLightPosition - position4.xyz;
  // solve the diffuse light equation discarding negative values
  // see: https://thebookofshaders.com/glossary/?search=max
  // see: https://thebookofshaders.com/glossary/?search=dot
  float diffuse = max(0.0, dot(normalize(direction3), normalize(normal3)));
  float specular = max(0.0, dot(normalize(reflect(-direction3, normal3)), normalize(-vec3(position4))));
  gl_FragColor = (ambient + diffuse + specular) * uMaterialColor * lightColor;
}