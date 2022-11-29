---
title: Photomosaic
weight: 7
---
## Exercise
Implement a mosaic (or/and ascii art) visual application.

## Images Photomosaic

En esta aplicación, se usa el mismo mecanismo de pixelación visto en **Spatial Coherence** con la diferencia de que cada pixel de baja resolución es mapeado a una imagen. El shader recibe una imagen (buffer) que contiene todas las imágenes del dataset que compondrán el mosaico. Estas imágenes están ordenadas siguiendo alguna métrica, que en nuestro caso es el luma. El shader obtiene el color del pixel de baja resolución para cada texel y a ese color le calcula el luma. Con el luma, se hace el mapeo correspondiente en el buffer.

## Explicación

La coordenada **stepCoord** mapea la coordenada de cada texel a su coordenada entera usando la función piso.
Por ejemplo, todos los texeles dentro del espacio [2.0, 3.0) X [2.0, 3.0] son mapeados a la coordenada (2, 2).
El texel en la coordenada mapeada, en este caso (2, 2) tiene un color. Ese color se asigna a todos los texeles que fueron mapeados. Ese es el mecanismo de pixelación usado, que aplica el concepto de coherencia espacial, pues no nos interesa qué color es, solo confiamos que será coherente con su espacio al rededor.

Las n imágenes del dataset son recibidas en el shader como una única imagen. Estas imágenes están ordenadas horizontalmente, una siguiendo a la otra. Podemos imaginar el buffer como un arreglo de dimensión **1 x n**. El shader llama a este buffer **palette** o paleta.

La coordenada **symbolCoord** indica de qué color se debe pintar cada texel en la textura de salida para que vaya dibujando los símbolos del mosaico, es decir las imágenes, correctamente. 

Si se usa esta coordenada **symbolCoord**, cada símbolo será el buffer (paleta) completo:

{{<details "Symbol = Palette">}}
  ![Each symbol is the whole palette (buffer)](/VisualComputing/docs/shaders/resources/ss0.png)
{{</details >}}

{{<details "Code: Symbol = Palette">}}
```glsl
    // i. define symbolCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 symbolCoord = texcoords2 * resolution;
    // ii. define stepCoord as a symbolCoord remapping in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(symbolCoord);
    // iii. remap symbolCoord to [0.0, 1.0] ∈ R
    symbolCoord = symbolCoord - stepCoord;
    // remap stepCoord to [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);

    // stepCoord is the coordinate of our key, we get its color: key color
    vec4 key = texture2D(source, stepCoord); // texel will be the key to look up

    // using symbolcoord draws the whole pallete in each low resolution pixel
    vec4 paletteTexel = texture2D(palette, symbolCoord);

    gl_FragColor = keys ? key : paletteTexel;
```
{{</details >}}

Es necesario hacer el siguiente mapeo sobre la componente horizontal de la coordenada **symbolCoord**.

{{< katex display>}}

\lbrack 0 .. 1 \rbrack \to \lbrack 0 .. 1/n \rbrack \\
symbolCoord.x \to symbolCoord.x / n

{{< /katex >}}

Donde **n** es el número de imagenes en el dataset y **1/n** es la longitud horizontal de cada imagen en la paleta.
De manera que si **n = 30**, la longitud de cada imagen es **1/n = 0.033..**

Si se usa **symbolCoord.x/n** para dibujar, cada símbolo contendrá los pixeles ubicados en el espacio [0, 1/n] X [0, 1] = [0, 0.033] X [0, 1] de la paleta, y eso corresponde a la primera imagen. Como el ordenamiento es por luma ascendente, la primera imagen es la más oscura.

{{<details "Symbol = First Image in Palette">}}
  ![Each symbol is the whole palette (buffer)](/VisualComputing/docs/shaders/resources/ss1.png)
{{</details >}}

{{<details "Code: Symbol = First Image in Palette">}}
```glsl
    // i. define symbolCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 symbolCoord = texcoords2 * resolution;
    // ii. define stepCoord as a symbolCoord remapping in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(symbolCoord);
    // iii. remap symbolCoord to [0.0, 1.0] ∈ R
    symbolCoord = symbolCoord - stepCoord;
    // remap stepCoord to [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);

    // stepCoord is the coordinate of our key, we get its color: key color
    vec4 key = texture2D(source, stepCoord); // texel will be the key to look up

    // using symbolcoord / n maps [0.0, 1.0] ∈ R --> [0.0, 1.0 / n] ∈ R : if n = 30 then [0.0, 0.033] ∈ R
    // 1.0 / n is the horizontal length of each image, so each draws one image, the first image in the pallete (darkest one if ordered by luma asc)
    vec4 paletteTexel = texture2D(palette, vec2(symbolCoord.x / n, symbolCoord.y));

    gl_FragColor = keys ? key : paletteTexel;
```
{{</details >}}

