---
title: Coloring
weight: 1
---

## Exercise
1. Figure it out the js code of the above sketches.
2. Implement other blending modes.

## Blending Modes

Esta aplicación aplica diferentes modos de blend a una imagen con un color. La imagen y el color son seleccionados por el usuario. 

Primero se renderiza la imagen cargada, y se envía como textura al blend shader. Al blend shader se le envía el color seleccionado por el usuario como un arreglo de JavaScript de cuatro posiciones. Cada entrada se divide en 255 para representar un color RGBA normalizado [0..1].

El blend shader toma el color de cada texel que recibe en la textura (imagen cargada y recibida) y hace el cálculo del blend con el color (vec4) recibido, utilizando la fórmula según corresponda.

El resultado de la operación de blend es un color que para el pixel de la textura de salida, la cual se renderiza sobre el cuadrado de la parte inferior. 

Esa textura renderizada en la parte inferior es la misma imagen cargada al inicio pero sus colores son el resultado de la operación de blend correspondiente texel a texel con el color seleccionado por el usuario.

Los blending modes implementados son: multiply, add (linear dodge), screen, overlay, darkest, lightest, color burn, linear burn, difference, divide, exclusion, color dodge, hard light, vivid light, linear light, pin light t cuatro versiones de soft light: photoshop, pegtop, ilussions.hu y w3c. 

Las fórmulas fueron tomadas de [Blend Modes (Wikipedia)](https://en.wikipedia.org/wiki/Blend_modes) y [Formulas for Photoshop blending modes (RBA's Astrophotography)](http://www.deepskycolors.com/archivo/2010/04/21/formulas-for-Photoshop-blending-modes.html)

Otras referencias utilizadas: [Why my texture coordinates are inverted each time I call my GLSL shader in P5.js (Stack Overflow)](https://stackoverflow.com/questions/67576655/why-my-texture-coordinates-are-inverted-each-time-i-call-my-glsl-shader-in-p5js)

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Checkbox Default Video**: marcar para usar el video por defecto, desmarcar para usar la imagen por defecto
* **Slider**: controla el brillo
* **Select**: selecciona el blending mode que desea utilizar
* **Color Picker**: selecciona el color que se usará en la operación de blend seleccionada para cada texel de la imagen (o video) cargada

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/Blending/blend.js" width="950" height="900" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js">}}

## Código

{{<details "Sketch Code">}}

