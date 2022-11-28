---
title: Texturing
weight: 2
---
## Exercise
1. Implement other coloring brightness tools such as HSV value V, HSL lightness L or Component average.
2. Implement texture tinting by mixing color and texel interpolated data.

## Brightness & Tinting

El ejercicio se compone de dos partes: La primera consiste en la visualización de la iluminación de la imagen y la segunda es la aplicación de tinting sobre la imagen utilizando diferentes blending modes.

La iluminación se implementó con un brightness shader usando las siguientes cuatro métricas: luma, value (HSV), lightness (HSL) e intensidad (HSI).

Para cada texel se calcula la métrica indicada y ese valor (normalizado [0..1]) se aplica sobre un vector vec4 en el shader para pintar cada pixel, de manera que la visualización es en escala de grises. 

Para el tinting, desde el sketch, se dibuja un rectángulo sobre la imagen cargada. Cada uno de los cuatro vertices tiene un color asociado que puede ser seleccionado por el usuario. Estos valores le sirven al vertex shader para hacer la interpolación de los colores de los pixeles de todo el rectángulo.

El tinting shader recibe interpoladas las coordernadas de la imagen cargada (texcoords2) y el color (color4) interpolado desde el vertex shader. Con esas dos variables, el tinting shader aplica el blending mode seleccionado. El color A es el color del texel cuyas coordenadas son texcoords2 y el color B es el color que llegó interpolado desde el vertex shader.

Al aplicar la operación texel a texel, el color resultante se va pintando, y la imagen queda tinturada con el blending mode aplicado.

Los blending modes aplicados son los mismos vistos en **Coloring**.

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Checkbox Default Video**: marcar para usar el video por defecto, desmarcar para usar la imagen por defecto
* **Select**: selecciona entre original, luma, value, lightness, intensity o tinting
* **Select (Blending Mode)**: selecciona el blending mode que desea utilizar (visible cuando se selecciona tinting)
* **Slider**: controla el brillo (visible cuando se selecciona tinting)
* **Color Pickers**: para seleccionar los colores que se aplicarán en el tinting