Ahora, es necesario garantizar que con cada cada símbolo que se pinta tenga un luma coherente, de manera que el mosaico pinte la imagen que se quiere pintar. Para esto, se debe calcular el luma del color key. A este luma le llamamos **kluma**. Esta variable nos permitirá buscar la coordenada horizontal correcta en la paleta, desde la cual se debe empezar a pintar. El valor de **kluma** está en [0.0, 1.0] ∈ R, pues los colores están normalizados. La coordenada vertical no tiene problema pues la dimensión del buffer es **1 x n** por lo que no hay ambiguedad en decidir qué imagen se pinta verticalmente (siempre es una, y esa es la que es).

Para encontrar esta coordenada, se calcula la cantidad de desplazamiento horizontal hacia la derecha que se debe hacer desde la coordenada **x = 0.0**. Para esto, podemos definir la siguiente función que llamaremos **nfloor**.

{{< katex display>}}

nfloor(x, n) : \text{Función que toma como entrada un número real x y un entero positivo n y produce como salida} \\
\text{el múltiplo de 1/n más grande que sea menor o igual a x.}

{{< /katex >}}

A continuación la implementación en GLSL:

{{<details "nfloor">}}
```glsl
// nfloor is a function that gets the greatest multiple of 1.0 / n less than or equal to x
float nfloor(float x, float n) { // ex: x = 0.086, n = 30
  float a = 1.0 / n; // 1.0 / 30 = 0.033.. : a is inverse of n
  float b = x / a; //  0.086 / 0.033 = 2.606.. : b in [0.0, n] ∈ R, c in [0, n] ∈ Z
  float c = floor(b); // floor(2.606..) = 2 : integer part of b indicates how many images we must ignore from left to right
  float d = a * c; // 0.033 * 2 = 0.066.. : d is the horizontal coordinate from which we can start drawing
  return d; // d in [0.0, 1.0] ∈ R but has a finite size n: [0 * 1/n, 1 * 1/n, 2 * 1/n, ..., n-1 * 1/n = 1 - 1/n]
}
```
{{</details >}}

Recordando que **1/n** es la longitud de cada imagen en la paleta, si se **x = kluma** entonces la función **nfloor** nos da como resultado la coordenada horizontal en la que empieza la imagen con el luma más grande menor o igual a **kluma**. De esta manera se garantiza que se obtiene una coordenada de una imagen con un luma coherente, y que además esta coordenada marca el inicio de la imagen, por lo que se va a poder dibujar correctamente dentro del símbolo.

El rango de la función nfloor es discreto y su tamaño es **n**:

{{< katex display>}}

(x, n) \to nfloor(x, n) \\
[1 .. 0] \times \N \to [0, 1 \cdot 1/n, 2 \cdot 1/n, ..., 1 - (1/n)] 

{{< /katex >}}

Por ejemplo, si **n = 30**, el rango es: **[0, 0.033, 0.066, ..., 0.967, 1]** y su tamaño es **30**.

A este desplazamiento obtenido con la función **nfloor** finalmente se le suma el mapeo **symbolCoord.x/n**, de manera que la imagen se pinte correctamente. Cuando el desplazamiento es cero, se pinta la primera imagen del dataset, pero si es 0.033, entonces se pinta la segunda imagen, y así sucesivamente, de manera que siempre se pinta una imagen coherente y correctamente. Ahora si, cada símbolo es la imagen con un luma coherente y cercano al **kluma** de cada pixel de baja resolución usado en el pixelado.


{{<details "Symbol = Image with Coherent Luma">}}
  ![Each symbol is the whole palette (buffer)](/VisualComputing/docs/shaders/resources/ss2.png)
{{</details >}}

