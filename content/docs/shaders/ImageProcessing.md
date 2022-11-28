---
title: Image Processing
weight: 3
---
## Exercise
Implement an image / video processing app supporting different masks, including other kernel sizes different than 3x3, and:

* A region-of-interest base tool to selectively apply a given mask.Hint: circular regions around the mouse pointer are handy and quite simple to implement by means of glsl distance.
* A magnifier tool. Requires a bit of research. For instance, look for it in shadertoy.
* Integrate luma and other coloring brightness tools.

## Image Processing

En esta aplicación se utilizan cuatro shaders. Uno para el masking, otro para el magnifier y el de iluminación y tinturado ya vistos en **Texturing**.

El masking se implementó para matrices 3x3 y 5x5. 

El shader recibe cada texel y para cada uno de ellos obtiene el color y el de sus vecinos. Los vecinos dependen de si la convolución es 3x3 o 5x5. Se realiza la suma ponderada y se aplica el resultado como color del texel.

En esta implementación, para la convolución 3x3 se requieren al menos 9 declaraciones para calcular las coordenadas y los colores de los vecinos, mientras que para la convolución 5x5 se requieren al menos 25 declaraciones. Por esta razón se omitieron convoluciones mayores (7x7, 9x9, etc.).

La región de interés también es implementada en el shader de las convoluciones. Se utiliza el valor de un radio definido por el usuario, y se aplica la convolución solo a los texeles dentro del alcance de ese radio. Cuando no se selecciona región de interés se sigue usando un radio, pero muy grande de manera que el usuario vea la convolución aplicada a toda la imagen.

El usuario tiene la posibilidad de ingresar los valores de una matriz de convolución 3x3 o 5x5 que conozca, utilizando una lista de inputs que se habilitan cuando selecciona la máscara: user defined.

La implementación del magnifier fue tomada de [magnifier (Shadertoy)](https://www.shadertoy.com/view/llsSz7). El código se modificó parcialmente para que fuera compatible con GLSL, por ejemplo, eliminando los parámetros out, in. Cambiando el nombre de las variables FragCoord y FragColor a gl_FragCoord y gl_FragColor. Y agregando las declaraciones u_mouse y u_resolution. La variable iChannel se cambió a texture. El radio y la profundidad fueron hechos parámetros controlados desde el sketch.

Las funcionalidades de brightness y tinting son implementadas usando los shaders ya vistos en **Texturing**.

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Checkbox Default Video**: marcar para usar el video por defecto, desmarcar para usar la imagen por defecto
* **Select 3x3, 5x5**: para indicar el tamaño de la convolución
* **Select (Mask)**: selecciona el kernel o máscara de convolución
* **Select (función)**: Seleccion masks (para ver convolución en toda la imagen), region of interest (para ver la convolución en la región de interés definida), magnifier, brightness y tinting.
* **Slider (radio región de interés)**: para cambiar el radio de la región de interés
* **Slider (radio magnifier)**: para cambiar el radio del magnifier
* **Slider (profundidad magnifier)**: para cambiar la profundidad del magnifier
* **Select (brightness)**: para seleccionar el modo de iluminación: luma, value, lightness, intensity
* **Slider (brightness)**: controla el brillo (visible cuando se selecciona tinting)
* **Color Pickers**: para seleccionar los colores que se aplicarán en el tinting
* **Inputs (user defined convolution)**: lista de inputs numéricos para que el usuario ingrese matriz de convolución.

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/ImageProcessing/imgprocessing.js" width="750" height="700" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js">}}

{{<details "Sketch Code">}}

