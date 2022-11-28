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
  myShader.setUniform('lightsColors', [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
}

function draw() {
  
  
  background(0);  
  let point = updatePointLight();
  lightsColors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  resetShader();
  
  push();
  stroke('blue');
  axes();
  grid();
  pop(); 

  
  for (let i = 0; i < selectPos.value(); i++) {    
    let color = colors[i].color();
    lightsColors[i*4+0] = red(color) / 255;
    lightsColors[i*4+1] = green(color) / 255;
    lightsColors[i*4+2] = blue(color) / 255;
    lightsColors[i*4+3] = 1;    
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
  myShader.setUniform("lightsColors", lightsColors);
  
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