---
title: Múltiples Cámaras
weight: 1
bookToc: false
---

# Múltiples Cámaras

{{< p5-iframe sketch="/VisualComputing/sketches/cameras.js" lib1="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js" height="823" width="823">}}
## Introducción - Descripción de la idea
Para este proyecto se tomo como referencia las cámaras de punto fijo de los juegos de Resident Evil clásicos en los que se jugaba con una cámara de punto fijo:

![FixCam](/VisualComputing/re-fixedcam-1.png)

Tanto el punto de vista como el cambio en las transiciones

![FixCamGif](/VisualComputing/fixcam-gif.gif)

Se hizo uso de transformaciones en el espacio y de cámaras con quaterniones, los cuaterniones son muy  ́utiles en la representación gráfica por ordenador, debido, entre otras cosas, a la posibilidad que ofrecen de representar con ellos rotaciones en el espacio tridimensional a través de los ángulos de Euler evitando el Gimbal Lock-Bloqueo del cardán. (Deformación de la imagen por perdida de libertad).

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

walls.push(new wall(0, -75, 128, 64, 0, 90, 10));
walls.push(new wall(90, -75, 255,255,255, 90, 10));
walls.push(new wall(-90, -75, 255,255,255, 90, 10));
walls.push(new wall(140, -50, 255,255,255, 10, 60));
walls.push(new wall(-140, -50, 255,255,255, 10, 60));
walls.push(new wall(-75, 140, 255,255,255, 120, 10));
walls.push(new wall(75, 140, 255,255,255, 120, 10));
walls.push(new wall(-140, 90, 255,255,255, 10, 110));
walls.push(new wall(140, 90, 255,255,255, 10, 110));
walls.push(new wall(40, 90, 255,255,255, 5, 90));
walls.push(new wall(-40, 90, 255,255,255, 5, 90));
walls.push(new wall(-170, 40, 255, 255, 255, 50, 10));
walls.push(new wall(-170, 95, 128, 64, 0, 50, 10));
walls.push(new wall(-140, 290, 255,255,255, 10, 290));
walls.push(new wall(-280, 290, 255,255,255, 10, 290));
walls.push(new wall(-210, 440, 255,255,255, 150, 10));
walls.push(new wall(-280, 90, 255,255,255, 10, 110));
walls.push(new wall(-250, 95, 128,64,0, 50, 10));
walls.push(new wall(-250, 40, 255,255,255, 50, 10));
walls.push(new wall(-360, 140, 255,255,255, 150, 10));
walls.push(new wall(-345, 40, 255,255,255, 120, 10));
walls.push(new wall(-440, 90, 255,255,255, 10, 110));
walls.push(new wall(-520, 140, 2055,255,255, 150, 10));
walls.push(new wall(-535, 40, 255,255,255, 120, 10));
walls.push(new wall(-600, 90, 255,255,255, 10, 110));
walls.push(new wall(-630, 40, 255,255,255, 50, 10));
walls.push(new wall(-630, 95, 128,64,0, 50, 10));
walls.push(new wall(-600, 290, 255,255,255, 10, 290));
walls.push(new wall(-740, 290, 255,255,255, 10, 290));
walls.push(new wall(-670, 440, 255,255,255, 150, 10));
walls.push(new wall(-740, 90, 255,255,255, 10, 110));
walls.push(new wall(-710, 95, 128,64,0, 50, 10));
walls.push(new wall(-710, 40, 255,255,255, 50, 10));
walls.push(new wall(-770, 40, 255,255,255, 50, 10));
walls.push(new wall(-780, 140, 255,255,255, 70, 10));
walls.push(new wall(-820, 57.5, 255,255,255, 10, 175));
walls.push(new wall(-780, -25, 255,255,255, 70, 10));
walls.push(new wall(-740, -60, 255,255,255, 10, 80));
walls.push(new wall(-670, -105, 255,255,255, 150, 10));
walls.push(new wall(-600, -60, 255,255,255, 10, 80));
walls.push(new wall(-370, -25, 255,255,255, 450, 10));
walls.push(new wall(170, 40, 255,255,255, 50, 10));
walls.push(new wall(170, 95, 128,64,0, 50, 10));
walls.push(new wall(140, 290, 255,255,255, 10, 290));
walls.push(new wall(280, 290, 255,255,255, 10, 290));
walls.push(new wall(210, 440, 255,255,255, 150, 10));
walls.push(new wall(280, 90, 255,255,255, 10, 110));
walls.push(new wall(250, 95, 128,64,0, 50, 10));
walls.push(new wall(250, 40, 255,255,255, 50, 10));
walls.push(new wall(360, 140, 255,255,255, 150, 10));
walls.push(new wall(345, 40, 255,255,255, 120, 10));
walls.push(new wall(440, 90, 255,255,255, 10, 110));
walls.push(new wall(520, 140, 255,255,255, 150, 10));
walls.push(new wall(535, 40, 255,255,255, 120, 10));
walls.push(new wall(600, 90, 255,255,255, 10, 110));
walls.push(new wall(630, 40, 255,255,255, 50, 10));
walls.push(new wall(630, 95, 128,64,0, 50, 10));
walls.push(new wall(600, 290, 255,255,255, 10, 290));
walls.push(new wall(740, 290, 255,255,255, 10, 290));
walls.push(new wall(670, 440, 255,255,255, 150, 10));
walls.push(new wall(740, 90, 255,255,255, 10, 110));
walls.push(new wall(710, 95, 128,64,0, 50, 10));
walls.push(new wall(710, 40, 255,255,255, 50, 10));
walls.push(new wall(770, 40, 255,255,255, 50, 10));
walls.push(new wall(780, 140, 255,255,255, 70, 10));
walls.push(new wall(820, 57.5, 255,255,255, 10, 175));
walls.push(new wall(780, -25, 255,255,255, 70, 10));
walls.push(new wall(740, -60, 255,255,255, 10, 80));
walls.push(new wall(670, -105, 255,255,255, 150, 10));
walls.push(new wall(600, -60, 255,255,255, 10, 80));
walls.push(new wall(370, -25, 255,255,255, 450, 10));

