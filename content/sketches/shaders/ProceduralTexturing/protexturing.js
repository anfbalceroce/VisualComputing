let angle = 0;
let positions = []; // will contain objects 3D positions

let easycam;
let P;

let pg;
let cabberShader;
let mosaicShader;

let i = 1;

let texselect;
let tex;

function preload() {
    cabberShader = readShader('/VisualComputing/docs/shaders/fragments/cabber.frag', { matrices: Tree.NONE, varyings: Tree.NONE });
    mosaicShader = readShader('/VisualComputing/docs/shaders/fragments/mosaic.frag', { matrices: Tree.NONE, varyings: Tree.NONE });
  }

function setup() {

  createCanvas(500, 500, WEBGL);

  pg = createGraphics(400, 400, WEBGL);
  textureMode(NORMAL);
  noStroke();
  pg.noStroke();
  pg.textureMode(NORMAL);
  
  easycam = createEasyCam();

  let state = {
    distance: 600,           
    center: [200, 200, 200],       
    rotation: [1, -1, 0, 0],
  };

  easycam.setState(state, 1000);
  
  // 50 objects are placed throughout the space with random positions.
  for (let i = 0; i < 30; i++) {
    let x = randomint(-400, 400);
    let y = randomint(-400, 400);
    let z = randomint(-400, 400);
    positions.push([x, y, z]);
  }

  texselect = createSelect();
  texselect.position(10, 10);
  texselect.option('cabber', 0);
  texselect.option('mosaic', 1);
  texselect.selected('cabber');

}

function draw() {
  
  tex = texselect.value();

  background(0);

  P = easycam.getPosition();
  
  let size = 50;
  let ssize = 300;
  let chromabber = 0.01;

  for (let i = 0; i < positions.length; i++) {
    cabberShader.setUniform('SHAPE_SIZE', ssize/1000);
    cabberShader.setUniform('CHROMATIC_ABBERATION', chromabber);
    cabberShader.setUniform('u_time', frameCount * 0.1);
    mosaicShader.setUniform('u_time', frameCount * 0.1);
    pg.emitResolution(cabberShader);
    pg.emitResolution(mosaicShader);
    if (tex == 0)
        pg.shader(cabberShader);
    else if (tex == 1)
        pg.shader(mosaicShader);
    pg.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    texture(pg);
    push();
    positions[i][0] = (positions[i][0] + 2) % 400;
    positions[i][1] = (positions[i][1] + 2) % 400;
    positions[i][2] = (positions[i][2] + 2) % 400;
    translate(positions[i][0], positions[i][1], positions[i][2]); // with push and pop, translation and rotation of each object is independent of each other.
    rotateX(angle);
    rotateY(angle * 0.4);
    if (tex == 0)
        cone(size);
    else if (tex == 1)
        sphere(size);
    pop();
    ssize += 20;
    size += 1;
    chromabber += 0.002;
    if (tex == 1)
        angle += 0.001;
  }
}

function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}