``` js

let blendShader;
let colorB; // picked by user
let B; // vec4 vector sent to shader
let tex; // shader output texture
let cpickerB;
let bslider; // brightness slider
let bmselect; // blending mode select
let brightness;
let mode;
let img; // shader input texture
let input;
let video_on;

function preload() {
  blendShader = readShader('/VisualComputing/docs/shaders/fragments/blend.frag', { matrices: Tree.NONE, varyings: Tree.texcoords2 });
}

function setup() {

  createCanvas(900, 850, WEBGL);
  
  colorB = color(10, 255, 170);
  
  tex = createGraphics(800, 800, WEBGL);
  
  cpickerB = createColorPicker(colorB);
  cpickerB.position(490, 200);

  bslider = createSlider(0, 1, 1, 0.05);
  bslider.position(490, 120);
  bslider.style('width', '80px');

  bmselect = createSelect();
  bmselect.position(490, 160);
  bmselect.option('MULTIPLY', 0);
  bmselect.option('ADD (LINEAR DODGE)', 1);
  bmselect.option('SCREEN', 2);
  bmselect.option('OVERLAY', 3);
  bmselect.option('DARKEST', 4);
  bmselect.option('LIGHTEST', 5);
  bmselect.option('COLOR BURN', 6);
  bmselect.option('LINEAR BURN', 7);
  bmselect.option('DIFFERENCE', 8);
  bmselect.option('DIVIDE', 9);
  bmselect.option('EXCLUSION', 10);
  bmselect.option('COLOR DODGE', 11);
  bmselect.option('HARD LIGHT', 12);
  bmselect.option('VIVID LIGHT', 13);
  bmselect.option('LINEAR LIGHT', 14);
  bmselect.option('PIN LIGHT', 15);
  bmselect.option('SOFT LIGHT 1', 16); // photoshop
  bmselect.option('SOFT LIGHT 2', 17); // pegtop
  bmselect.option('SOFT LIGHT 3', 18); // ilussions.hu
  bmselect.option('SOFT LIGHT 4', 19); // w3C
  bmselect.selected('MULTIPLY');

  img = loadImage('/VisualComputing/docs/shaders/resources/image.jpg');
  input = createFileInput(handleFile);

  video_on = createCheckbox('default video', false);
  video_on.changed(() => {
    if (video_on.checked()) {
      img = createVideo(['/VisualComputing/docs/shaders/resources/video0.mp4']);
      img.hide();
    } else {
      img = loadImage('/VisualComputing/docs/shaders/resources/image.jpg');
      img.hide();     
      img.pause();
    }
    blendShader.setUniform('texture', img);
  })
}

function draw() {
 
  colorB = cpickerB.color()
  
  background(0);
  
  image(img, -450, -400, 400, 400); 

  fill(colorB)
  square(30, -170, 150);
  
  // vec4 vector sent to shader
  B = [colorB._getRed() / 255, colorB._getGreen() / 255, colorB._getBlue() / 255, alpha(colorB) / 255] // normalized
  
  brightness = bslider.value();
  mode = bmselect.value();

  tex.shader(blendShader)
  blendShader.setUniform('texture', img); // each texel will be color A
  blendShader.setUniform('colorB', B); 
  blendShader.setUniform('brightness', brightness); 
  blendShader.setUniform('mode', mode); 
  tex.square();
  texture(tex);
  square(-600, 10, 800);
}

function handleFile(file) {
  if (file.type === 'image') {
    img = createImg(file.data, '');
    img.hide();
  }
  else if (file.type === 'video') {
    img = createVideo([file.data]);
    img.hide();
    img.loop();
  }
}

```
{{</details >}}

{{<details "Blend Shader">}}

