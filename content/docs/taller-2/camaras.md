---
title: Camaras
weight: 1
---

# Camaras

## Introducción - Descripción de la idea
> Para este proyecto se tomo como referencia las camaras de punto fijo de los juegos de Resident Evil clásicos en los que se jugaba con una cámara de punto fijo:

{{<img src="/VisualComputing/sketches/re-fixedcam-1.png" /> height="823" width="823">}}

> Tanto el punto de vista como el cambio en las transiciones

{{<img src="/VisualComputing/sketches/fixcam-gif.gif" /> height="823" width="823">}}

> Se hizo uso de transformaciones en el espacio y de camaras con quaterniones, los cuaterniones son muy  ́utiles en la representación gráfica por ordenador, debido, entre otras cosas, a la posibilidad que ofrecen de representar con ellos rotaciones en el espacio tridimensional a través de los ángulos de Euler evitando el Gimbal Lock-Bloqueo del cardán. (Deformación de la imagen por perdida de libertad).

{{< p5-iframe sketch="/VisualComputing/sketches/cameras.js" lib1="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" height="823" width="823">}}

{{<details "Código">}}

``` js

/**
 * 
 * The p5.EasyCam library - Easy 3D CameraControl for p5.js and WEBGL.
 *
 *   Copyright 2018-2020 by p5.EasyCam authors
 *
 *   Source: https://github.com/freshfork/p5.EasyCam
 *
 *   MIT License: https://opensource.org/licenses/MIT
 * 
 * 
 * explanatory notes:
 * 
 * p5.EasyCam is a derivative of the original PeasyCam Library by Jonathan Feinberg 
 * and combines new useful features with the great look and feel of its parent.
 * 
 * 
 */

//
// SplitView setup
//
// Two cameras, each one owns its own rendertarget.
//
//

class wall {
    constructor(tlX, tlY, r, g, b, sX, sY){
      this.tlX = tlX;
      this.tlY = tlY;
      this.r = r;
      this.g = g;
      this.b = b;
      this.sX = sX;
      this.sY = sY;
    }
  }
  
  const walls = []
  
  walls.push(new wall(0, -75, 255, 0, 0, 90, 10));
  walls.push(new wall(90, -75, 0,255,0, 90, 10));
  walls.push(new wall(-90, -75, 0,0,255, 90, 10));
  walls.push(new wall(140, -50, 0,0,255, 10, 60));
  walls.push(new wall(-140, -50, 0,255,0, 10, 60));
  walls.push(new wall(-75, 140, 0,0,255, 120, 10));
  walls.push(new wall(75, 140, 0,0,255, 120, 10));
  walls.push(new wall(-140, 90, 0,255,0, 10, 110));
  walls.push(new wall(140, 90, 0,255,0, 10, 110));
  walls.push(new wall(40, 90, 0,255,0, 5, 90));
  walls.push(new wall(-40, 90, 0,255,0, 5, 90));
  walls.push(new wall(-170, 40, 0,0,255, 50, 10));
  walls.push(new wall(-170, 95, 0,0,255, 50, 10));
  walls.push(new wall(-140, 290, 0,0,255, 10, 290));
  walls.push(new wall(-280, 290, 0,0,255, 10, 290));
  walls.push(new wall(-210, 440, 0,255,0, 150, 10));
  walls.push(new wall(-280, 90, 0,255,0, 10, 110));
  walls.push(new wall(-250, 95, 0,0,255, 50, 10));
  walls.push(new wall(-250, 40, 0,0,255, 50, 10));
  walls.push(new wall(-360, 140, 0,0,255, 150, 10));
  walls.push(new wall(-345, 40, 0,0,255, 120, 10));
  walls.push(new wall(-440, 90, 0,255,0, 10, 110));
  walls.push(new wall(-520, 140, 0,0,255, 150, 10));
  walls.push(new wall(-535, 40, 0,0,255, 120, 10));
  walls.push(new wall(-600, 90, 0,255,0, 10, 110));
  walls.push(new wall(-630, 40, 0,0,255, 50, 10));
  walls.push(new wall(-630, 95, 0,0,255, 50, 10));
  walls.push(new wall(-600, 290, 0,0,255, 10, 290));
  walls.push(new wall(-740, 290, 0,0,255, 10, 290));
  walls.push(new wall(-670, 440, 0,255,0, 150, 10));
  walls.push(new wall(-740, 90, 0,255,0, 10, 110));
  walls.push(new wall(-710, 95, 0,0,255, 50, 10));
  walls.push(new wall(-710, 40, 0,0,255, 50, 10));
  walls.push(new wall(-770, 40, 0,0,255, 50, 10));
  walls.push(new wall(-780, 140, 0,0,255, 70, 10));
  walls.push(new wall(-820, 57.5, 0,255,0, 10, 175));
  walls.push(new wall(-780, -25, 0,0,255, 70, 10));
  walls.push(new wall(-740, -60, 0,255,0, 10, 80));
  walls.push(new wall(-670, -105, 0,0,200, 150, 10));
  walls.push(new wall(-600, -60, 0,255,0, 10, 80));
  walls.push(new wall(-370, -25, 0,0,255, 450, 10));
  walls.push(new wall(170, 40, 0,0,255, 50, 10));
  walls.push(new wall(170, 95, 0,0,255, 50, 10));
  walls.push(new wall(140, 290, 0,0,255, 10, 290));
  walls.push(new wall(280, 290, 0,0,255, 10, 290));
  walls.push(new wall(210, 440, 0,255,0, 150, 10));
  walls.push(new wall(280, 90, 0,255,0, 10, 110));
  walls.push(new wall(250, 95, 0,0,255, 50, 10));
  walls.push(new wall(250, 40, 0,0,255, 50, 10));
  walls.push(new wall(360, 140, 0,0,255, 150, 10));
  walls.push(new wall(345, 40, 0,0,255, 120, 10));
  walls.push(new wall(440, 90, 0,255,0, 10, 110));
  walls.push(new wall(520, 140, 0,0,255, 150, 10));
  walls.push(new wall(535, 40, 0,0,255, 120, 10));
  walls.push(new wall(600, 90, 0,255,0, 10, 110));
  walls.push(new wall(630, 40, 0,0,255, 50, 10));
  walls.push(new wall(630, 95, 0,0,255, 50, 10));
  walls.push(new wall(600, 290, 0,0,255, 10, 290));
  walls.push(new wall(740, 290, 0,0,255, 10, 290));
  walls.push(new wall(670, 440, 0,255,0, 150, 10));
  walls.push(new wall(740, 90, 0,255,0, 10, 110));
  walls.push(new wall(710, 95, 0,0,255, 50, 10));
  walls.push(new wall(710, 40, 0,0,255, 50, 10));
  walls.push(new wall(770, 40, 0,0,255, 50, 10));
  walls.push(new wall(780, 140, 0,0,255, 70, 10));
  walls.push(new wall(820, 57.5, 0,255,0, 10, 175));
  walls.push(new wall(780, -25, 0,0,255, 70, 10));
  walls.push(new wall(740, -60, 0,255,0, 10, 80));
  walls.push(new wall(670, -105, 0,0,200, 150, 10));
  walls.push(new wall(600, -60, 0,255,0, 10, 80));
  walls.push(new wall(370, -25, 0,0,255, 450, 10));
  
  class camState {
    constructor(distance, center, rotation){
      this.distance = distance;
      this.center = center;
      this.rotation = rotation;
    }
  }
  
  const cams = []
  
  cams.push(new camState(900, [0, 0, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-400, 0, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-675, -30, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-780, 50, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-675, 275, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-525, 90, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-360, 90, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [-205, 275, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [205, 275, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [360, 90, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [525, 90, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [675, 275, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [780, 50, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [675, -30, 0], [0, 0, 0, 1]));
  cams.push(new camState(900, [400, 0, 0], [0, 0, 0, 1]));
  
  var currentCam = 1;
  
  var camX;
  var camY;
  var camZ;
  
  class room {
    constructor(X1, X2, Y1, Y2){
      this.X1 = X1;
      this.X2 = X2;
      this.Y1 = Y1;
      this.Y2 = Y2;
    }
  }
  
  const rooms = []
  
  rooms.push(new room(-130, 130, -65, 130));
  rooms.push(new room(-600, -140, -15, 30));
  rooms.push(new room(-730, -610, -95, 30));
  rooms.push(new room(-810, -740, -15, 130));
  rooms.push(new room(-730, -610, 40, 430));
  rooms.push(new room(-590, -450, 40, 130));
  rooms.push(new room(-430, -290, 40, 130));
  rooms.push(new room(-270, -150, 40, 430));
  rooms.push(new room(150, 270, 40, 430));
  rooms.push(new room(290, 430, 40, 130));
  rooms.push(new room(450, 590, 40, 130));
  rooms.push(new room(610, 730, 40, 430));
  rooms.push(new room(740, 810, -15, 130));
  rooms.push(new room(610, 730, -95, 30));
  rooms.push(new room(140, 600, -65, 130));
  
  var currentRoom = 0;
  
  
  var x=0, y=20;
  
  var playerX = 0
  var playerY = 0
  var playerNextX = 0
  var playerNextY = 0
  
  var speed = 1;
  
  function preload() {
    f = loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf');
  }
  
  document.oncontextmenu = function() { return false; }
   
  var easycam1, easycam2;
  
  
  function setup() {
  
    var canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
    
    var graphics1 = createGraphics(windowWidth, windowHeight, WEBGL)
    var graphics2 = createGraphics(windowWidth, windowHeight, WEBGL);
    
  
    easycam1 = new Dw.EasyCam(graphics1._renderer);
    easycam2 = new Dw.EasyCam(graphics2._renderer);
    
    easycam1.setState(cams[0], 0);
    easycam2.setState({distance: 100, center : [0, 0, 0], rotation : [0, 0, 0, 1]}, 0);
    
    
    //easycam1.attachMouseListeners(this._renderer);
    //easycam2.attachMouseListeners(this._renderer);
    
    
    // set viewports
    easycam1.setViewport([0,0,windowWidth,windowHeight]);
    easycam2.setViewport([Math.floor(3*windowWidth/4),0,Math.floor(windowWidth/4),Math.floor(windowHeight/4)]);
  
  }
  
  
  function draw(){
    clear();
    
    easycam2.setCenter([playerX, playerY, 0], 0);
    
    playerNextX = playerX;
    playerNextY = playerY;
    
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].X1 <= playerX && playerNextX <= rooms[i].X2 && rooms[i].Y1 <= playerY && playerY <= rooms[i].Y2) {
        easycam1.setState(cams[i], 0);
        currentRoom = i;
        currentCam = i;
        break;
      }
    }
    
    if (keyIsPressed === true) {
      switch(keyCode) {
        case UP_ARROW:
              playerNextY = playerY + speed
          break;
        case DOWN_ARROW:
              playerNextY = playerY - speed
          break;
        case RIGHT_ARROW:
              playerNextX = playerX - speed
          break;
        case LEFT_ARROW:
              playerNextX = playerX + speed    
          break;
        default:
      }   
    }
    
    for (let i = 0; i < walls.length; i++) {
      if (walls[i].tlY-(walls[i].sY/2) < playerNextY+5 && playerNextY-5 < walls[i].tlY+(walls[i].sY/2) && walls[i].tlX-(walls[i].sX/2) < playerNextX+5 && playerNextX-5 < walls[i].tlX+(walls[i].sX/2)) {
        playerNextY = playerY
        playerNextX = playerX
      }
    }
    
    playerX = playerNextX
    playerY = playerNextY
    
    var g1 = easycam1.graphics;
    var g2 = easycam2.graphics;
    
    g1.clear();
    g2.clear();
    // projection
    g1.perspective();
  
    // BG
    g1.background(32);
    g1.noStroke();
   
    // lights
    g1.ambientLight(10);
    g1.pointLight(200, 200, 200, 0, 0, 50);
   
    //floor
    g1.push();
    g1.translate(0, 0, 0);
    g1.ambientMaterial(255,255,255);
    g1.box(2000, 1200, 1);
    g1.pop();
  
    // player
    g1.push();
    g1.translate(playerX, playerY, 15.5);
    g1.ambientMaterial(0,0,0);
    g1.box(10, 10, 30);
    g1.pop();
    
   
    for (let i = 0; i < walls.length; i++) {
      g1.push();
      g1.translate(walls[i].tlX, walls[i].tlY, 50);
      g1.ambientMaterial(walls[i].r, walls[i].g, walls[i].b);
      g1.box(walls[i].sX, walls[i].sY, 100);
      g1.pop();
    }
    
    g2.ortho(-width/7, width/7, -height/7, height/7);
    
    // BG
    g2.background(32);
    g2.noStroke();
   
    // lights
    g2.ambientLight(35);
    g2.pointLight(10, 10, 10, 0, 0, 50);
   
    //floor
    g2.push();
    g2.translate(0, 0, 0);
    g2.ambientMaterial(255,255,255);
    g2.box(2000, 1200, 1);
    g2.pop();
  
    // player
    g2.push();
    g2.translate(playerX, playerY, 15.5);
    g2.ambientMaterial(0,0,0);
    g2.box(10, 10, 30);
    g2.pop();
    
   
    for (let i = 0; i < walls.length; i++) {
      g2.push();
      g2.translate(walls[i].tlX, walls[i].tlY, 50);
      g2.ambientMaterial(walls[i].r, walls[i].g, walls[i].b);
      g2.box(walls[i].sX, walls[i].sY, 100);
      g2.pop();
    }
   
    // 2D screen-aligned rendering section
    easycam1.beginHUD();
    let state = easycam2.getState();
  
  // Render the background box for the HUD
    g1.noStroke();
    g1.fill(50,50,52, 200); // a bit of transparency
    g1.rect(x+20,y,380,180);
    
    // use the loaded font
    g1.textFont(f);
    g1.textSize(16);
    g1.stroke(50,50,52);
    g1.strokeWeight(0.5);
  
    // Render the labels
    g1.fill(69,161,255);
    g1.text("Camera:",x+35,y+25);
    g1.text("Room:",x+35,y+25+20);
    g1.text("Distance:",x+35,y+25+40);
    g1.text("Center:  ",x+35,y+25+60);
    g1.text("Rotation:",x+35,y+25+80);
    g1.text("Framerate:",x+35,y+25+100);
    g1.text("playerX:",x+35,y+25+120);
    g1.text("playerY:",x+35,y+25+140);
  
    // Render the state numbers
    g1.fill(69,161,255);
    g1.text(currentCam,x+125,y+25);
    g1.text(currentRoom,x+125,y+25+20);
    g1.text(nfs(state.distance, 1, 2),x+125,y+25+40);
    g1.text(nfs(state.center,   1, 2),x+125,y+25+60);
    g1.text(nfs(state.rotation, 1, 3),x+125,y+25+80);
    g1.text(nfs(frameRate(),    1, 2),x+125,y+25+100);
    g1.text(nfs(playerX,    1, 2),x+125,y+25+120);
    g1.text(nfs(playerY,    1, 2),x+125,y+25+140);
    easycam1.endHUD();
    
    // display results
    displayResult_WEBGL();
  }
  
  // use this, when the main canvas is WEBGL ... createCanvas(w,h,WEBGL)
  function displayResult_WEBGL(){
    var vp1 = easycam1.getViewport();
    var vp2 = easycam2.getViewport();
   
    resetMatrix();
    ortho(0, width, -height, 0, -Number.MAX_VALUE, +Number.MAX_VALUE);
  
    texture(easycam1.graphics);
    rect(vp1[0], vp1[1], vp1[2], vp1[3]);
    
    texture(easycam2.graphics);
    rect(vp2[0], vp2[1], vp2[2], vp2[3]);
  }
```
{{< /details >}}

## Conclusiones
* asd

## References
* Sasd, Tomado de https://