{{<details "Code: Symbol = Image with Coherent Luma">}}
```glsl
    // i. define symbolCoord as a texcoords2 remapping in [0.0, resolution] ∈ R
    vec2 symbolCoord = texcoords2 * resolution;
    // ii. define stepCoord as a symbolCoord remapping in [0.0, resolution] ∈ Z
    vec2 stepCoord = floor(symbolCoord);
    // iii. remap symbolCoord to [0.0, 1.0] ∈ R
    symbolCoord = symbolCoord - stepCoord;
    // remap stepCoord to [0.0, 1.0] ∈ R
    stepCoord = stepCoord / vec2(resolution);
    // stepCoord is the coordinate of our key, we get its color: key color
    vec4 key = texture2D(source, stepCoord); // texel will be the key to look up
    // we calculate the luma of key color: kluma in [0.0, 1.0] ∈ R

    float kluma = luma(key.rgb);
    // we calculate horizontal displacement to the right needed to start drawing an image with a luma close to kluma
    // nfloor is a function that gets the greatest multiple of 1.0 / n less than or equal to x (kluma)
    float displacement = nfloor(kluma, n);

    // using symbolcoord draws the whole pallete in each low resolution pixel
    // vec4 paletteTexel = texture2D(palette, symbolCoord);

    // using symbolcoord / n maps [0.0, 1.0] ∈ R --> [0.0, 1.0 / n] ∈ R : if n = 30 then [0.0, 0.033] ∈ R
    // 1.0 / n is the horizontal length of each image, so each draws one image, the first image in the pallete (darkest one if ordered by luma asc)
    // vec4 paletteTexel = texture2D(palette, vec2(symbolCoord.x / n, symbolCoord.y));

    // we need the displacement to start drawing the correct image each time: the correct image is the one with the luma closest to the key luma
    // displacement is in [0.0, 1.0] ∈ R with finite size n: [0 * 1/n, 1 * 1/n, 2 * 1/n, ..., n-1 * 1/n = 1 - 1/n]
    // [0.0, 0.033, 0.066, ..., 0.967] if n = 30
    // if 0.0, it draws first image, if 0.033, it draws second image, ..., if 0.967 it draws 30th image
    vec4 paletteTexel = texture2D(palette, vec2(displacement + symbolCoord.x / n, symbolCoord.y));

    gl_FragColor = keys ? key : paletteTexel;
```
{{</details >}}

Debe tenerse en cuenta que el luma de la imagen que se usa como símbolo puede no ser el más cercano, pues se está usando la función piso. Puede que para algunos casos, haya una imagen por encima que tenga un luma más cercano. Por ejemplo, si **kluma = 0.098** el desplazamiento dará como resultado **d = 0.066**, que corresponde a la tercera imagen. Nada garantiza que la diferencia entre el luma de la tercera imagen y el **kluma** sea menor que la diferencia entre el luma de la cuarta imagen y el **kluma**. Para ese pixel en particular hubiera funcionado mejor una función **nceil** por ejemplo. Tal vez una mejor implementación pueda enviar al shader un arreglo con los lumas de las n imágenes, y hacer que para cada símbolo se valide cuál diferencia de luma es menor, si la obtenida con **nfloor** o la de la imagen siguiente (obtenida sumando **1/n** sin tener que usar **nceil**), y usar el desplazamiento correspondiente a la hora de pintar el pixel. 

### Controles

* **Botón Choose File**: para cargar una imagen o video
* **Checkbox Default Video**: marcar para usar el video por defecto, desmarcar para usar la imagen por defecto
* **Slider**: define la resolución (por defecto 30, es decir 30 pixeles de baja resolución que en este caso serán imágenes del mosaico por cada lado de la cuadrícula). El mínimo valor es 1 y el máximo 150. Una resolución mayor, implica más pixeles, y por tanto, de menor tamaño cada vez. El tamaño de la cuadrícula es de 600px x 600px  por lo que una resolución de 150 implica pixeles de baja resolución de dimensiones 4px x 4px.
* **Select**: para decidir si ver la imagen pixelada (keys), la original o el mosaico.
* **Input**: ingrese un número entre 1 y 30 para escoger una imagen del dataset. El dataset se muestra en orden abajo de esta aplicación. Observe por ejemplo que panda rojo le corresponde el número 7. Una vez ingresado un número puede usar las flechas de su teclado para cambiar de imagen, siempre que el foco esté sobre el input.

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/Photomosaic/photomosaic.js" width="650" height="750" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/objetos/p5.quadrille.js/p5.quadrille.js">}}

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