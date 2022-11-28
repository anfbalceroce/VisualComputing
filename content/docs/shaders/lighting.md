---
title: Lighting
weight: 8
---
# Lighting

La iluminación en gráficos por computadora se refiere a la colocación de luces en una escena para lograr algún efecto deseado. Los paquetes de síntesis de imágenes y animación contienen diferentes tipos de luces que se pueden colocar en diferentes lugares y modificar cambiando los parámetros. Con demasiada frecuencia, las personas que crean imágenes o animaciones ignoran o ponen poco énfasis en la iluminación. []

En gráficos por computadora, el efecto general de una fuente de luz sobre un objeto está determinado por la combinación de las interacciones del objeto con él, generalmente descritas por al menos tres componentes principales. Los tres componentes principales de iluminación (y los tipos de interacción subsiguientes) son difusos, ambientales y especulares. [] 

## Luz ambiental

Una luz ambiental proyecta suaves rayos de luz en todas las direcciones. No tienen una direccionalidad específica, por lo que no proyectan sombras y simula más una luz secundaria que proviene de todos los ángulos diferentes del objeto. La iluminación ambiental es una buena alternativa para rellenar áreas en un render que no tiene suficiente iluminación.

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

## Reflexión difusa
La iluminación difusa (o reflexión difusa) es la iluminación directa de un objeto por una cantidad uniforme de luz que interactúa con una superficie que dispersa la luz.[4][9] Después de que la luz incide en un objeto, se refleja en función de las propiedades de la superficie del objeto, así como del ángulo de la luz entrante. Esta interacción es el principal contribuyente al brillo del objeto y constituye la base de su color.
># Ejercicio
>Implementar una escena de sombreado de dibujos animados
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

## Reflexion especular

Se refiere a los reflejos de los objetos reflectantes, como diamantes, bolas de billar y ojos. Los reflejos especulares a menudo aparecen como puntos brillantes en una superficie, en un punto donde la fuente de luz incide directamente. Ambient, Diffuse y Specular se denominan los tres componentes de una fuente de luz.

Una reflexión especular es visible solo donde la superficie normal está orientada precisamente a la mitad entre la dirección de la luz entrante y la dirección del espectador; esto se llama la dirección del medio ángulo porque biseca (divide en dos) el ángulo entre la luz entrante y el espectador. Por lo tanto, una superficie reflectora especular mostraría un punto culminante especular como la imagen reflejada perfectamente nítida de una fuente de luz. Sin embargo, muchos objetos brillantes muestran reflejos especulares borrosos.
># Ejercicio
>Implemente una escena de reflexión especular|difusa:
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

{{< p5-iframe sketch="/VisualComputing/sketches/Lighting_4/sketch.js" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" width="550" height="550">}}


## Conclusiones

* 
*
*
*

## Referencias

* "Lighting in 3D Graphics". www.bcchang.com. Retrieved 2019-11-05.
* "Computer Graphics: Shading and Lighting". cglearn.codelight.eu. Retrieved 2019-10-30.
* "Lighting in 3D Graphics". www.bcchang.com. Retrieved 2019-11-05.
* Pollard, Nancy (Spring 2004). "Lighting and Shading" (PDF).