``` js

let maskShader;
let magnifierShader;
let brightnessShader;
let tintingShader;

let img;
let input;
let kselect; // kernel select
let mask3;
let mask5;

let r0c0;
let r0c1;
let r0c2;
let r0c3;
let r0c4;
let r1c0;
let r1c1;
let r1c2;
let r1c3;
let r1c4;
let r2c0;
let r2c1;
let r2c2;
let r2c3;
let r2c4;
let r3c0;
let r3c1;
let r3c2;
let r3c3;
let r3c4;
let r4c0;
let r4c1;
let r4c2;
let r4c3;
let r4c4;

let cells3;
let cells5;

let ksselect; // kernel size select
let ksize; // kernel size

let roiradius; // region-of-interest radius
let mradius; // magnifier radius
let rslider; // radius slider
let dslider; // depth slider

let modeselect; 
let mode;

let lmselect; // lightning mode select

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
let bslider;

let video_on;

function preload() {
  maskShader = readShader('/VisualComputing/docs/shaders/fragments/mask.frag', { varyings: Tree.texcoords2 });
  magnifierShader = readShader('/VisualComputing/docs/shaders/fragments/magnifier.frag', { varyings: Tree.texcoords2 });
  brightnessShader = readShader('/VisualComputing/docs/shaders/fragments/brightness.frag', { varyings: Tree.texcoords2 });
  tintingShader = readShader('/VisualComputing/docs/shaders/fragments/tinting.frag', { varyings: [Tree.texcoords2 | Tree.color4] });
}

function setup() {
  createCanvas(700, 500, WEBGL);
  noStroke();
  textureMode(NORMAL);

  ksselect = createSelect();
  ksselect.position(20, 10);
  ksselect.option('3x3', 3);
  ksselect.option('5x5', 5);
  ksselect.selected('3x3');

  kselect = createSelect();
  kselect.position(100, 10);
  kselect.option('identity', 0);
  kselect.option('ridges', 1);
  kselect.option('sharpen', 2);
  kselect.option('blur', 3);
  kselect.option('top sobel', 4);
  kselect.option('right sobel', 5);
  kselect.option('bottom sobel', 6);
  kselect.option('left sobel', 7);
  kselect.option('emboss', 8);
  kselect.option('user defined', 9);
  kselect.selected('identity');
  
  img = loadImage('/VisualComputing/docs/shaders/resources/download.png');
  input = createFileInput(handleFile);

  r0c0 = createInput('', 'number');
  r0c1 = createInput('', 'number');
  r0c2 = createInput('', 'number');
  r0c3 = createInput('', 'number');
  r0c4 = createInput('', 'number');
  r1c0 = createInput('', 'number');
  r1c1 = createInput('', 'number');
  r1c2 = createInput('', 'number');
  r1c3 = createInput('', 'number');
  r1c4 = createInput('', 'number');
  r2c0 = createInput('', 'number');
  r2c1 = createInput('', 'number');
  r2c2 = createInput('', 'number');
  r2c3 = createInput('', 'number');
  r2c4 = createInput('', 'number');
  r3c0 = createInput('', 'number');
  r3c1 = createInput('', 'number');
  r3c2 = createInput('', 'number');
  r3c3 = createInput('', 'number');
  r3c4 = createInput('', 'number');
  r4c0 = createInput('', 'number');
  r4c1 = createInput('', 'number');
  r4c2 = createInput('', 'number');
  r4c3 = createInput('', 'number');
  r4c4 = createInput('', 'number');

  cells3 = [r0c0, r0c1, r0c2, r1c0, r1c1, r1c2, r2c0, r2c1, r2c2];
  cells5 = [r0c0, r0c1, r0c2, r0c3, r0c4,
            r1c0, r1c1, r1c2, r1c3, r1c4,
            r2c0, r2c1, r2c2, r2c3, r2c4,
            r3c0, r3c1, r3c2, r3c3, r3c4,
            r4c0, r4c1, r4c2, r4c3, r4c4]

  cells3.forEach((cell) => {
    cell.hide();
  })
  cells5.forEach((cell) => {
    cell.hide();
  })

  roirslider = createSlider(0, 1, 0.3, 0.05);
  roirslider.position(400, 10);
  roirslider.style('width', '120px');

  mrslider = createSlider(0, 3, 1.5, 0.05);
  mrslider.position(400, 10);
  mrslider.style('width', '120px');

  dslider = createSlider(0, 2, 1, 0.05);
  dslider.position(550, 10);
  dslider.style('width', '120px');

  modeselect = createSelect();
  modeselect.position(240, 10);
  modeselect.option('masks', 0);
  modeselect.option('region-of-interest', 1);
  modeselect.option('magnifier', 2);
  modeselect.option('brightness', 3);
  modeselect.option('tinting', 4);
  modeselect.selected('normal');

  lmselect = createSelect();
  lmselect.position(10, 10);
  lmselect.option('original', 0);
  lmselect.option('luma', 1);
  lmselect.option('value', 2);
  lmselect.option('lightness', 3);
  lmselect.option('intensity', 4);
  lmselect.selected('original');
  lmselect.hide();

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
  bslider.position(400, 10);
  bslider.style('width', '80px');
  bslider.hide();

  bmselect = createSelect();
  bmselect.position(10, 10);
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
      img = createVideo(['/VisualComputing/docs/shaders/resources/video1.mp4']);
      img.hide();
      img.loop();
    } else {
      img = loadImage('/VisualComputing/docs/shaders/resources/download.png');
      img.hide();
      img.pause();
    }
    maskShader.setUniform('texture', img);
    magnifierShader.setUniform('texture', img);
    brightnessShader.setUniform('texture', img);
    tintingShader.setUniform('texture', img);
  })


}

function draw() {
  background(0);
  image(img, 0, 0, 700, 500); 

  skernel = kselect.value(); // selected kernel
  ksize = ksselect.value(); // kernel size
  mode = modeselect.value();
  if (mode == 0) {

    shader(maskShader);

    cpickerA.hide();
    cpickerB.hide();
    cpickerC.hide();
    cpickerD.hide();
    bmselect.hide();
    bslider.hide();
    ksselect.show();
    kselect.show();
    lmselect.hide();
    roirslider.hide();
    dslider.hide();
    mrslider.hide();
    roiradius = 100;
  }
  else if (mode == 1) {

    shader(maskShader);

    cpickerA.hide();
    cpickerB.hide();
    cpickerC.hide();
    cpickerD.hide();
    bmselect.hide();
    bslider.hide();
    ksselect.show();
    kselect.show();
    lmselect.hide();
    roirslider.show();
    dslider.hide();
    mrslider.hide();
    roiradius = roirslider.value();
  }
  else if (mode == 2) {

    shader(magnifierShader);

    cpickerA.hide();
    cpickerB.hide();
    cpickerC.hide();
    cpickerD.hide();
    bmselect.hide();
    bslider.hide();
    ksselect.hide();
    kselect.hide();
    lmselect.hide();
    roirslider.hide();
    dslider.show();
    mrslider.show();

    mradius = mrslider.value();
    depth = dslider.value();
  
    magnifierShader.setUniform('texture', img);
    magnifierShader.setUniform('mradius', mradius);
    magnifierShader.setUniform('depth', depth);
    emitMousePosition(magnifierShader, [uniform = 'mouse']);
    emitResolution(magnifierShader, [uniform = 'resolution']);

  }
  else if (mode == 3) {
    cpickerA.hide();
    cpickerB.hide();
    cpickerC.hide();
    cpickerD.hide();
    bmselect.hide();
    bslider.hide();
    ksselect.hide();
    kselect.hide();
    lmselect.show();
    roirslider.hide();
    dslider.hide();
    mrslider.hide();

    shader(brightnessShader);

    brightnessShader.setUniform('texture', img);
    brightnessShader.setUniform('mode', lmselect.value());
  }
  else if (mode == 4) {

    ksselect.hide();
    kselect.hide();
    lmselect.hide();
    roirslider.hide();
    dslider.hide();
    mrslider.hide();

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

  maskShader.setUniform('texture', img);
  maskShader.setUniform('texOffset', [1 / img.width, 1 / img.height]);
  maskShader.setUniform('ksize', ksize);
  maskShader.setUniform('roiradius', roiradius);
  maskShader.setUniform('mode', mode);
  emitMousePosition(maskShader, [uniform = 'mouse']);
  emitResolution(maskShader, [uniform = 'resolution']);

  if (skernel == 9) {
    if (ksize == 3) {
      cells5.forEach((cell) => {
        cell.hide();
      })
      cells3.forEach((cell) => {
        cell.show();
      })
    }
    else if (ksize == 5) {
      cells3.forEach((cell) => {
        cell.hide();
      })
      cells5.forEach((cell) => {
        cell.show();
      })
    }
    mask3 = [r0c0.value(), r0c1.value(), r0c2.value(), r1c0.value(), r1c1.value(), r1c2.value(), r2c0.value(), r2c1.value(), r2c2.value()]
    mask5 = [r0c0.value(), r0c1.value(), r0c2.value(), r0c3.value(), r0c4.value(),
             r1c0.value(), r1c1.value(), r1c2.value(), r1c3.value(), r1c4.value(),
             r2c0.value(), r2c1.value(), r2c2.value(), r2c3.value(), r2c4.value(),
             r3c0.value(), r3c1.value(), r3c2.value(), r3c3.value(), r3c4.value(),
             r4c0.value(), r4c1.value(), r4c2.value(), r4c3.value(), r4c4.value(),]
  }
  else {
    cells3.forEach((cell) => {
      cell.hide();
    })
    cells5.forEach((cell) => {
      cell.hide();
    })

    if (skernel == 0) { // identity
      mask3 = [0, 0, 0, 0, 1, 0, 0, 0, 0];
      mask5 = [0, 0, 0, 0, 0, 
               0, 0, 0, 0, 0, 
               0, 0, 1, 0, 0, 
               0, 0, 0, 0, 0, 
               0, 0, 0, 0, 0]
    }
    else if (skernel == 1) { // ridges
      mask3 = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
      mask5 = [-1, -1, -1, -1, -1, 
               -1, 1, 1, 1, -1, 
               -1, 1, 8, 1, -1, 
               -1, 1, 1, 1, -1, 
               -1, -1, -1, -1, -1];
    }
    else if (skernel == 2) { // sharpen
      mask3 = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      mask5 = [0, 0, -1, 0, 0,
               0, -1, 1, -1, 0,
              -1, 1, 5, 1, -1,
               0, -1, 1, -1, 0,
               0, 0, -1, 0, 0];
    }
    else if (skernel == 3) { // blur
      mask3 = [0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625];
      // https://en.wikipedia.org/wiki/Kernel_(image_processing)
      mask5 = [1/256, 4/256, 6/256, 4/256, 1/256,
               4/256, 16/256, 24/256, 16/256, 4/256,
               6/256, 24/256, 36/256, 24/256, 6/256,
               4/256, 16/256, 24/256, 16/256, 4/256,
               1/256, 4/256, 6/256, 4/256, 1/256];
    }
    else if (skernel == 4) { // top sobel
      mask3 = [1, 2, 1, 0, 0, 0, -1, -2, -1];
      // https://www.researchgate.net/figure/Sobel-convolution-kernels5x5_fig1_49619233
      mask5 = [2, 2, 4, 2, 2, 
               1, 1, 2, 1, 1,
               0, 0, 0, 0, 0,
               -1, -1, -2, -1, -1,
               -2, -2, -4, -2, -2];
    }
    else if (skernel == 5) { // right sobel
      mask3 = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      mask5 = [-2, -1, 0, 1, 2, 
               -2, -1, 0, 1, 2, 
               -4, -2, 0, 2, 4,
               -2, -1, 0, 1, 2, 
               -2, -1, 0, 1, 2,];
    }
    else if (skernel == 6) { // bottom sobel
      mask3 = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
      mask5 = [-2, -2, -4, -2, -2, 
               -1, -1, -2, -1, -1,
                0, 0, 0, 0, 0,
                1, 1, 2, 1, 1,
                2, 2, 4, 2, 2];
    }
    else if (skernel == 7) { // left sobel
      mask3 = [1, 0, -1, 2, 0, -2, 1, 0, -1];
      mask5 = [2, 1, 0, -1, -2, 
               2, 1, 0, -1, -2, 
               4, 2, 0, -2, -4,
               2, 1, 0, -1, -2, 
               2, 1, 0, -1, -2,];
    }
    else if (skernel == 8) { // emboss
      mask3 = [-2, -1, 0, -1, 1, 1, 0, 1, 2]
      // https://stackoverflow.com/questions/61297368/what-is-the-5x5-equivalent-of-the-3x3-emboss-kernel
      mask5 = [-2, 0, -1, 0, 0,
                0, -2, -1, 0, 0,
                -1, -1, 1, 1, 1,
                0, 0, 1, 2, 0,
                0, 0, 1, 0, 2];
    }
  }

  if (ksize == 3) {
    maskShader.setUniform('mask3', mask3);
  }
  else if (ksize == 5) {
    maskShader.setUniform('mask5', mask5);
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

```
{{</details >}}