``` glsl

precision mediump float;

uniform vec4 colorB;
uniform float brightness; // [0, 1]
uniform int mode;
uniform sampler2D texture;
varying vec2 texcoords2;

void main() {

  // https://stackoverflow.com/questions/67576655/why-my-texture-coordinates-are-inverted-each-time-i-call-my-glsl-shader-in-p5js
  vec4 colorA = texture2D(texture, vec2(texcoords2.x, 1.0 - texcoords2.y)); // each texel is color A

  if (mode == 0) { // multiply
    gl_FragColor = colorA * colorB * brightness;
  }
  else if (mode == 1) { // add (linear dodge)
    gl_FragColor = (colorA + colorB) * brightness;
  }
  else if (mode == 2) { // screen
    gl_FragColor = (1. - (1. - colorA) * (1. - colorB)) * brightness;
  }
  else if (mode == 3) { // overlay
    float R = (colorA[0] < 0.5) ? 2. * colorA[0] * colorB[0] : (1. - (1. - colorA[0]) * (1. - colorB[0]));
    float G = (colorA[1] < 0.5) ? 2. * colorA[1] * colorB[1] : (1. - (1. - colorA[1]) * (1. - colorB[1]));
    float B = (colorA[2] < 0.5) ? 2. * colorA[2] * colorB[2] : (1. - (1. - colorA[2]) * (1. - colorB[2]));
    float A = (colorA[3] < 0.5) ? 2. * colorA[3] * colorB[3] : (1. - (1. - colorA[3]) * (1. - colorB[3]));
    gl_FragColor = vec4(R, G, B, A) * brightness;
  }
  else if (mode == 4) { // darkest
    gl_FragColor = vec4(min(colorA[0], colorB[0]), 
                        min(colorA[1], colorB[1]), 
                        min(colorA[2], colorB[2]), 
                        min(colorA[3], colorB[3])) * brightness;
  }
  else if (mode == 5) { // lightest
    gl_FragColor = vec4(max(colorA[0], colorB[0]), 
                        max(colorA[1], colorB[1]), 
                        max(colorA[2], colorB[2]), 
                        max(colorA[3], colorB[3])) * brightness;
  }
  else if (mode == 6) { // color burn
    gl_FragColor = 1. - ((1. - colorA) / colorB) * brightness;
  }
  else if (mode == 7) { // linear burn
    gl_FragColor = (colorA + colorB - 1.) * brightness;
  }
  else if (mode == 8) { // difference
    gl_FragColor = (abs(colorA - colorB)) * brightness;
  }
  else if (mode == 9) { // divide
    gl_FragColor = (colorA / colorB) * brightness;
  }
  else if (mode == 10) { // exclusion
    gl_FragColor = (0.5 - 2. * (colorA - 0.5) * (colorB - 0.5)) * brightness;
  }
  else if (mode == 11) { // color dodge
    gl_FragColor = (colorA / (1. - colorB)) * brightness;
  }
  else if (mode == 12) { // hard light
    float R = (colorB[0] > 0.5) ? (1. - (1. - colorA[0]) * (1. - 2. * (colorB[0] - 0.5))) : colorA[0] * 2. * colorB[0];
    float G = (colorB[1] > 0.5) ? (1. - (1. - colorA[1]) * (1. - 2. * (colorB[1] - 0.5))) : colorA[1] * 2. * colorB[1];
    float B = (colorB[2] > 0.5) ? (1. - (1. - colorA[2]) * (1. - 2. * (colorB[2] - 0.5))) : colorA[2] * 2. * colorB[2];
    float A = (colorB[3] > 0.5) ? (1. - (1. - colorA[3]) * (1. - 2. * (colorB[3] - 0.5))) : colorA[3] * 2. * colorB[3];
    gl_FragColor = vec4(R, G, B, A) * brightness;
  }
  else if (mode == 13) { // vivid light
    float R = (colorB[0] > 0.5) ? colorA[0] / (1. - 2. * (colorB[0] - 0.5)) : (1. - (1. - colorA[0]) / (2. * colorB[0]));
    float G = (colorB[1] > 0.5) ? colorA[1] / (1. - 2. * (colorB[1] - 0.5)) : (1. - (1. - colorA[1]) / (2. * colorB[1]));
    float B = (colorB[2] > 0.5) ? colorA[2] / (1. - 2. * (colorB[2] - 0.5)) : (1. - (1. - colorA[2]) / (2. * colorB[2]));
    float A = (colorB[3] > 0.5) ? colorA[3] / (1. - 2. * (colorB[3] - 0.5)) : (1. - (1. - colorA[3]) / (2. * colorB[3]));
    gl_FragColor = vec4(R, G, B, A) * brightness;
  }
  else if (mode == 14) { // vivid light
    float R = (colorB[0] > 0.5) ? colorA[0] + 2. * (colorB[0] - 0.5) : (colorA[0] + 2. * colorB[0] - 1.);
    float G = (colorB[1] > 0.5) ? colorA[1] + 2. * (colorB[1] - 0.5) : (colorA[1] + 2. * colorB[1] - 1.);
    float B = (colorB[2] > 0.5) ? colorA[2] + 2. * (colorB[2] - 0.5) : (colorA[2] + 2. * colorB[2] - 1.);
    float A = (colorB[3] > 0.5) ? colorA[3] + 2. * (colorB[3] - 0.5) : (colorA[3] + 2. * colorB[3] - 1.);
    gl_FragColor = vec4(R, G, B, A) * brightness;
  }
  else if (mode == 15) { // pin light
    float R = (colorB[0] > 0.5) ? max(colorA[0], 2. * (colorB[0] - 0.5)) : min(colorA[0], 2. * colorB[0]);
    float G = (colorB[1] > 0.5) ? max(colorA[1], 2. * (colorB[1] - 0.5)) : min(colorA[1], 2. * colorB[1]);
    float B = (colorB[2] > 0.5) ? max(colorA[2], 2. * (colorB[2] - 0.5)) : min(colorA[2], 2. * colorB[2]);
    float A = (colorB[3] > 0.5) ? max(colorA[3], 2. * (colorB[3] - 0.5)) : min(colorA[3], 2. * colorB[3]);
    gl_FragColor = vec4(R, G, B, A) * brightness;    
  }
  else if (mode == 16) { // soft light photoshop
    float R = (colorB[0] < 0.5) ? 2. * colorA[0] * colorB[0] + colorA[0] * colorA[0] * (1. - 2. * colorB[0]) : 2. * colorA[0] * (1. - colorB[0]) + sqrt(colorA[0]) * (2. * colorB[0] - 1.);
    float G = (colorB[1] < 0.5) ? 2. * colorA[1] * colorB[1] + colorA[1] * colorA[1] * (1. - 2. * colorB[1]) : 2. * colorA[1] * (1. - colorB[1]) + sqrt(colorA[1]) * (2. * colorB[1] - 1.);
    float B = (colorB[2] < 0.5) ? 2. * colorA[2] * colorB[2] + colorA[2] * colorA[2] * (1. - 2. * colorB[2]) : 2. * colorA[2] * (1. - colorB[2]) + sqrt(colorA[2]) * (2. * colorB[2] - 1.);
    float A = (colorB[3] < 0.5) ? 2. * colorA[3] * colorB[3] + colorA[3] * colorA[3] * (1. - 2. * colorB[3]) : 2. * colorA[3] * (1. - colorB[3]) + sqrt(colorA[3]) * (2. * colorB[3] - 1.);
    gl_FragColor = vec4(R, G, B, A) * brightness;
  }
  else if (mode == 17) { // soft light pegtop
    gl_FragColor = ((1. - (2. * colorB)) * (colorA * colorA) + (2. * colorB * colorA)) * brightness;
  }
  else if (mode == 18) { // soft light illusions.hu
    float R = pow(colorA[0], pow(2., 2. * (0.5 - colorB[0])));
    float G = pow(colorA[1], pow(2., 2. * (0.5 - colorB[1])));
    float B = pow(colorA[2], pow(2., 2. * (0.5 - colorB[2])));
    float A = pow(colorA[3], pow(2., 2. * (0.5 - colorB[3])));
    gl_FragColor = vec4(R, G, B, A) * brightness;
  }
  else if (mode == 19) { // soft-light w3c
    float gRa = (colorA[0] <= 0.25) ? ((16. * colorA[0] - 12.) * colorA[0] + 4.) * colorA[0] : sqrt(colorA[0]); 
    float gGa = (colorA[1] <= 0.25) ? ((16. * colorA[1] - 12.) * colorA[1] + 4.) * colorA[1] : sqrt(colorA[1]); 
    float gBa = (colorA[2] <= 0.25) ? ((16. * colorA[2] - 12.) * colorA[2] + 4.) * colorA[2] : sqrt(colorA[2]); 
    float gAa = (colorA[3] <= 0.25) ? ((16. * colorA[3] - 12.) * colorA[3] + 4.) * colorA[3] : sqrt(colorA[3]);

    float R = (colorB[0] <= 0.5) ? colorA[0] - (1. - 2. * colorB[0]) * colorA[0] * (1. - colorA[0]) : colorA[0] + (2. * colorB[0] - 1.) * (gRa - colorA[0]);
    float G = (colorB[1] <= 0.5) ? colorA[1] - (1. - 2. * colorB[1]) * colorA[1] * (1. - colorA[1]) : colorA[1] + (2. * colorB[1] - 1.) * (gGa - colorA[1]);
    float B = (colorB[2] <= 0.5) ? colorA[2] - (1. - 2. * colorB[2]) * colorA[2] * (1. - colorA[2]) : colorA[2] + (2. * colorB[2] - 1.) * (gBa - colorA[2]);
    float A = (colorB[3] <= 0.5) ? colorA[3] - (1. - 2. * colorB[3]) * colorA[3] * (1. - colorA[3]) : colorA[3] + (2. * colorB[3] - 1.) * (gAa - colorA[3]);

    gl_FragColor = vec4(R, G, B, A) * brightness;

  }
  // http://www.deepskycolors.com/archivo/2010/04/21/formulas-for-Photoshop-blending-modes.html
}

```

{{</details >}}