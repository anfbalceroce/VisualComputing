let easycam;
let edge = 80;
let button1, button2, button3;
let use = 1;
let bedge = 160;
let oedge = 100;
let oredge = oedge * Math.sqrt(3);
let arrow;
let arrowTex;
let bee;
let beeTex;
let tiger;
let tigerTex;
let tree;
let treeTex;
let penguin;
let penguinTex;
let fish;
let fishTex;
let crown;
let crowTex;
let tower;
let towerTex;
let texShader;

function preload() {
  // no varyings need to be emitted from the vertex shader
  texShader = readShader('/VisualComputing/sketches/Non_Euclid/non_euclidean.frag',
                         { varyings: Tree.NONE });
  arrow = loadModel('/VisualComputing/sketches/non_euclid_obj/arrow_heart.obj', true);
  bee = loadModel('/VisualComputing/sketches/non_euclid_obj/bee.obj', true);
  tiger = loadModel('/VisualComputing/sketches/non_euclid_obj/tiger_tank.obj', true);
  tree = loadModel('/VisualComputing/sketches/non_euclid_obj/tree.obj', true);
  penguin = loadModel('/VisualComputing/sketches/non_euclid_obj/penguin.obj', true);
  fish = loadModel('/VisualComputing/sketches/non_euclid_obj/fish.obj', true);
  tower = loadModel('/VisualComputing/sketches/non_euclid_obj/eiffel_tower.obj', true);
  crow = loadModel('/VisualComputing/sketches/non_euclid_obj/crow.obj', true);
}
  

function setup() {
  createCanvas(400, 400, WEBGL);
  // no need to normalize the texture
  // textureMode(NORMAL);
  
  // Make buttons
  button1 = createButton('Cube');
  button2 = createButton('Pyramid');
  button3 = createButton('Octahedron');
  button1.mousePressed(showCube);
  button2.mousePressed(showPyramid);
  button3.mousePressed(showOctahedron);
  button1.position(10,10);
  button2.position(10+button1.width,10);
  button3.position(10+button1.width+button2.width,10);
  
  shader(texShader);
  // resolution will be used to sample the offscreen textures
  emitResolution(texShader);
  easycam = createEasyCam();
  // teapotTex = createGraphics(width, height, WEBGL);
  // bunnyTex = createGraphics(width, height, WEBGL);
  arrowTex = createGraphics(width, height, WEBGL);
  beeTex = createGraphics(width, height, WEBGL);
  tigerTex = createGraphics(width, height, WEBGL);
  treeTex = createGraphics(width, height, WEBGL);
  penguinTex = createGraphics(width, height, WEBGL);
  fishTex = createGraphics(width, height, WEBGL);
  crowTex = createGraphics(width, height, WEBGL);
  towerTex = createGraphics(width, height, WEBGL);
}

