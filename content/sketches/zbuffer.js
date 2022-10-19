let angle = 0; // angle for boxes rotation
let positions = [ // will contain boxes 3D positions

];
let zbuffer = [] // will contain distance between camera and each box.
let colors = []; // will contain colors of boxes at any moment.

let active = false; // flag to indicate z-buffer is being visualized

let easycam;

let P; // camera position

let t = 0; // time counter just to play with ligths transitions

// lights colors
let R1 = 255;
let G1 = 255;
let B1 = 255;
let R2 = 255;
let G2 = 255;
let B2 = 255;

function setup() {

  createCanvas(500, 500, WEBGL);
  
  easycam = createEasyCam();

  // camera distance from center (0, 0, 0) will be 600.
  // when applying the quaternion (1, 0, 0, 0) with qpq' operation, camera will be in (0, 0, 600) position as expected.
  let state = {
    distance: 600,           
    center: [0, 0, 0],       
    rotation: [1, 0, 0, 0], // p=(0, 0, 600) => qpq'=(0, 0, 600)  
  };

  easycam.setState(state, 1000);
  
  // 50 boxes are placed throughout the space with random positions.
  for (let i = 0; i < 50; i++) {
    let x = randomint(-250, 250);
    let y = randomint(-250, 250);
    let z = randomint(-250, 250);
    positions.push([x, y, z]); // positions are stored.
  }
}

function draw() {
  
  P = easycam.getPosition(); // P is the camera position.

  updateZBuffer(); // update Z-buffer function stores the distance between camera and each point in the zbuffer array.
  updateColors(); // based on the zbuffer values, each box will have a color calculated via interpolation.
  
  background(50);
  
  if (!active) { // if z-buffer is not being visualized, lights colores are updated every so often.
    let locX = mouseX - height / 2;
    let locY = mouseY - width / 2;
    
    if (t % 300 == 0) {
      R1 = randomint(0, 255);
      G1 = randomint(0, 255);
      B1 = randomint(0, 255); 
    }
    else if (t % 151 == 0) {
      R2 = randomint(0, 255);
      G2 = randomint(0, 255);
      B2 = randomint(0, 255); 
    }
    
    ambientLight(60, 60, 60);
    // 3 lights are being used
    pointLight(R1, G1, B1, 0, 0, 0); // center light
    pointLight(R2, G2, B2, locX, locY, 250); // mouse driven light
    pointLight(B2, R1, G2, P[2], P[1], P[0]); // camera driven light
    ambientMaterial(250);
  }
  
  for (let i = 0; i < positions.length; i++) {
    push();
    translate(positions[i][0], positions[i][1], positions[i][2]); // with push and pop, translation and rotation of each box is independent of each other.
    rotateX(angle);
    rotateY(angle * 0.4);
    if (active) fill(colors[i]); // if zbuffer is being visualized, boxes are painted based on interpolated colors in colors array
    box(50);
    pop();
  }

  angle += 0.01; // boxes rotation
  t += 1;
}

function updateZBuffer() {
  zbuffer = [];
  for (let i = 0; i < positions.length; i++) {
    zbuffer.push(distance(P, positions[i])); // distance between box and camera position P
  }
}

function updateColors() {
  colors = [];
  // thresholds (250, 750) are used so that boxes color change when zooming in and zooming out.
  for (let i = 0; i < positions.length; i++) {
    colors.push(interpolate(250, 750, zbuffer[i])); // interpolation returns a gray scale color.
  }
}

// linear interpolation with gray scale colors.
function interpolate(low, high, mid) {
  let x0 = low;
  let y0 = 255;
  let x1 = high;
  let y1 = 0;
  let x = mid;
  let y = y0 + (x - x0) * ((y1 - y0) / (x1 - x0));
  return y;
}

// to calculate distance between two 3D points.
function distance(p, q) {
  let x0 = p[0];
  let y0 = p[1];
  let z0 = p[2];
  
  let x1 = q[0];
  let y1 = q[1];
  let z1 = q[2];
  
  return Math.sqrt((x0-x1)**2 + (y0-y1)**2 + (z0-z1)**2);
}

// auxiliary functions
function keyPressed() {
    if (active) active = false;
    else active = true;
  }

function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
