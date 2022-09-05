let barWidth;
let x = 0;
let feetWidth;
let feetHeight;
let feetDistance;
let speed;
let direction = 1;

let barWidthSlider;
let feetWidthSlider;
let feetHeightSlider;
let feetDistanceSlider;
let speedSlider;

const labels = ["Ancho\nBarras","Longitud\nPies","Ancho\nPies","Distancia\nPies","Velocidad"];

function setup() {
  createCanvas(450, 380);
  frameRate(60);
  colorMode(HSB);

  barWidthSlider = createSlider(5, 50, 25);
  barWidthSlider.position(5, 310);
  barWidthSlider.style('width', '80px');

  feetWidthSlider = createSlider(5, 150, 100);
  feetWidthSlider.position(90, 310);
  feetWidthSlider.style('width', '80px');

  feetHeightSlider = createSlider(5, 0.5*(height-80), 25);
  feetHeightSlider.position(175, 310);
  feetHeightSlider.style('width', '80px');

  feetDistanceSlider = createSlider(0, (height-80), 40);
  feetDistanceSlider.position(260, 310);
  feetDistanceSlider.style('width', '80px');

  speedSlider = createSlider(0, 300, 100);
  speedSlider.position(345, 310);
  speedSlider.style('width', '80px');
}



function draw() {
  speed = direction * speedSlider.value()/100;
  barWidth = barWidthSlider.value();  
  if (x + feetWidthSlider.value() <= width){
    feetWidth = feetWidthSlider.value();
  }
  feetHeight = feetHeightSlider.value();
  if (feetDistanceSlider.value() <= (height-80)-2*feetHeight){
    feetDistance = feetDistanceSlider.value();
  }else{
    feetDistance = (height-80)-2*feetHeight;
  }
  

  background(0,0,98);
  stroke(0,0,0);
  fill(0,0,0);
  for (let i = 0; i < width; i = i + 2 * barWidth) {
    rect(i,0,barWidth,(height-80));
  }

  stroke(60,100,95);
  fill(60,100,95);
  rect(x,(0.5*(height-80))-feetHeight-0.5*feetDistance,feetWidth,feetHeight);

  stroke(240,100,40);
  fill(240,100,40);
  rect(x,(0.5*(height-80))+0.5*feetDistance,feetWidth,feetHeight);

  x = x + speed;
  if (x >= width-feetWidth) {
    direction = -1;
  }
  if (x <= 0) {
    direction = 1;
  }
  stroke(0,0,100);
  fill(0,0,100);
  rect(0,300,width,80);
  textSize(16);
  textAlign(CENTER);
  stroke(0,0,0);
  fill(0,0,0);
  text(labels[0], 45, 347);
  text(labels[1], 130, 347);
  text(labels[2], 215, 347);
  text(labels[3], 300, 347);
  text(labels[4], 385, 347);  
}