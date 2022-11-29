---
title: Spatial Coherence
weight: 6
---
## Exercise
1. Implement your own source dataset and a mechanism to select different images from it.
2. Implement a pixelator in software that doesn’t use spatial coherence and compare the results with those obtained here.

## Spatial Coherence

En este ejericio se hace una implementación del pixelado de imágenes usando coherencia espacial. El shader pixelator recibe la imagen y la resolución a utilizar. Una resolución de 30 significa que la imagen pixelada tendrá 30 pixeles de baja resolución (grandes) en cada lado. 

El mecanismo de coherencia espacial opera de la siguiente forma: Para cada texel se recibe una coordenada normalizada [0..1]. Cada componente se multiplica por la resolución por lo que si esta es 30, ahora [0..30]. Luego, a estas componentes se les calcula la función piso. De esta manera, por ejemplo, todas las coordenadas dentro del espacio [2, 3)x[2, 3) serán mapeadas a la coordenada (2, 2). Esta coordenada se divide entre la resolución para volver a obtener valores normalizadas. El color de la coordenada (2, 2) es asignado a todos los texeles en [2, 3)x[2, 3). Aquí la coherencia espacial sea aplica porque se asume que ese color será cercano a los colores de todos los texeles que se mapean a dicha coordenada, aunque no sea cierto en todos los casos, pero siendo muy probable.

Se añadó una implementación que no usa coherencia espacial para que el usuario pueda comparar los resultados. Esta otra implementación, pinta cada pixel de baja resolución con el color promedio de los colores de los pixeles que se mapean a dicha coordenada. Esta aplicación fue implementada por software, es decir, no se usan shaders. El usuario debe subir la imagen que quiere comparar manualmentee a ambas implementaciones y mover el slider para que ambas tengan la misma resolución.

Se observará que no hay gran diferencia en los colores usados en los pixeles de baja resolución. Tal vez incluso parezca que la coherencia espacial muestra la imagen pixelada con un poco más de detalle, mientras que la que usa el promedio de los colores pareciera que estuviera pasando un efecto de blur o lo menos algo similar ...). 

La implementación sin coherencia espacial no acepta videos, por lo que solo podrá hacer la comparación con imágenes.

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Checkbox Default Video**: marcar para usar el video por defecto, desmarcar para usar la imagen por defecto
* **Slider**: define la resolución (por defecto 30, es decir 30 pixeles de baja resolución por cada lado de la cuadrícula). El mínimo valor es 1 y el máximo 150. Una resolución mayor, implica más pixeles, y por tanto, de menor tamaño cada vez. El tamaño de la cuadrícula es de 600px x 600px  por lo que una resolución de 150 implica pixeles de baja resolución de dimensiones 4px x 4px.
* **Select**: para decidir si ver la imagen pixelada o la original
* **Input**: ingrese un número entre 1 y 30 para escoger una imagen del dataset. El dataset se muestra en orden abajo de esta aplicación. Observe por ejemplo que panda rojo le corresponde el número 7. Una vez ingresado un número puede usar las flechas de su teclado para cambiar de imagen, siempre que el foco esté sobre el input.

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/SpatialCoherence/scoherence.js" width="650" height="750" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js">}}

{{<details "Dataset">}}

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

{{</details >}}

{{<details "Sketch Code">}}

``` js
'use strict';

let img;
let pixelatorShader;

let resolution;
let mode;

let input;
let imgcode;

let dataset = [];

let video_on;

function preload() {
  img = loadImage(`/VisualComputing/docs/shaders/resources/dataset/${int(random(1, 31))}.jpg`);
  for (let i = 1; i <= 30; i++) {
    dataset.push(loadImage(`/VisualComputing/docs/shaders/resources/dataset/${i}.jpg`));
  }
  pixelatorShader = readShader('/VisualComputing/docs/shaders/fragments/pixelator.frag', { matrices: Tree.NONE, varyings: Tree.texcoords2 });
}

function setup() {
  createCanvas(600, 600, WEBGL);
  textureMode(NORMAL);
  noStroke();
  shader(pixelatorShader);
  resolution = createSlider(1, 150, 30, 1);
  resolution.position(100, 10);
  resolution.style('width', '150px');
  resolution.input(() => pixelatorShader.setUniform('resolution', resolution.value()));
  pixelatorShader.setUniform('resolution', resolution.value());
  mode = createSelect();
  mode.position(10, 10);
  mode.option('original');
  mode.option('pixelator');
  mode.selected('pixelator');
  mode.changed(() => {
    if (mode.value() == 'original')
        resolution.hide();
    else
        resolution.show();
    pixelatorShader.setUniform('original', mode.value() === 'original');
  });
  input = createFileInput(handleFile);
  imgcode = createInput('', 'number');

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

        pixelatorShader.setUniform('source', img);

        beginShape();
        vertex(-1, -1, 0, 0, 1);
        vertex(1, -1, 0, 1, 1);
        vertex(1, 1, 0, 1, 0);
        vertex(-1, 1, 0, 0, 0);
        endShape();
    }
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

{{<details "Pixelator Shader Code">}}
```glsl
precision mediump float;

