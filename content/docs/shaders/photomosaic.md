---
title: Photomosaic
weight: 7
---
## Exercise
Implement a mosaic (or/and ascii art) visual application.

## Images Photomosaic

En esta aplicación, se usa el mismo mecanismo de pixelación visto en **Spatial Coherence** con la diferencia de que cada pixel de baja resolución es mapeado a una imagen. El shader recibe una imagen que contiene todas las imágenees del dataset que compondrán el mosaico. Estas imágenes están ordenadas siguiendo alguna métrica, que en nuestro caso es el luma. El shader calcula el color del pixel de baja resolución para texel. A ese color le calcula el luma. Este luma obtenido le indica a la función **texture2D**, qué tanto se debe desplazar horizontalmente hacia la derecha desde el extremo izquierdo para obtener así la coordenada x de la imagen que se quiere dibujar en esa sección (es decir, dónde empieza la imagen en el buffer recibido). 

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Checkbox Default Video**: marcar para usar el video por defecto, desmarcar para usar la imagen por defecto
* **Slider**: define la resolución (por defecto 30, es decir 30 pixeles de baja resolución que en este caso serán imágenes del mosaico por cada lado de la cuadrícula). El mínimo valor es 1 y el máximo 150. Una resolución mayor, implica más pixeles, y por tanto, de menor tamaño cada vez. El tamaño de la cuadrícula es de 600px x 600px  por lo que una resolución de 150 implica pixeles de baja resolución de dimensiones 4px x 4px.
* **Select**: para decidir si ver la imagen pixelada (keys), la original o el mosaico.
* **Input**: ingrese un número entre 1 y 30 para escoger una imagen del dataset. El dataset se muestra en orden abajo de esta aplicación. Observe por ejemplo que panda rojo le corresponde el número 7. Una vez ingresado un número puede usar las flechas de su teclado para cambiar de imagen, siempre que el foco esté sobre el input.

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/Photomosaic/photomosaic.js" width="650" height="750" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/objetos/p5.quadrille.js/p5.quadrille.js">}}

## Dataset

<img src="/VisualComputing/docs/shaders/resources/dataset/1.jpg" alt="1" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/2.jpg" alt="2" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/3.jpg" alt="3" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/4.jpg" alt="4" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/5.jpg" alt="5" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/6.jpg" alt="6" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/7.jpg" alt="7" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/8.jpg" alt="8" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/9.jpg" alt="9" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/10.jpg" alt="10" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/11.jpg" alt="11" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/12.jpg" alt="12" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/13.jpg" alt="13" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/14.jpg" alt="14" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/15.jpg" alt="15" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/16.jpg" alt="16" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/17.jpg" alt="17" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/18.jpg" alt="18" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/19.jpg" alt="19" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/20.jpg" alt="20" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/21.jpg" alt="21" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/22.jpg" alt="22" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/23.jpg" alt="23" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/24.jpg" alt="24" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/25.jpg" alt="25" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/26.jpg" alt="26" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/27.jpg" alt="27" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/28.jpg" alt="28" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/29.jpg" alt="29" width="150"/>
<img src="/VisualComputing/docs/shaders/resources/dataset/30.jpg" alt="30" width="150"/>

{{<details "Sketch Code">}}

``` js
'use strict';

let img;
let photomosaicShader;

let resolution;
let mode;

let input;

let dataset = [];

let palette;
let pg;

let imgcode;

let video_on;

const SAMPLE_RES = 30;

function preload() {
  img = loadImage(`/VisualComputing/docs/shaders/resources/dataset/${int(random(1, 31))}.jpg`);
  for (let i = 1; i <= 30; i++) {
    dataset.push(loadImage(`/VisualComputing/docs/shaders/resources/dataset/${i}.jpg`));
  }
  photomosaicShader = readShader('/VisualComputing/docs/shaders/fragments/photomosaic.frag', { matrices: Tree.NONE, varyings: Tree.texcoords2 });
}

function setup() {
  createCanvas(600, 600, WEBGL);
  textureMode(NORMAL);
  noStroke();
  shader(photomosaicShader);
  resolution = createSlider(1, 150, 100, 1);
  resolution.position(100, 10);
  resolution.style('width', '150px');
  resolution.input(() => photomosaicShader.setUniform('resolution', resolution.value()));
  photomosaicShader.setUniform('resolution', resolution.value());
  mode = createSelect();
  mode.position(10, 10);
  mode.option('original');
  mode.option('keys');
  mode.option('photomosaic');
  mode.selected('photomosaic');
  mode.changed(() => {
    if (mode.value() == 'original')
        resolution.hide();
    else
        resolution.show();
    photomosaicShader.setUniform('original', mode.value() === 'original');
    photomosaicShader.setUniform('keys', mode.value() === 'keys');
  });
  input = createFileInput(handleFile);
  imgcode = createInput('', 'number');
  palette = createQuadrille(dataset);
  console.log(palette.height)
  pg = createGraphics(SAMPLE_RES * palette.width, SAMPLE_RES);
  photomosaicShader.setUniform('n', palette.width);
  sample();

  video_on = createCheckbox('default video', false);
  video_on.changed(() => {
    if (video_on.checked()) {
      img = createVideo(['/VisualComputing/docs/shaders/resources/video2.mp4']);
      img.hide();
      img.loop();
    } else {
      img = loadImage(`/VisualComputing/docs/shaders/resources/dataset/${int(random(1, 31))}.jpg`);
      img.hide();
      img.pause();
    }
    photomosaicShader.setUniform('source', img);
  })

}

function draw() {

  if (imgcode.value() != '') {
    img = dataset[(parseInt(imgcode.value()) - 1) % dataset.length];
  }

  if (img != null) {

    image(img, 0, 0, 600, 600); 

    photomosaicShader.setUniform('source', img);

    beginShape();
    vertex(-1, -1, 0, 0, 1);
    vertex(1, -1, 0, 1, 1);
    vertex(1, 1, 0, 1, 0);
    vertex(-1, 1, 0, 0, 0);
    endShape();
  }
}

function sample() {
  if (pg.width !== SAMPLE_RES * palette.width) {
    pg = createGraphics(SAMPLE_RES * palette.width, SAMPLE_RES);
    photomosaicShader.setUniform('n', palette.width);
  }
  palette.sort({ ascending: true, cellLength: SAMPLE_RES });
  drawQuadrille(palette, { graphics: pg, cellLength: 30, outlineWeight: 0 });
  photomosaicShader.setUniform('palette', pg);
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
        imgcode.value('') // to avoid getting dataset image instead
    }
}
```
{{</details >}}

