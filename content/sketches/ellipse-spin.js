let angle = 0;

function setup() {
  createCanvas(500, 500);
  strokeWeight(4);
}

function draw() {
  background(50);
  noStroke()
  fill(255,255,255)
  ellipse(width/2, height/2,10,10)
 
  for(let i = 15; i<500; i+=15){
    push() //Empieza un nuevo dibujo
    translate(width/2,height/2)
    rotate(i+angle *2)
    noFill()
    stroke(i, i+100, 200)
    ellipse(0,0,i+20,i)
    //reemplazado i por slider.value
    pop()
   
    angle += 0.0003
  }
     
}

function changeColor(){
  background(bgcolor)
}
