precision mediump float;

uniform float ambient;
uniform vec4 uMaterialColor;
uniform vec4 ambientColor;
uniform float lightsColors[12];
uniform float phongExp;
uniform float attenuationRate;
// uLightPosition is given in eye space
uniform int lightCount;
uniform float uLightPosition[12];
// both, normal3 and position4 are given in eye space as well
varying vec3 normal3;
varying vec4 position4;

void main() {

  vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
  for (int i = 0; i < 3; i++)
  {
    if (i == lightCount) break;
    vec3 direction3 = vec3(uLightPosition[i*3], uLightPosition[i*3+1], uLightPosition[i*3+2]) - position4.xyz;
    float d = length( direction3 );
    float attenuation =  1.0 / (1.0 + attenuationRate * d);
    float diffuse = max(0.0, dot(normalize(direction3), normalize(normal3)));
    float specular = pow(max(0.0, dot(normalize(reflect(-direction3, normal3)), normalize(-vec3(position4)))), phongExp);
    vec4 color = vec4(lightsColors[i*4], lightsColors[i*4+1], lightsColors[i*4+2], lightsColors[i*4+3]);
    sum += attenuation * (diffuse + specular) * color;
  }    
  gl_FragColor =  ((ambient * ambientColor) + sum) * uMaterialColor;
}