class camState {
constructor(distance, center, rotation){
    this.distance = distance;
    this.center = center;
    this.rotation = rotation;
}
}

const cams = []


//0
//cams.push(new camState(900, [-200, 0, 0], [0, 0, 0, 1]));

//1
cams.push(new camState(197, [0, 0, 0], [0.006, -0.001, -0.109, 1]));

//2
cams.push(new camState(130, [0, 60, 0], [-0.915, -0.332, -0.074, 0.211]));

//3
cams.push(new camState(130, [90, 60, 0], [-0.910, -0.335, 0.098, -0.220]));
//4
cams.push(new camState(130, [-90, 60, 0], [-0.910, -0.335, 0.098, -0.220]));

//5
cams.push(new camState(132, [-210, 0, 0], [-0.002, 0, -0.033, 1]));

//6
cams.push(new camState(120, [-210, 60, 0], [0.689, 0.191, -0.113, 0.677]));

//7
cams.push(new camState(180, [-210, 270, 0], [ -0.873, -0.459, 0.104, -0.118]));

//8
cams.push(new camState(134, [-360, 0, 0], [ 0.668, 0.256, 0.180, -0.674]));

//9
cams.push(new camState(117, [-360, 90, 0], [ 0.794, 0.33, -0.195, 0.468]));

//10
cams.push(new camState(113, [-510, 0, 0], [ 0.671, 0.284, -0.245, 0.649]));

//11
cams.push(new camState(113, [-510, 90, 0], [ -0.515, -0.189, -0.354, 0.756]));

//12
cams.push(new camState(120, [-720, 0, 0], [ 0.563, 0.249, 0.241, -0.749]));

//13
cams.push(new camState(134, [-660, -45, 0], [ 0, -0.003, 0.164, -0.986]));

//14
cams.push(new camState(120, [-660, 60, 0], [0.689, 0.191, 0.191, -0.687]));

//15
cams.push(new camState(190, [-660, 270, 0], [ 0.855, 0.478, 0.105, -0.169]));

//16
cams.push(new camState(100, [-765, 90, 0], [ .920, 0.161, 0.046, 0.351]));

//17
cams.push(new camState(132, [210, 0, 0], [-0.002, 0, -0.033, 1]));

//18
cams.push(new camState(120, [210, 60, 0], [0.689, 0.191, -0.113, 0.677]));

//19
cams.push(new camState(180, [210, 270, 0], [ 0.852, 0.485, 0.100, -0.163]));

//20
cams.push(new camState(134, [360, 0, 0], [ -0.668, -0.256, 0.180, -0.674]));