{{<details "Photomosaic Shader Code">}}

``` glsl
precision mediump float;

uniform sampler2D palette;
// source (image or video) is sent by the sketch
uniform sampler2D source;
uniform bool keys;
// displays original
uniform bool original;
// target horizontal & vertical resolution
uniform float resolution;
uniform float n;

// interpolated texcoord (same name and type as in vertex shader)
// defined as a (normalized) vec2 in [0..1]
varying vec2 texcoords2;

float luma(vec3 texel) {
    return 0.299 * texel.r + 0.587 * texel.g + 0.114 * texel.b; // min 0, max 255
}

void main() {
  if (original) {
    gl_FragColor = texture2D(source, texcoords2);
  }
  else {
    // i. define coord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 coord = texcoords2 * resolution;
    // ii. remap stepCoord in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(coord);
    vec2 symbolCoord = coord - stepCoord;
    // iii. remap stepCoord in [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution); // normalized step coord
    // source texel
    vec4 key = texture2D(source, stepCoord); // texel will be the key to look up

    // we calculate key color luma
    float kluma = luma(key.rgb);

    // palette is an image containing the 30 images but with 1.0 x 1.0 dimensions.
    // each key will get an image from the palette: we have the symbol coord (x, y).
    // images are ordered horizontally, so we take x, which indicates the starting coordinate of our key, and divide it by n because we have n images, 
    // with this we can start counting from the left-most image to the right
    // to this quotient, we add kluma, which is a value between 0 a 1. It will ensure we are going to use the correct image texel. 
    // y coordinate need no special treatment.
    // for each texel, we need to paint the correct portion of the image that will represent

    vec4 paletteTexel = texture2D(palette, vec2(symbolCoord.x / n + kluma, symbolCoord.y));

    gl_FragColor = keys ? key : paletteTexel;
  }
}
```
{{</details >}}

## ASCII Art (Software Only, No Shaders)

Para el de imágenes, se disminuyó el tamaño de los caracteres a 4pt y su interlineado para poder visualizar la imagen en un espacio más pequeño.

<iframe src="/VisualComputing/sketches/shaders/Photomosaic/videoASCII.html" style="border:none;width:1200px;height:1000px;"></iframe>

{{<details "Sketch Code">}}

``` js
const density = 'qwerty12345';

let video;
let asciiDiv;

function setup() {
  noCanvas();
  video = createVideo(
    ['/VisualComputing/docs/shaders/resources/bicho.mp4'],
    vidLoad
  );
  video.size(100, 100);
  
  asciiDiv = createDiv();
  
}

function vidLoad() {
  video.loop();
  video.volume(0);
}

function draw(){
  
  video.loadPixels();
  let asciiImage = '';

  for(let j = 0; j < video.height; j++){
    
    for(let i = 0; i < video.width; i++){      
    
      const pixelIndex = (i + j * video.width) * 4;
      const r = video.pixels[pixelIndex + 0];
      const g = video.pixels[pixelIndex + 1];
      const b = video.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      
      
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, len, 0));
      const c = density.charAt(charIndex);
      if (c == '') asciiImage += '&nbsp;'
      else asciiImage += c;
      
    }
    asciiImage += '<br/>';
  }
  asciiDiv.html(asciiImage);
}
```
{{</details >}}

<iframe src="/VisualComputing/sketches/shaders/Photomosaic/imageASCII.html" style="border:none;width:1200px;height:1000px;"></iframe>

{{<details "Sketch Code">}}

``` js

const density = 'qwerty12345';

let photo;

function preload(){
  photo = loadImage("/VisualComputing/docs/shaders/resources/photo.jpg")
}

function setup() {
  noCanvas();
  
  background(0);
  image(photo,0,0,width,height);
  
  let w = width/photo.width;
  let h = height/photo.height;
  
  photo.loadPixels();
    
  for(let j = 0; j < photo.height; j++){
    let row = '';
    for(let i = 0; i < photo.width; i++){      
    
      const pixelIndex = (i + j * photo.width) * 4;
      const r = photo.pixels[pixelIndex + 0];
      const g = photo.pixels[pixelIndex + 1];
      const b = photo.pixels[pixelIndex + 2];
      const avg = (r + g + b) / 3;
      
      
      const len = density.length;
      const charIndex = floor(map(avg, 0, 255, len, 0));
      const c = density.charAt(charIndex);
      if (c == '') row += '&nbsp;'
      else row += c;
      
    }
    createDiv(row);
  }
  
}

```
{{</details >}}