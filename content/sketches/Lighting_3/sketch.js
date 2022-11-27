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