//21
cams.push(new camState(117, [360, 90, 0], [ 0.794, 0.33, -0.195, 0.468]));

//22
cams.push(new camState(113, [510, 0, 0], [ 0.671, 0.284, 0.245, -0.649]));

//23
cams.push(new camState(100, [510, 90, 0], [ 0.810, 0.351, 0.185, -0.429]));

//24
cams.push(new camState(130, [720, 0, 0], [ -0.671, -0.284, 0.237, -0.642]));

//25
cams.push(new camState(134, [660, -45, 0], [ 0, -0.003, 0.164, -0.986]));

//26
cams.push(new camState(105, [660, 60, 0], [0.689, 0.191, 0.191, -0.687]));

//27
cams.push(new camState(190, [660, 270, 0], [ 0.864, 0.482, 0.061, -0.127]));

//28
cams.push(new camState(100, [765, 90, 0], [ 0.869, 0.291, -0.138, 0.374]));


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


rooms.push(new room(-140, 140, -75, 45));
rooms.push(new room(-40, 40, 45, 135));
rooms.push(new room(40, 130, 45, 135));
rooms.push(new room(-130, -40, 45, 135));
rooms.push(new room(-280, -140, -15, 30));
rooms.push(new room(-280, -140, 40, 95));
rooms.push(new room(-280, -140, 105, 430));
rooms.push(new room(-440, -290, -15, 30));
rooms.push(new room(-430, -290, 40, 130));
rooms.push(new room(-590, -440, -15, 30));
rooms.push(new room(-590, -450, 40, 130));
rooms.push(new room(-810, -600, -15, 30));
rooms.push(new room(-730, -610, -95, -25));
rooms.push(new room(-730, -610, 40, 95));
rooms.push(new room(-730, -610, 105, 430));
rooms.push(new room(-810, -750, 40, 130));

rooms.push(new room(140, 280, -15, 30));
rooms.push(new room(140, 280, 40, 95));
rooms.push(new room(140, 280, 105, 430));
rooms.push(new room(290, 440, -15, 30));
rooms.push(new room(290, 430, 40, 130));
rooms.push(new room(440, 590, -15, 30));
rooms.push(new room(450, 590, 40, 130));
rooms.push(new room(600, 810, -15, 30));
rooms.push(new room(610, 730, -95, -25));
rooms.push(new room(610, 730, 40, 95));
rooms.push(new room(610, 730, 105, 430));
rooms.push(new room(750, 810, 40, 130));

var currentRoom = 0;


var x=0, y=20;

var playerX = 0;
var playerY = 0;
var playerNextX = 0;
var playerNextY = 0;

var playerFacing = 0;
var playerSpeed = 2;

let floor_texture;
let wall_texture;
let door_texture;

function preload() {
    f = loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf');

    floor_texture = loadImage('/VisualComputing/sketches/textures_models/floor_texture.jpeg');
    wall_texture = loadImage('/VisualComputing/sketches/textures_models/wall1_texture.jpg');
    door_texture = loadImage('/VisualComputing/sketches/textures_models/wall6_texture.jpg');  

    modelPlayer = loadModel('/VisualComputing/sketches/textures_models/player.obj');

    modelCharizard = loadModel('/VisualComputing/sketches/textures_models/charizard.obj');
    textureCharizard = loadImage('/VisualComputing/sketches/textures_models/charizard.jpg');  

    modelBulbasaur = loadModel('/VisualComputing/sketches/textures_models/bulbasaur.obj');
    textureBulbasaur = loadImage('/VisualComputing/sketches/textures_models/bulbasaur.jpg');

    modelSquirtle = loadModel('/VisualComputing/sketches/textures_models/squirtle.obj');
    textureSquirtle = loadImage('/VisualComputing/sketches/textures_models/squirtle.jpg');

    modelScyther  = loadModel('/VisualComputing/sketches/textures_models/scyther.obj');
    textureScyther = loadImage('/VisualComputing/sketches/textures_models/scyther.jpg');
}

document.oncontextmenu = function() { return false; }

var easycam1, easycam2;

