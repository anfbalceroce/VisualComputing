---
title: Lighting
weight: 8
---
# Lighting

La iluminación en gráficos por computadora se refiere a la colocación de luces en una escena para lograr algún efecto deseado. Los paquetes de síntesis de imágenes y animación contienen diferentes tipos de luces que se pueden colocar en diferentes lugares y modificar cambiando los parámetros. Con demasiada frecuencia, las personas que crean imágenes o animaciones ignoran o ponen poco énfasis en la iluminación. [2]

En gráficos por computadora, el efecto general de una fuente de luz sobre un objeto está determinado por la combinación de las interacciones del objeto con él, generalmente descritas por al menos tres componentes principales. Los tres componentes principales de iluminación (y los tipos de interacción subsiguientes) son difusos, ambientales y especulares. [3]

## Luz ambiental

Una luz ambiental proyecta suaves rayos de luz en todas las direcciones. No tienen una direccionalidad específica, por lo que no proyectan sombras y simula más una luz secundaria que proviene de todos los ángulos diferentes del objeto. La iluminación ambiental es una buena alternativa para rellenar áreas en un render que no tiene suficiente iluminación. [2]

># Ejercicio
>Implemente una escena que haga uso de la siguiente ecuación de ilumincación donde ambient4 es el color de la luz ambiental. 
{{< p5-iframe sketch="/VisualComputing/sketches/Lighting_1/sketch.js" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" width="550" height="550">}}

{{<details "Código">}}

``` js
let easycam;
let myShader;
let models;
let ambient;
let ambientSlider;
let modelsSlider;
let colorPicker;

function preload() {
  myShader = readShader("ambient.frag", {varyings: Tree.NONE,});
}

function setup() {
  createCanvas(500, 500, WEBGL);
  noLights();
  colorMode(RGB, 1);
  setAttributes('ambient', true);
  
  let state = {
    distance: 250,
    center: [0, 0, 0],
    rotation: [-0.250, -0.150, -0.500, 0.700],
  };
  
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;  
  easycam.setState(state, 2000); 
  document.oncontextmenu = function () { return false; }
  
  let trange = 100;
  models = [];
  
  for (let i = 0; i < 100; i++) {
    models.push({
      position: createVector(
        (random()*2-1) * trange,
        (random()*2-1) * trange,
        (random()*2-1) * trange
      ),
      size: random() * 30 ,
      color: color(random(), random(), random()),
    });
  }
  
  itemsPlane = createSlider(1, models.length, int(models.length / 3), 1);
  itemsPlane.position(10, 30);
  
  ambientSlider = createSlider(0, 1, 0.5, 0.05);
  ambientSlider.position(350, 30);
  ambientSlider.input(() => {
  myShader.setUniform("ambient", ambientSlider.value());});  
  
  colorPicker = createColorPicker("#FFFFFF");
  colorPicker.position(50,80)
  colorPicker.input(() => {
  let color = colorPicker.color();
  myShader.setUniform("lightColor", [red(color) / 255,green(color) / 255,blue(color) / 255,1,
    ]);
  });

  shader(myShader);
  myShader.setUniform("ambient", ambientSlider.value());
  myShader.setUniform("lightColor", [1, 1, 1, 1]);
  
}

function draw() {
  background(0);
  resetShader();
  
  push();
  stroke("blue");
  axes();
  grid();
  pop();
  
  shader(myShader);
  
  for (let i = 0; i < itemsPlane.value(); i++) {
    
    push();
    noStroke();
    fill(models[i].color);
    translate(models[i].position);
    let radius = models[i].size / 2;
    i % 3 === 0
      ? box(radius)
      : i % 3 === 1
      ? sphere(radius)
      : torus(radius, radius / 4);
    pop();
    
  }
}
```
{{</details >}}

{{<details "Shader">}}
``` frag
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
```
{{</details >}}


## Reflexion especular

Se refiere a los reflejos de los objetos reflectantes, como diamantes, bolas de billar y ojos. Los reflejos especulares a menudo aparecen como puntos brillantes en una superficie, en un punto donde la fuente de luz incide directamente. Ambient, Diffuse y Specular se denominan los tres componentes de una fuente de luz. [3]

Una reflexión especular es visible solo donde la superficie normal está orientada precisamente a la mitad entre la dirección de la luz entrante y la dirección del espectador; esto se llama la dirección del medio ángulo porque biseca (divide en dos) el ángulo entre la luz entrante y el espectador. Por lo tanto, una superficie reflectora especular mostraría un punto culminante especular como la imagen reflejada perfectamente nítida de una fuente de luz. Sin embargo, muchos objetos brillantes muestran reflejos especulares borrosos.[4]

># Ejercicio
>Implementar una escena de sombreado de dibujos animados o Toon Shader apartir de la reflexion especular
>
{{< p5-iframe sketch="/VisualComputing/sketches/Lighting_2/sketch.js" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" width="550" height="550">}}


{{<details "Código">}}

``` js
let toonShader;
let myShader;
let models;
let ambient;
let ambientSlider;
let modelsSlider;
let colorPicker;

function preload() {
  toonShader = loadShader('vert.frag', 'frag.frag');
}

function setup() {
  createCanvas(500, 500, WEBGL);
  noLights();
  colorMode(RGB, 1);
  setAttributes('ambient', true);
  
  let state = {
    distance: 250,
    center: [0, 0, 0],
    rotation: [-0.250, -0.150, -0.500, 0.700],
  };
  
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;  
  easycam.setState(state, 2000); 
  document.oncontextmenu = function () { return false; }

  let trange = 90;
  models = [];

  for (let i = 0; i < 100; i++) {
    models.push({
      position: createVector(
        (random()*2-1) * trange,
        (random()*2-1) * trange,
        (random()*2-1) * trange
      ),
      size: random() * 30 ,
      color: color(random(), random(), random()),
    });
  }

  itemsPlane = createSlider(1, models.length, int(models.length / 3), 1);
  itemsPlane.position(10, 30);
  
  ambientSlider = createSlider(0, 1, 0.5, 0.05);
  ambientSlider.position(350, 30);
  ambientSlider.input(() => {
  toonShader.setUniform("fraction", ambientSlider.value());});  
  
  colorPicker = createColorPicker("#FFFFFF");
  colorPicker.position(50,80)
  colorPicker.input(() => {
  let color = colorPicker.color();
  toonShader.setUniform("lightColor", [red(color) / 255,green(color) / 255,blue(color) / 255,1,
    ]);
  });

  shader(toonShader);
  toonShader.setUniform('fraction', 1.0);
  toonShader.setUniform("ambient", ambientSlider.value());
  toonShader.setUniform("lightColor", [1, 1, 1, 1]);
}

function draw() {
  background(0);
  resetShader();
  
  push();
  stroke("blue");
  axes();
  grid();
  pop();
  
  shader(toonShader);
  
  push();
  let dirY = (mouseY / height - 0.5) * 2;
  let dirX = -(mouseX / width - 0.5) * 2;
  directionalLight(255, 255, 204, dirX, -dirY, -1);
  for (let i = 0; i < itemsPlane.value(); i++) {
    
    push();
    noStroke();
    fill(models[i].color);
    translate(models[i].position);
    let radius = models[i].size / 2;
    i % 3 === 0
      ? box(radius)
      : i % 3 === 1
      ? sphere(radius)
      : torus(radius, radius / 4);
    pop();
    
  }
  pop();
}
```
{{</details >}}

{{<details "Shader-frag">}}
``` frag
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform int uDirectionalLightCount;
uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;
uniform vec4 uMaterialColor;

varying vec4 vertColor;
varying vec3 vertLightDir;
varying vec3 vertNormal;
varying vec2 vertTexCoord;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;

  vertNormal = normalize(uNormalMatrix * aNormal);
  vertLightDir = -uLightingDirection;

  vertColor = uMaterialColor;
  vertTexCoord = aTexCoord;
}
```
{{</details >}}

{{<details "Shader-vert">}}
``` frag
#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform float fraction;
uniform vec4 lightColor;
uniform float ambient;
varying vec4 vertColor;
varying vec3 vertNormal;
varying vec3 vertLightDir;
varying highp vec2 vertTexCoord;

void main() {
  float intensity;
  vec4 color;
  intensity = max(0.0, dot(vertLightDir, vertNormal));

  if (intensity > pow(0.95, fraction)) {
    color = vec4(vec3(1.0), 1.0);
  } else if (intensity > pow(0.5, fraction)) {
    color = vec4(vec3(0.6), 1.0);
  } else if (intensity > pow(0.25, fraction)) {
    color = vec4(vec3(0.4), 1.0);
  } else {
    color = vec4(vec3(0.2), 1.0);
  }
  gl_FragColor = color * vertColor * lightColor;
}
```
{{</details >}}

## Reflexión difusa

La iluminación difusa (o reflexión difusa) es la iluminación directa de un objeto por una cantidad uniforme de luz que interactúa con una superficie que dispersa la luz.Después de que la luz incide en un objeto, se refleja en función de las propiedades de la superficie del objeto, así como del ángulo de la luz entrante. Esta interacción es el principal contribuyente al brillo del objeto y constituye la base de su color. [2]

># Ejercicio
>Implemente una escena de reflexión difusa:
{{< p5-iframe sketch="/VisualComputing/sketches/Lighting_3/sketch.js" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" width="550" height="550">}}

{{<details "Código">}}

``` js
let easycam;
let models;
let itemsPlane;
let myShader;
let ambient;
let ambientSlider;
let focos;
let selectPos;

function preload() {
  myShader = readShader('ambient.frag', { varyings: Tree.normal3 | Tree.position4 });
}

function setup() {
  createCanvas(500, 500, WEBGL);
  noLights();
  colorMode(RGB, 1);
  setAttributes('ambient', true);
  
  let state = {
    distance: 250,
    center: [0, 0, 0],
    rotation: [-0.250, -0.150, -0.500, 0.700],
  };
  
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;  
  easycam.setState(state, 2000); 
  document.oncontextmenu = function () { return false; }
  
  
  let trange = 100;
  models = [];
  
  for (let i = 0; i < 100; i++) {
    models.push({
      position: createVector(
        (random()*2-1) * trange,
        (random()*2-1) * trange,
        (random()*2-1) * trange
      ),
      size: random() * 30 ,
      color: color(random(), random(), random()),
    });
  }
  
  focos = {};
  
  itemsPlane = createSlider(1, models.length, int(models.length / 3), 1);
  itemsPlane.position(10, 30);
  
  ambientSlider = createSlider(0, 1, 0.2, 0.05);
  ambientSlider.position(350, 30);
  ambientSlider.input(() => { myShader.setUniform('ambient', ambientSlider.value()) });

  selectPos = createSelect();
  selectPos.position(40, 80);
  selectPos.option('Centro');
  selectPos.option('Izquierda');
  selectPos.option('Derecha');
  selectPos.selected('Centro');
  
  colorPicker = createColorPicker("#FFFFFF");
  colorPicker.position(400,80)
  colorPicker.input(() => {
  let color = colorPicker.color();

  myShader.setUniform("lightColor", [
      red(color) / 255,
      green(color) / 255,
      blue(color) / 255,
      1,
    ]);
  });
  
  shader(myShader);
  myShader.setUniform('ambient', ambientSlider.value());
  myShader.setUniform("lightColor", [1, 1, 1, 1]);
}

function draw() {
  
  background(0);
  let point = updatePointLight();
  resetShader();
  
  push();
  stroke('blue');
  axes();
  grid();
  pop();
  
  push();
  translate(point.position);
  noStroke();
  fill('white');
  sphere(3);
  pop();
  
  shader(myShader);
  myShader.setUniform('uLightPosition', treeLocation(point.position, { from: Tree.WORLD, to: Tree.EYE }).array());
  
  for (let i = 0; i < itemsPlane.value(); i++) {
    push();
    noStroke();
    fill(models[i].color);
    translate(models[i].position);
    let radius = models[i].size / 2;
    i % 3 === 0 ? box(radius * 2) : i % 3 === 1 ? sphere(radius) : torus(radius, radius / 4);
    pop();
  }
}

function updatePointLight() {
  let mov = frameCount * 0.03;
  let rad = 30;
  let px = cos(mov) * rad;
  let py = sin(mov) * rad;
  let r = (sin(mov) * 1 + 0.5);
  let g = (sin(mov * 0.5 + PI ) * 0.5 + 0.5);
  let b = (sin(frameCount * 0.05) * 0.5 + 0.5);
  let pz = sin(frameCount * 0.05);
  return {
    position: selectPos.value() === 'Centro' ? createVector(px, py, 0) : selectPos.value() === 'Izquierda' ?
      createVector(50, 50, pz * 70) : createVector(-50, -50, -pz * 70),
    color: selectPos.value() === 'Centro' ? color(1 - r, r / 2, r) : selectPos.value() === 'Izquierda' ?
      color(r, 1, g) : color(1, r, g)
  };
}
```
{{</details >}}

{{<details "Shader">}}
``` frag
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
  gl_FragColor = (ambient + diffuse) * uMaterialColor * lightColor;
}
```
{{</details >}}

># Ejercicio
>Implemente una escena combinando luces de ambiente, difusa y especular. Considerar varias fuentes puntuales de luz, con factores de atenuación [5] y exponentes de Phong[6].

{{< p5-iframe sketch="/VisualComputing/sketches/Lighting_4/sketch.js" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" width="550" height="550">}}

{{<details "Código">}}

``` js
let easycam;
let models;
let itemsPlane;
let myShader;
let ambient;
let ambientSlider;
let selectPos;
let phongExpSlider;
let attenuationRate;
let lightCount;
let lights;
let colorPicker;
let colors;
let lightsColors;

function preload() {
  myShader = readShader('/VisualComputing/sketches/Lighting_4/ambient.frag', { varyings: Tree.normal3 | Tree.position4 });
}

function setup() {
  createCanvas(500, 500, WEBGL);
  noLights();
  colorMode(RGB, 1);
  setAttributes('ambient', true);
  
  let state = {
    distance: 250,
    center: [0, 0, 0],
    rotation: [-0.250, -0.150, -0.500, 0.700],
  };
  
  easycam = new Dw.EasyCam(this._renderer);
  easycam.state_reset = state;  
  easycam.setState(state, 2000); 
  document.oncontextmenu = function () { return false; }
  
  
  let trange = 100;
  models = [];
  
  for (let i = 0; i < 100; i++) {
    models.push({
      position: createVector(
        (random()*2-1) * trange,
        (random()*2-1) * trange,
        (random()*2-1) * trange
      ),
      size: random() * 30 ,
      color: color(random(), random(), random()),
    });
  }
  
  itemsPlane = createSlider(1, models.length, int(models.length / 3), 1);
  itemsPlane.position(10, 30);
  
  ambientSlider = createSlider(0, 1, 0.2, 0.05);
  ambientSlider.position(350, 30);
  ambientSlider.input(() => { myShader.setUniform('ambient', ambientSlider.value()) });

  selectPos = createSelect();
  selectPos.position(20, 80);
  selectPos.option(1);
  selectPos.option(2);
  selectPos.option(3);
  selectPos.selected(1);
  selectPos.input(() => { 
  let count = selectPos.value() === 1 ? 1 : selectPos.value() === 2 ? 2 : 3;
  myShader.setUniform('lightCount', count) });

  colors = [];
  lightsColors = [];

  for (let i = 0; i < 3; i++) {
    colors[i] = createColorPicker("#FFFFFF");
    colors[i].position(20,120+(i*45))
    colors[i].input(() => {
    let color = colors[i].color();

    lightsColors[i*4+0] = red(color) / 255;
    lightsColors[i*4+1] = green(color) / 255;
    lightsColors[i*4+2] = blue(color) / 255;
    lightsColors[i*4+3] = 1;
  
    myShader.setUniform("lightsColors", lightsColors);
    });
  }

  
  colorPicker = createColorPicker("#FFFFFF");
  colorPicker.position(400,80)
  colorPicker.input(() => {
  let color = colorPicker.color();

  myShader.setUniform("ambientColor", [
      red(color) / 255,
      green(color) / 255,
      blue(color) / 255,
      1,
    ]);
  });
  
  phongExpSlider = createSlider(2, 1250, 1, 1);
  phongExpSlider.position(350, 470);
  phongExpSlider.input(() => { myShader.setUniform('phongExp', phongExpSlider.value()) });

  attenuationRate = createSlider(0, 0.1, 0.03, 0.001);
  attenuationRate.position(10, 470);
  attenuationRate.input(() => { myShader.setUniform('attenuationRate', attenuationRate.value()) });

  lights = [];
  
  shader(myShader);
  myShader.setUniform('ambient', ambientSlider.value());
  myShader.setUniform("ambientColor", [1, 1, 1, 1]);
  myShader.setUniform('phongExp', phongExpSlider.value());
  myShader.setUniform('attenuationRate', attenuationRate.value());
  myShader.setUniform('lightCount', 1);
  myShader.setUniform('lightsColors', [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
}

function draw() {
  
  
  background(0);  
  let point = updatePointLight();
  resetShader();
  
  push();
  stroke('blue');
  axes();
  grid();
  pop(); 

  
  for (let i = 0; i < selectPos.value(); i++) {    
    push();
    translate(point[i].position);
    noStroke();
    fill(colors[i].color());
    sphere(3);
    pop();
    lights[i] = treeLocation(point[i].position, { from: Tree.WORLD, to: Tree.EYE }).array();
  }

  shader(myShader);
  myShader.setUniform('uLightPosition', lights.flat());  
  
  for (let i = 0; i < itemsPlane.value(); i++) {
    push();
    noStroke();
    fill(models[i].color);
    translate(models[i].position);
    let radius = models[i].size / 2;
    i % 3 === 0 ? box(radius * 2) : i % 3 === 1 ? sphere(radius) : torus(radius, radius / 4);
    pop();
  }
}

function updatePointLight() {
  let mov = frameCount * 0.03;
  let rad = 30;
  let px = cos(mov) * rad;
  let py = sin(mov) * rad;
  let r = (sin(mov) * 1 + 0.5);
  let g = (sin(mov * 0.5 + PI ) * 0.5 + 0.5);
  let b = (sin(frameCount * 0.05) * 0.5 + 0.5);
  let pz = sin(frameCount * 0.05);
  return [{
    position: createVector(px, py, 0),
    color: color(1 - r, r / 2, r)
  },
  {
    position: createVector(50, 50, pz * 70),
    color: color(r, 1, g)
  },
  {
    position: createVector(-50, -50, -pz * 70),
    color: color(1, r, g)
  }];
}
```
{{</details >}}

{{<details "Shader">}}
``` frag
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
```
{{</details >}}

## Referencias

 1) "ToonShader", 2017 jwdunn1, P5js Editor Web
 2) "Computer Graphics: Shading and Lighting". cglearn.codelight.eu. Retrieved 2019-10-30.
 3) "Lighting in 3D Graphics". www.bcchang.com. Retrieved 2019-11-05.
 4) "Lighting and Shading" (PDF) Pollard, Nancy (Spring 2004).
 5) "Light Attenuation". http://learnwebgl.brown37.net/09_lights/lights_attenuation.html. Retrieved 2022-11-28.
 6) "Specular highlight". https://en.wikipedia.org/wiki/Specular_highlight#Phong_distribution. Retrieved 2022-11-28.