{{<details "Mask Shader Code">}}
```glsl
precision mediump float;

uniform sampler2D texture;
uniform vec2 texOffset;
uniform float mask3[9];
uniform float mask5[25];
uniform int ksize; // kernel size
varying vec2 texcoords2;
uniform float roiradius;
uniform float mradius;
uniform vec2 mouse;
uniform vec2 resolution;
uniform int mode;
uniform float depth;

void main() {

    vec2 st = gl_FragCoord.xy / resolution;
    vec2 center = mouse.xy / resolution;

    vec4 texel = texture2D(texture, texcoords2);

    vec4 convolution;

    if (ksize == 3) {
        // col 0
        vec2 tc0 = texcoords2 + vec2(-texOffset.s, -texOffset.t);
        vec2 tc1 = texcoords2 + vec2(         0.0, -texOffset.t);
        vec2 tc2 = texcoords2 + vec2(+texOffset.s, -texOffset.t);
        // col 1
        vec2 tc3 = texcoords2 + vec2(-texOffset.s,          0.0);
        vec2 tc4 = texcoords2 + vec2(         0.0,          0.0);
        vec2 tc5 = texcoords2 + vec2(+texOffset.s,          0.0);
        // col 2
        vec2 tc6 = texcoords2 + vec2(-texOffset.s, +texOffset.t);
        vec2 tc7 = texcoords2 + vec2(         0.0, +texOffset.t);
        vec2 tc8 = texcoords2 + vec2(+texOffset.s, +texOffset.t);

        vec4 rgba[9];
        rgba[0] = texture2D(texture, tc0);
        rgba[1] = texture2D(texture, tc1);
        rgba[2] = texture2D(texture, tc2);
        rgba[3] = texture2D(texture, tc3);
        rgba[4] = texture2D(texture, tc4);
        rgba[5] = texture2D(texture, tc5);
        rgba[6] = texture2D(texture, tc6);
        rgba[7] = texture2D(texture, tc7);
        rgba[8] = texture2D(texture, tc8);

        for (int i = 0; i < 9; i++) {
            convolution += rgba[i] * mask3[i];
        }
    }
    else if (ksize == 5) {
        // row 0
        vec2 tc0 = texcoords2 + vec2(- 2. * texOffset.s, - 2. * texOffset.t);
        vec2 tc1 = texcoords2 + vec2(- 2. * texOffset.s, - 1. * texOffset.t);
        vec2 tc2 = texcoords2 + vec2(- 2. * texOffset.s,   0. * texOffset.t);
        vec2 tc3 = texcoords2 + vec2(- 2. * texOffset.s, + 1. * texOffset.t);
        vec2 tc4 = texcoords2 + vec2(- 2. * texOffset.s, + 2. * texOffset.t);
        // row 1
        vec2 tc5 = texcoords2 + vec2(- 1. * texOffset.s, - 2. * texOffset.t);
        vec2 tc6 = texcoords2 + vec2(- 1. * texOffset.s, - 1. * texOffset.t);
        vec2 tc7 = texcoords2 + vec2(- 1. * texOffset.s,   0. * texOffset.t);
        vec2 tc8 = texcoords2 + vec2(- 1. * texOffset.s, + 1. * texOffset.t);
        vec2 tc9 = texcoords2 + vec2(- 1. * texOffset.s, + 2. * texOffset.t);
        // row 2
        vec2 tc10 = texcoords2 + vec2(0. * texOffset.s, - 2. * texOffset.t);
        vec2 tc11 = texcoords2 + vec2(0. * texOffset.s, - 1. * texOffset.t);
        vec2 tc12 = texcoords2 + vec2(0. * texOffset.s,   0. * texOffset.t);
        vec2 tc13 = texcoords2 + vec2(0. * texOffset.s, + 1. * texOffset.t);
        vec2 tc14 = texcoords2 + vec2(0. * texOffset.s, + 2. * texOffset.t);
        // row 3
        vec2 tc15 = texcoords2 + vec2(+ 1. * texOffset.s, - 2. * texOffset.t);
        vec2 tc16 = texcoords2 + vec2(+ 1. * texOffset.s, - 1. * texOffset.t);
        vec2 tc17 = texcoords2 + vec2(+ 1. * texOffset.s,   0. * texOffset.t);
        vec2 tc18 = texcoords2 + vec2(+ 1. * texOffset.s, + 1. * texOffset.t);
        vec2 tc19 = texcoords2 + vec2(+ 1. * texOffset.s, + 2. * texOffset.t);
        // row 4
        vec2 tc20 = texcoords2 + vec2(+ 2. * texOffset.s, - 2. * texOffset.t);
        vec2 tc21 = texcoords2 + vec2(+ 2. * texOffset.s, - 1. * texOffset.t);
        vec2 tc22 = texcoords2 + vec2(+ 2. * texOffset.s,   0. * texOffset.t);
        vec2 tc23 = texcoords2 + vec2(+ 2. * texOffset.s, + 1. * texOffset.t);
        vec2 tc24 = texcoords2 + vec2(+ 2. * texOffset.s, + 2. * texOffset.t);

        vec4 rgba[25];
        rgba[0] = texture2D(texture, tc0);
        rgba[1] = texture2D(texture, tc1);
        rgba[2] = texture2D(texture, tc2);
        rgba[3] = texture2D(texture, tc3);
        rgba[4] = texture2D(texture, tc4);
        rgba[5] = texture2D(texture, tc5);
        rgba[6] = texture2D(texture, tc6);
        rgba[7] = texture2D(texture, tc7);
        rgba[8] = texture2D(texture, tc8);
        rgba[9] = texture2D(texture, tc9);
        rgba[10] = texture2D(texture, tc10);
        rgba[11] = texture2D(texture, tc11);
        rgba[12] = texture2D(texture, tc12);
        rgba[13] = texture2D(texture, tc13);
        rgba[14] = texture2D(texture, tc14);
        rgba[15] = texture2D(texture, tc15);
        rgba[16] = texture2D(texture, tc16);
        rgba[17] = texture2D(texture, tc17);
        rgba[18] = texture2D(texture, tc18);
        rgba[19] = texture2D(texture, tc19);
        rgba[20] = texture2D(texture, tc20);
        rgba[21] = texture2D(texture, tc21);
        rgba[22] = texture2D(texture, tc22);
        rgba[23] = texture2D(texture, tc23);
        rgba[24] = texture2D(texture, tc24);

        for (int i = 0; i < 25; i++) {
            convolution += rgba[i] * mask5[i];
        }
    }

    gl_FragColor = (distance(st, center) < roiradius) ? vec4(convolution.rgb, 1.0) : texel; 
    
}
```
{{</details >}}

{{<details "Magnifier Shader Code">}}
```glsl
precision mediump float;

uniform sampler2D texture;
varying vec2 texcoords2;
uniform float mradius;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float depth;

void main() {

    // https://www.shadertoy.com/view/llsSz7
    
    vec2 uv = texcoords2.xy;
    vec2 center = vec2(mouse.x, 500. - mouse.y) / resolution.xy;
    float ax = ((uv.x - center.x) * (uv.x - center.x)) / (0.25 * 0.25) + ((uv.y - center.y) * (uv.y - center.y)) / (0.25 / (resolution.x / resolution.y));
    float dx = 0.0 + (- depth / mradius) * ax + (depth / (mradius * mradius)) * ax * ax;
    float f =  (ax + dx);
    if (ax > mradius) f = ax;

    vec2 magnifierArea = center + (uv - center) * f / ax;

    gl_FragColor = texture2D(texture, magnifierArea); 

}
```
{{</details >}}