function draw() {
  // 1. compute current main canvas camera params
  let position = treeLocation();
  let center = p5.Vector.add(position, treeDisplacement());
  let up = treeDisplacement(Tree.j);
  // in case the current camera projection params are needed check:
  // https://github.com/VisualComputing/p5.treegl#frustum-queries
  
  // 2. offscreen rendering
  
  // bunny graphics
  // bunnyTex.background(200);
  // bunnyTex.reset();
  // bunnyTex.camera(position.x, position.y, position.z,
  //                 center.x, center.y, center.z,
  //                 up.x, up.y, up.z);
  // bunnyTex.push();
  // bunnyTex.noStroke();
  // bunnyTex.fill('red');
  // // most models use positive y-coordinates
  // bunnyTex.scale(1, -1);
  // bunnyTex.scale(0.8);// only bunny
  // bunnyTex.model(bunny);
  // bunnyTex.pop();
  
  // teapot graphics
  // teapotTex.background(200);
  // teapotTex.reset();
  // teapotTex.camera(position.x, position.y, position.z,
  //                  center.x, center.y, center.z,
  //                  up.x, up.y, up.z);
  // teapotTex.push();
  // teapotTex.noStroke();
  // teapotTex.fill('blue');
  // teapotTex.scale(1, -1);
  // teapotTex.model(teapot);
  // teapotTex.pop();
  
  // 1-arrow graphics
  arrowTex.background(200);
  arrowTex.reset();
  arrowTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  arrowTex.push();
  arrowTex.noStroke();
  arrowTex.fill('#E91E63');
  // most models use positive y-coordinates
  arrowTex.scale(1, -1);
  arrowTex.scale(0.5);
  arrowTex.model(arrow);
  arrowTex.pop();
  
  // 2-bee graphics
  beeTex.background(200);
  beeTex.reset();
  beeTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  beeTex.push();
  beeTex.noStroke();
  beeTex.fill('#FFEB3B');
  // most models use positive y-coordinates
  beeTex.scale(1, -1);
  beeTex.scale(0.8);
  beeTex.model(bee);
  beeTex.pop();
  
  // 3-tiger graphics
  tigerTex.background(200);
  tigerTex.reset();
  tigerTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  tigerTex.push();
  tigerTex.noStroke();
  tigerTex.fill('#9E9E9E');
  // most models use positive y-coordinates
  tigerTex.scale(1, -1);
  tigerTex.scale(0.8);
  tigerTex.model(tiger);
  tigerTex.pop();
  
  // 4-tree graphics
  treeTex.background(200);
  treeTex.reset();
  treeTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  treeTex.push();
  treeTex.noStroke();
  treeTex.fill('#4CAF50');
  // most models use positive y-coordinates
  treeTex.scale(1, -1);
  treeTex.scale(0.8);
  treeTex.model(tree);
  treeTex.pop();
  
  // 5-penguin graphics
  penguinTex.background(200);
  penguinTex.reset();
  penguinTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  penguinTex.push();
  penguinTex.noStroke();
  penguinTex.fill('#795548');
  // most models use positive y-coordinates
  penguinTex.scale(1, -1);
  penguinTex.scale(0.8);
  penguinTex.model(penguin);
  penguinTex.pop();
  
  // 6-crow graphics
  crowTex.background(200);
  crowTex.reset();
  crowTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  crowTex.push();
  crowTex.noStroke();
  crowTex.fill('#673AB7');
  // most models use positive y-coordinates
  crowTex.scale(1, -1);
  crowTex.scale(0.8);
  crowTex.model(crow);
  crowTex.pop();
  
  // 7-tower graphics
  towerTex.background(200);
  towerTex.reset();
  towerTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  towerTex.push();
  towerTex.noStroke();
  towerTex.fill('#FFC107');
  // most models use positive y-coordinates
  towerTex.scale(1, -1);
  towerTex.scale(0.8);// only bunny
  towerTex.model(tower);
  towerTex.pop();
  
  // 8-fish graphics
  fishTex.background(200);
  fishTex.reset();
  fishTex.camera(position.x, position.y, position.z,
                  center.x, center.y, center.z,
                  up.x, up.y, up.z);
  fishTex.push();
  fishTex.noStroke();
  fishTex.fill('#07FFE5');
  // most models use positive y-coordinates
  fishTex.scale(1, -1);
  fishTex.scale(0.8);// only bunny
  fishTex.model(fish);
  fishTex.pop();
  
  if (use == 1) {
      cube();
  } else if(use == 2) {
      pyramid();
  } else if(use == 3) {
      octahedron();
  }
}
  
  
function cube(){
    // 3. main canvas
    background(0);
    push();
  
    // front (+z)
    stroke('#FFC107');
    strokeWeight(5);
    texShader.setUniform('texture', crowTex);
    beginShape();
    vertex(-edge, -edge, +edge);
    vertex(+edge, -edge, +edge);
    vertex(+edge, +edge, +edge);
    vertex(-edge, +edge, +edge);
    endShape(CLOSE);

    // right (+x)
    texShader.setUniform('texture', fishTex);
    beginShape();
    vertex(+edge, -edge, +edge);
    vertex(+edge, -edge, -edge);
    vertex(+edge, +edge, -edge);
    vertex(+edge, +edge, +edge);
    endShape(CLOSE);

    // left (-x)
    texShader.setUniform('texture', penguinTex);
    beginShape();
    vertex(-edge, -edge, +edge);
    vertex(-edge, +edge, +edge);
    vertex(-edge, +edge, -edge);
    vertex(-edge, -edge, -edge);
    endShape(CLOSE);

    // back (-z)
    texShader.setUniform('texture', treeTex);
    beginShape();
    vertex(-edge, -edge, -edge);
    vertex(-edge, +edge, -edge);
    vertex(+edge, +edge, -edge);
    vertex(+edge, -edge, -edge);
    endShape(CLOSE);

    // bottom (+y)
    texShader.setUniform('texture', beeTex);
    beginShape();
    vertex(-edge, +edge, +edge);
    vertex(+edge, +edge, +edge);
    vertex(+edge, +edge, -edge);
    vertex(-edge, +edge, -edge);
    endShape(CLOSE);

    // top (-y)
    texShader.setUniform('texture', arrowTex);
    beginShape();
    vertex(-edge, -edge, +edge);
    vertex(+edge, -edge, +edge);
    vertex(+edge, -edge, -edge);
    vertex(-edge, -edge, -edge);
    endShape(CLOSE);
    pop();
  }