{{< p5-iframe sketch="/VisualComputing/sketches/shaders/BrightnessTinting/brightness.js" width="800" height="650" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js">}}

{{<details "Sketch Code">}}

``` js

let brightnessShader;
let tintingShader;
let img;
let input;
let mode;
let lmselect; // lightness mode select

let colorA;
let colorB;
let colorC;
let colorD;

let cpcikerA;
let cpcikerB;
let cpcikerC;
let cpcikerD;

let bmselect; // blending mode select
let bmode;

let bslider; // brightness slider

let video_on;

function preload() {

  brightnessShader = readShader('/VisualComputing/docs/shaders/fragments/brightness.frag', { varyings: Tree.texcoords2 });
  tintingShader = readShader('/VisualComputing/docs/shaders/fragments/tinting.frag', { varyings: [Tree.texcoords2 | Tree.color4] });

}

function setup() {

  createCanvas(700, 500, WEBGL);
  noStroke();
  textureMode(NORMAL);

  lmselect = createSelect();
  lmselect.position(10, 10);
  lmselect.option('original', 0);
  lmselect.option('luma', 1);
  lmselect.option('value', 2);
  lmselect.option('lightness', 3);
  lmselect.option('intensity', 4);
  lmselect.option('tinting', 5);
  lmselect.selected('original');

  img = loadImage('/VisualComputing/docs/shaders/resources/fire_breathing.png');
  input = createFileInput(handleFile);

  colorA = "red";
  colorB = "green";
  colorC = "blue";
  colorD = "yellow";

  cpickerA = createColorPicker(colorA);
  cpickerA.position(20, 40);
  cpickerA.hide();

  cpickerB = createColorPicker(colorB);
  cpickerB.position(640, 40);
  cpickerB.hide();

  cpickerC = createColorPicker(colorC);
  cpickerC.position(20, 440);
  cpickerC.hide();

  cpickerD = createColorPicker(colorD);
  cpickerD.position(640, 440);
  cpickerD.hide();

  bslider = createSlider(0, 1, 1, 0.05);
  bslider.position(280, 10);
  bslider.style('width', '80px');
  bslider.hide();

  bmselect = createSelect();
  bmselect.position(100, 10);
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

  bmselect.hide();

  video_on = createCheckbox('default video', false);
  video_on.changed(() => {
    if (video_on.checked()) {
      img = createVideo(['/VisualComputing/docs/shaders/resources/video0.mp4']);
      img.hide();
      img.loop();
    } else {
      img = loadImage('/VisualComputing/docs/shaders/resources/fire_breathing.png');
      img.hide();
      img.pause();
    }
    blendShader.setUniform('texture', img);
    tintingShader.setUniform('texture', img);
  })

}

function draw() {
  background(0);

  image(img, 0, 0, 700, 500); 
  
  mode = lmselect.value()

  if (mode == 5) {

    cpickerA.show();
    colorA = cpickerA.color()

    cpickerB.show();
    colorB = cpickerB.color()
  
    cpickerC.show();
    colorC = cpickerC.color()

    cpickerD.show();
    colorD = cpickerD.color()

    bmselect.show();
    bmode = bmselect.value();

    bslider.show();
    brightness = bslider.value();

    shader(tintingShader);

    beginShape();
    fill(colorA);
    vertex(-width / 2, -height / 2);
    fill(colorB);
    vertex(width / 2, -height / 2);
    fill(colorC);
    vertex(width / 2, height / 2);
    fill(colorD);
    vertex(-width / 2, height / 2);
    endShape();
  
    tintingShader.setUniform('brightness', brightness); 
    tintingShader.setUniform('mode', bmode); 
    tintingShader.setUniform('texture', img);

  } 
  else {

    cpickerA.hide();
    cpickerB.hide();
    cpickerC.hide();
    cpickerD.hide();
    bmselect.hide();
    bslider.hide();

    shader(brightnessShader);

    brightnessShader.setUniform('texture', img);
    brightnessShader.setUniform('mode', mode);
  }

  quad(-width / 2, -height / 2, width / 2, -height / 2, width / 2, height / 2, -width / 2, height / 2);

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

function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

```
{{</details >}}

{{<details "Brightness Shader">}}

```glsl
precision mediump float;

uniform int mode;
uniform sampler2D texture;

varying vec2 texcoords2;

float luma(vec3 texel) {
    return 0.299 * texel.r + 0.587 * texel.g + 0.114 * texel.b;
}

float value(vec3 texel) {
    return max(texel.r, max(texel.g, texel.b));
}

float lightness(vec3 texel) {
    float M = max(texel.r, max(texel.g, texel.b));
    float m = min(texel.r, min(texel.g, texel.b));
    return 0.5 * (M + m);
}

float intensity(vec3 texel) {
    return (1. / 3.) * (texel.r + texel.g + texel.b);
}

void main() {

    vec4 texel = texture2D(texture, texcoords2);

    if (mode == 1) {
        gl_FragColor = vec4((vec3(luma(texel.rgb))), 1.0);
    }
    else if (mode == 2) {
        gl_FragColor = vec4((vec3(value(texel.rgb))), 1.0);
    }
    else if (mode == 3) {
        gl_FragColor = vec4((vec3(lightness(texel.rgb))), 1.0);
    }
    else if (mode == 4) {
        gl_FragColor = vec4((vec3(intensity(texel.rgb))), 1.0);
    }
    else {
        gl_FragColor = texel;
    }
}
```

{{</details >}}

{{<details "Tinting Shader">}}

```glsl
precision mediump float;

uniform sampler2D texture;
uniform int mode;
uniform float brightness;

varying vec2 texcoords2;
varying vec4 color4;


void main() {

    vec4 texel = texture2D(texture, texcoords2);
    vec4 colorA = texel;
    vec4 colorB = color4;

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
}
```

{{</details >}}