// source (image or video) is sent by the sketch
uniform sampler2D source;
// displays original
uniform bool original;
// target horizontal & vertical resolution
uniform float resolution;

// interpolated texcoord (same name and type as in vertex shader)
// defined as a (normalized) vec2 in [0..1]
varying vec2 texcoords2;

void main() {
  if (original) {
    gl_FragColor = texture2D(source, texcoords2);
  }
  else {
    // define stepCoord to sample the texture source as a 3-step process:
    // i. define stepCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 stepCoord = texcoords2 * resolution;
    // ii. remap stepCoord in [0.0, resolution] ∈ Z
    // see: https://thebookofshaders.com/glossary/?search=floor
    stepCoord = floor(stepCoord);
    // iii. remap stepCoord in [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);
    // source texel
    gl_FragColor = texture2D(source, stepCoord);
    // ✨ source texels may be used to compute image palette lookup keys,
    // such as in video & photographic mosaics or ascii art visualizations.
  }
}
```
{{</details >}}

## Average Color (No Spatial Coherence)

A continuación se muestra la implementación hecha en software (no hardware) de la pixelación que no usa coherencia espacial (elegir arbitrariamente uno de los pixeles de una sección para pintar el pixel de baja resolución de dicha sección), sino que hace un promedio de los colores de los pixeles de toda la sección y así pinta el pixel de baja resolución.

El usuario debe cargar la imagen manualmente (puede descargar la versión original haciendo click derecho sobre la imagen en la aplicación que usa coherencia espacial y luego subirla aquí). El usuario debe mover el slider si es necesario para que tengan la misma resolución ambas implementaciones para poder comparar.

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Slider**: define la resolución (por defecto 30, es decir 30 pixeles de baja resolución por cada lado de la cuadrícula). El mínimo valor es 1 y el máximo 150. Una resolución mayor, implica más pixeles, y por tanto, de menor tamaño cada vez. El tamaño de la cuadrícula es de 600px x 600px  por lo que una resolución de 150 implica pixeles de baja resolución de dimensiones 4px x 4px.

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/SpatialCoherence/average.js" width="650" height="750">}}

{{<details "Sketch Code">}}

``` js

let mid = 10;
let w = 20; // pixel width and height: split is in groups of 256 pixels.

let input;
let img;

let width;
let height;

let resolution;

function setup() {

    input = createFileInput(handleFile);

    resolution = createSlider(1, 150, 30, 1);
    resolution.position(100, 10);
    resolution.style('width', '150px');
    resolution.input(() => {
        w = Math.floor(600 / resolution.value());
        mid = Math.floor(w / 2);
    });

}

function draw() {

    if (img != null && img.width > 0) {

        width = 600;

        height = 600;

        input.position(2 * width, 0);

        createCanvas(2 * width, height);

        image(img, width, 0, 600, 600);
    
        fill(100);
        noStroke();
        for (let i = 0; i < width; i += w)
        {
            for (let j = 0; j < height; j += w)
            {
                square(i, j, w);
            } 
        }   
    
        let COLORS = {}
    
        for (let i = 0; i < width; i++) {
            let i_ = i + width;
            for (let j = 0; j < height; j++) {
                let color = get(i_, j);
                let key = `${Math.floor(i / w)}-${Math.floor(j / w)}`;
                if (COLORS[key] == null)
                    COLORS[key] = [];
                COLORS[key].push(color);
            }
        }
    
        for (const key in COLORS) {
            let colors = COLORS[key]
            let R = 0;
            let G = 0;
            let B = 0;
            colors.forEach((c) => {
                R += c[0];
                G += c[1];
                B += c[2];
            })
            COLORS[key] = [Math.floor(R / w**2), Math.floor(G / w**2), Math.floor(B / w**2)]
        }
    
        for (const key in COLORS) {
            fill(COLORS[key])
            let x = parseInt(key.split('-')[0])
            let y = parseInt(key.split('-')[1])
            square(x*w, y*w, w);
        }
    
    }
}

function handleFile(file) {
    if (file.type === 'image') {
      img = createImg(file.data, '');
      img.hide();
    } else {
      img = null;
    }
  }

```
{{</details >}}