function setup() {
    frameRate(30)
    var w = 800;
    var h = 800;

    var canvas = createCanvas(w, h, WEBGL);  

    var graphics1 = createGraphics(w, h, WEBGL)
    var graphics2 = createGraphics(w, h, WEBGL);


    easycam1 = new Dw.EasyCam(graphics1._renderer);
    easycam2 = new Dw.EasyCam(graphics2._renderer);

    easycam1.setState(cams[0], 0);
    easycam2.setState({distance: 100, center : [0, 0, 0], rotation : [0, 0, 0, 1]}, 0);


    //easycam1.attachMouseListeners(this._renderer);
    //easycam2.attachMouseListeners(this._renderer);


    // set viewports
    easycam1.setViewport([0,0,w,h]);
    easycam2.setViewport([Math.floor(3*w/4),0,Math.floor(w/4),Math.floor(h/4)]);
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
        case 87://W
                playerNextY = playerY + playerSpeed;
                playerFacing = 2;
            break;
        case 83://S
                playerNextY = playerY - playerSpeed;
                playerFacing = 0;
            break;
        case 68://D
                playerNextX = playerX - playerSpeed;
                playerFacing = 3;
            break;
        case 65://A
                playerNextX = playerX + playerSpeed;
                playerFacing = 1;
            break;
        case 69://E
                playerSpeed = playerSpeed + 0.1;
            break;
        case 81://Q
                playerSpeed = playerSpeed - 0.1;
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
    g1.pointLight(35, 30, 30, 0, 0, 100);

    //floor
    g1.push();
    g1.translate(0, 0, 0);
    g1.ambientMaterial(255,255,255);
    g1.texture(floor_texture);
    g1.box(2000, 1200, 1);
    g1.pop();

    // player
    g1.push();
    g1.translate(playerX, playerY, 0);
    g1.ambientMaterial(0,0,0);
    g1.scale(2);
    g1.rotateX(PI/2*(-3));
    g1.rotateY(playerFacing*PI/2*(-3));
    g1.model(modelPlayer);
    //g1.box(10, 10, 30);
    g1.pop();
    
    // Charizard
    g1.push();
    g1.translate(230, 380, 12);
    g1.ambientMaterial(0,0,0);
    g1.scale(0.15);
    g1.texture(textureCharizard);
    g1.rotateX(PI/2*(-0.9));
    g1.rotateY(PI/2*(-2));
    g1.model(modelCharizard);  
    g1.pop();
    
    // Bulbasaur
    g1.push();
    g1.translate(-800, 0, 0);
    g1.ambientMaterial(0,0,0);
    g1.scale(0.05);
    g1.texture(textureBulbasaur);
    g1.rotateX(PI/2*(-1));
    g1.rotateY(PI/2*(1));
    g1.model(modelBulbasaur);  
    g1.pop();
    
    // Squirtle
    g1.push();
    g1.translate(755, 60, 0);
    g1.ambientMaterial(0,0,0);
    g1.scale(0.10);
    g1.texture(textureSquirtle);
    g1.rotateX(PI/2*(-0.9));
    g1.rotateY(PI/2*(-1.6));
    g1.model(modelSquirtle);  
    g1.pop();
    
    // Scyther
    g1.push();  
    g1.translate(-360, 90, 22);
    g1.ambientMaterial(0,0,0);
    g1.scale(0.17);
    g1.texture(textureScyther);
    g1.rotateX(PI/2*(-1));
    g1.rotateY(PI/2*(1));
    g1.model(modelScyther);  
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
    // g2.ambientLight(35);
    // g2.pointLight(10, 10, 10, 0, 0, 50);

    //floor
    // g2.push();
    // g2.translate(0, 0, 0);
    // g2.ambientMaterial(255,255,255);
    // g2.box(2000, 1200, 1);
    // g2.pop();

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
    let state = easycam1.getState();

    // Render the background box for the HUD
    g1.noStroke();
    g1.fill(50,50,52, 200); // a bit of transparency
    g1.rect(x+20,y,380,200);

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
    g1.text("playerSpeed:",x+35,y+25+160);

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
    g1.text(nfs(playerSpeed,    1, 2),x+125,y+25+160);
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
* Es posible crear un entorno 3D virtual con solo dos dimensiones, controlando los ángulos implicados en el proceso y evitando la deformación espacial por las perspectivas, existen librerias especificas para este propósito, entre ellas están EasyCam que ya han hecho todo el trabajo matemático para permitir crear estos entornos con instrucciones simplificadas.

## References
* EasyCamhttps://github.com/freshfork/p5.EasyCam
* Carratalá Rocío, Tomado de http://repositori.uji.es/xmlui/bitstream/handle/10234/139036/TFG_2015_CarratalaSaezR.pdf?sequence=1
