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
