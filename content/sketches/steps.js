const barCount = 25;
let barWidth;
let fps = 60;
let x = 0;
let feetWidth;
let feetHeight = 20;
let speed = 0.4;

function setup() {
  createCanvas(400, 300);
  frameRate(fps);
  barWidth = width/barCount;
  feetWidth = barWidth*3.5;
}



function draw() {
  background(255);
  stroke(0);
  fill(0);
  for (let i = 0; i < width; i = i + 2 * barWidth) {

    rect(i,0,barWidth,height);
  }
  stroke(250,250,0);
  fill(250,250,0);
  rect(x,0.35*height,feetWidth,feetHeight);
  stroke(0,0,150);
  fill(0,0,150);
  rect(x,(0.65*height)+0*feetHeight,feetWidth,feetHeight);
  x = x + speed;
  if (x >= width-feetWidth) {
    speed = speed * -1;
  }
  if (x <= 0) {
    speed = speed * -1;
  }
}