function pyramid(){
    // 3. main canvas
    background(0);
    push();
  
    // front (+z)
    stroke('#FFC107');
    strokeWeight(5);
    texShader.setUniform('texture', crowTex);
    beginShape();
    vertex(-edge, +edge, +bedge);
    vertex(+edge, +edge, +bedge);
    vertex(0, -bedge, 0);
    endShape(CLOSE);

    // right (+x)
    texShader.setUniform('texture', fishTex);
    beginShape();
    vertex(+edge, +edge, +bedge);
    vertex(+edge, +edge, -bedge);
    vertex(0, -bedge, 0);
    endShape(CLOSE);

    // left (-x)
    texShader.setUniform('texture', penguinTex);
    beginShape();
    vertex(-edge, +edge, +bedge);
    vertex(-edge, +edge, -bedge);
    vertex(0, -bedge, 0);
    endShape(CLOSE);

    // back (-z)
    texShader.setUniform('texture', treeTex);
    beginShape();
    vertex(-edge, +edge, -bedge);
    vertex(+edge, +edge, -bedge);
    vertex(0, -bedge, 0);
    endShape(CLOSE);

    // bottom (+y)
    texShader.setUniform('texture', beeTex);
    beginShape();
    vertex(-edge, +edge, +bedge);
    vertex(+edge, +edge, +bedge);
    vertex(+edge, +edge, -bedge);
    vertex(-edge, +edge, -bedge);
    endShape(CLOSE);

    pop();
}

function octahedron(){
    // 3. main canvas
    background(0);
    push();
  
    // frontup (+z-y)
    stroke('#FFC107');
    strokeWeight(5);
    texShader.setUniform('texture', crowTex);
    beginShape();
    vertex(-oedge, 0, +oedge);
    vertex(+oedge, 0, +oedge);
    vertex(0, -oredge, 0);
    endShape(CLOSE);

    // rightup (+x-y)
    texShader.setUniform('texture', fishTex);
    beginShape();
    vertex(+oedge, 0, +oedge);
    vertex(+oedge, 0, -oedge);
    vertex(0, -oredge, 0);
    endShape(CLOSE);

    // leftup (-x-y)
    texShader.setUniform('texture', penguinTex);
    beginShape();
    vertex(-oedge, 0, +oedge);
    vertex(-oedge, 0, -oedge);
    vertex(0, -oredge, 0);
    endShape(CLOSE);

    // backup (-z-y)
    texShader.setUniform('texture', towerTex);
    beginShape();
    vertex(-oedge, 0, -oedge);
    vertex(+oedge, 0, -oedge);
    vertex(0, -oredge, 0);
    endShape(CLOSE);
  
    // frontdw (+z+y)
    strokeWeight(5);
    texShader.setUniform('texture', beeTex);
    beginShape();
    vertex(-oedge, 0, +oedge);
    vertex(+oedge, 0, +oedge);
    vertex(0, +oredge, 0);
    endShape(CLOSE);

    // rightdw (+x+y)
    texShader.setUniform('texture', tigerTex);
    beginShape();
    vertex(+oedge, 0, +oedge);
    vertex(+oedge, 0, -oedge);
    vertex(0, +oredge, 0);
    endShape(CLOSE);

    // leftdw (-x+y)
    texShader.setUniform('texture', treeTex);
    beginShape();
    vertex(-oedge, 0, +oedge);
    vertex(-oedge, 0, -oedge);
    vertex(0, +oredge, 0);
    endShape(CLOSE);

    // backdw (-z+y)
    texShader.setUniform('texture', arrowTex);
    beginShape();
    vertex(-oedge, 0, -oedge);
    vertex(+oedge, 0, -oedge);
    vertex(0, +oredge, 0);
    endShape(CLOSE);
    

    pop();
}
  
  
  function showCube(){
    use = 1;
  }

  function showPyramid(){
    use = 2;
  }

  function showOctahedron(){
    use = 3;
  }

