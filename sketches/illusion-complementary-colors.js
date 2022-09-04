let colors = [];
let flag = false;

function setup() {
  createCanvas(500, 500);
  angleMode(DEGREES);
  
  colors = [color('magenta'), color('magenta'), color('magenta'),
            color('magenta'), color('magenta'), color('magenta'),
            color('magenta'), color('magenta'), color('magenta'),
            color('magenta'), color('magenta'), color('magenta')]
  
}

function draw() {

  background(240);
  strokeWeight(1);
  noStroke();
  fill(240);
  circle(250, 250, 400);
  
  
  let p0 = createVector(450, 250);
  let p30 = createVector(cos(30)*200 + 200 + 50, (1-sin(30))*200 + 50);
  let p60 = createVector(cos(60)*200 + 200 + 50, (1-sin(60))*200 + 50);
  let p90 = createVector(250, 50);
  let p120 = createVector((1-(-cos(120)))*200 + 50, (1-sin(120))*200 + 50);
  let p150 = createVector((1-(-cos(150)))*200 + 50, (1-sin(150))*200 + 50);
  let p180 = createVector(50, 250);
  let p210 = createVector((1-(-cos(210)))*200 + 50, -sin(210)*200 + 200 + 50);
  let p240 = createVector((1-(-cos(240)))*200 + 50, -sin(240)*200 + 200 + 50);
  let p270 = createVector(250, 450);
  let p300 = createVector(cos(300)*200 + 200 + 50, -sin(300)*200 + 200 + 50);
  let p330 = createVector(cos(330)*200 + 200 + 50, -sin(330)*200 + 200 + 50)  
  
  point(p0);
  point(p30);
  point(p60);
  point(p90);
  point(p120);
  point(p150);
  point(p180);
  point(p210);
  point(p240);
  point(p270);
  point(p300);
  point(p330);
  
  noStroke();
  fill(colors[0]);
  circle(p0.x, p0.y, 60);
  fill(colors[1]);
  circle(p30.x, p30.y, 60);
  fill(colors[2]);
  circle(p60.x, p60.y, 60);
  fill(colors[3]);
  circle(p90.x, p90.y, 60);
  fill(colors[4]);
  circle(p120.x, p120.y, 60);
  fill(colors[5]);
  circle(p150.x, p150.y, 60);
  fill(colors[6]);
  circle(p180.x, p180.y, 60);
  fill(colors[7]);
  circle(p210.x, p210.y, 60);
  fill(colors[8]);
  circle(p240.x, p240.y, 60);
  fill(colors[9]);
  circle(p270.x, p270.y, 60);
  fill(colors[10]);
  circle(p300.x, p300.y, 60);
  fill(colors[11]);
  circle(p330.x, p330.y, 60);  
  
  strokeWeight(10);
  stroke(1)
  point(250, 250)

  if (flag == false)
    go();
  flag = true;
}

async function go() {
    for (let i = 0; i < colors.length; i++) {
      await sleep(200); 
      if (i == 0)
        colors[colors.length - 1] = color('magenta');  
      else
        colors[i-1] = color('magenta'); 
      colors[i] = color(240); 
    } 
    flag = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}