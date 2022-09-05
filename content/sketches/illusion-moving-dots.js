let angle = 0;
function setup() {
  createCanvas(700, 700);
}

function draw() {
  background(50);
  for (let i = 50; i < width - 45; i += 50) {
    for (let j = 50; j < height - 45; j += 50) {

      push()
      fill(0, 168, 0);
      stroke(0, 0, 150);
      strokeWeight(3);
      ellipse(i, j, 25, 25);
      pop()

      push()
      translate(i, j);
      rotate(HALF_PI + i - angle * 3)
      stroke(0, 168, 168);
      strokeWeight(3);
      noFill();
      arc(0, 0, 30, 30, 0, PI)
      pop()

      push()
      translate(i, j);
      rotate(QUARTER_PI * j + angle * 4)
      stroke(0, 255, 255);
      strokeWeight(3);
      noFill();
      arc(0, 0, 25, 25, PI , 0)
      pop()

      angle += 0.0005

    }
  }
}
