---
title: Procedural Texturing
weight: 4
---
## Exercise
Adapt other patterns from the book of shaders (refer also to the shadertoy collection) and map them as textures onto other 3D shapes.

## Procedural Texturing

En este ejercicio, se implementaron dos patrones. Uno tomado de [The Book of Shaders: Random](https://thebookofshaders.com/10/?lan=es) llamado Mosaic y otro tomado de [generative art deco 4 (Shadertoy)](https://www.shadertoy.com/view/mds3DX) y que aplica el concepto de [Chromatic aberration](https://en.wikipedia.org/wiki/Chromatic_aberration).

Por defecto se mostrará este segundo shader sobre un conjunto de conos generados aleatoriamente y que se mueven cíclicamente por el espacio (mod 400) mientras rotan.

Si el usuario selecciona mosaic del selector de shaders, los objetos se transforman en esferas y se aplica la textura procedimental mosaic.

### Controles
* **Select**: selecciona el shader de textura procedimental que desea visualizar

{{< p5-iframe sketch="/VisualComputing/sketches/shaders/ProceduralTexturing/protexturing.js" width="550" height="550" lib1="https://cdn.jsdelivr.net/gh/VisualComputing/p5.treegl/p5.treegl.js" lib2="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js">}}

{{<details "Sketch Code">}}

``` js
let angle = 0;
let positions = []; // will contain objects 3D positions

let easycam;
let P;

let pg;
let cabberShader;
let mosaicShader;

let i = 1;

let texselect;
let tex;

function preload() {
    cabberShader = readShader('/VisualComputing/docs/shaders/fragments/cabber.frag', { matrices: Tree.NONE, varyings: Tree.NONE });
    mosaicShader = readShader('/VisualComputing/docs/shaders/fragments/mosaic.frag', { matrices: Tree.NONE, varyings: Tree.NONE });
  }

function setup() {

  createCanvas(500, 500, WEBGL);

  pg = createGraphics(400, 400, WEBGL);
  textureMode(NORMAL);
  noStroke();
  pg.noStroke();
  pg.textureMode(NORMAL);
  
  easycam = createEasyCam();

  let state = {
    distance: 600,           
    center: [200, 200, 200],       
    rotation: [1, -1, 0, 0],
  };

  easycam.setState(state, 1000);
  
  // 50 objects are placed throughout the space with random positions.
  for (let i = 0; i < 30; i++) {
    let x = randomint(-400, 400);
    let y = randomint(-400, 400);
    let z = randomint(-400, 400);
    positions.push([x, y, z]);
  }

  texselect = createSelect();
  texselect.position(10, 10);
  texselect.option('cabber', 0);
  texselect.option('mosaic', 1);
  texselect.selected('cabber');

}

function draw() {
  
  tex = texselect.value();

  background(0);

  P = easycam.getPosition();
  
  let size = 50;
  let ssize = 300;
  let chromabber = 0.01;

  for (let i = 0; i < positions.length; i++) {
    cabberShader.setUniform('SHAPE_SIZE', ssize/1000);
    cabberShader.setUniform('CHROMATIC_ABBERATION', chromabber);
    cabberShader.setUniform('u_time', frameCount * 0.1);
    mosaicShader.setUniform('u_time', frameCount * 0.1);
    pg.emitResolution(cabberShader);
    pg.emitResolution(mosaicShader);
    if (tex == 0)
        pg.shader(cabberShader);
    else if (tex == 1)
        pg.shader(mosaicShader);
    pg.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    texture(pg);
    push();
    positions[i][0] = (positions[i][0] + 2) % 400;
    positions[i][1] = (positions[i][1] + 2) % 400;
    positions[i][2] = (positions[i][2] + 2) % 400;
    translate(positions[i][0], positions[i][1], positions[i][2]); // with push and pop, translation and rotation of each object is independent of each other.
    rotateX(angle);
    rotateY(angle * 0.4);
    if (tex == 0)
        cone(size);
    else if (tex == 1)
        sphere(size);
    pop();
    ssize += 20;
    size += 1;
    chromabber += 0.002;
    if (tex == 1)
        angle += 0.001;
  }
}

function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
```
{{</details >}}

{{<details "Mosaic Shader Code">}}

``` glsl
// Author @patriciogv - 2015
// Title: Mosaic

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    st *= 10.0; // Scale the coordinate system by 10
    vec2 ipos = floor(st);  // get the integer coords
    vec2 fpos = fract(st);  // get the fractional coords

    // Assign a random value based on the integer coord
    vec3 color = vec3(random( ipos ));

    // Uncomment to see the subdivided grid
    // color = vec3(fpos,0.0);

    gl_FragColor = vec4(color,1.0);
}

```
{{</details >}}

{{<details "Chromatic Abberration Shader Code">}}

``` glsl

// Fork of "generative art deco 3" by morisil. https://shadertoy.com/view/mdl3WX
// 2022-10-28 00:47:55

// Fork of "generative art deco 2" by morisil. https://shadertoy.com/view/ftVBDz
// 2022-10-27 22:34:54

// Fork of "generative art deco" by morisil. https://shadertoy.com/view/7sKfDd
// 2022-09-28 11:25:15

// Copyright Kazimierz Pogoda, 2022 - https://xemantic.com/
// I am the sole copyright owner of this Work.
// You cannot host, display, distribute or share this Work in any form,
// including physical and digital. You cannot use this Work in any
// commercial or non-commercial product, website or project. You cannot
// sell this Work and you cannot mint an NFTs of it.
// I share this Work for educational purposes, and you can link to it,
// through an URL, proper attribution and unmodified screenshot, as part
// of your educational material. If these conditions are too restrictive
// please contact me and we'll definitely work it out.

// copyright statement borrowed from Inigo Quilez

// Music by Giovanni Sollima, L'invenzione del nero:
// https://soundcloud.com/giovanni-sollima/linvenzione-del-nero

// See also The Mathematics of Perception to check the ideas behind:
// https://www.shadertoy.com/view/7sVBzK

precision mediump float;

uniform float SHAPE_SIZE;
uniform float CHROMATIC_ABBERATION;
const float ITERATIONS = 10.;
const float INITIAL_LUMA = .5;

uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

float sdPolygon( float angle,  float distance) {
  float segment = TWO_PI / 4.0;
  return cos(floor(.5 + angle / segment) * segment - angle) * distance;
}

float random(vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float getColorComponent( vec2 st, float modScale,  float blur) {
    vec2 modSt = mod(st, 1. / modScale) * modScale * 2. - 1.;
    float dist = length(modSt);
    float angle = atan(modSt.x, modSt.y) + sin(u_time * .08) * 9.0;
    float shapeMap = smoothstep(SHAPE_SIZE + blur, SHAPE_SIZE - blur, sin(dist * 3.0) * .5 + .5);
    return shapeMap;
}



void main() {

    vec2 st =
        (2.* gl_FragCoord.xy - u_resolution)
        / min(u_resolution.x, u_resolution.y);
    vec2 origSt = st;
    st *= rotate2d(sin(u_time * .14) * .3);
    st *= (sin(u_time * .15) + 2.) * .3;
    st *= log(length(st * .428)) * 1.1;
  
    float blur = .4 + sin(u_time * .52) * .2;

    float modScale = 1.;

    vec3 color = vec3(0);
    float luma = INITIAL_LUMA;
    for (float i = 0.; i < ITERATIONS; i++) {
        vec2 center = st + vec2(sin(u_time * .12), cos(u_time * .13));
        //center += pow(length(center), 1.);
        vec3 shapeColor = vec3(
            getColorComponent(center - st * CHROMATIC_ABBERATION, modScale, blur),
            getColorComponent(center, modScale, blur),
            getColorComponent(center + st * CHROMATIC_ABBERATION, modScale, blur)        
        ) * luma;
        st *= 1.1 + getColorComponent(center, modScale, .04) * 1.2;
        st *= rotate2d(sin(u_time  * .05) * 1.33);
        color += shapeColor;
        color = clamp(color, 0., 1.);
//        if (color == vec3(1)) break;
        luma *= .6;
        blur *= .63;
    }
    const float GRADING_INTENSITY = .4;
    vec3 topGrading = vec3(
        1. + sin(u_time * 1.13 * .3) * GRADING_INTENSITY,
        1. + sin(u_time * 1.23 * .3) * GRADING_INTENSITY,
        1. - sin(u_time * 1.33 * .3) * GRADING_INTENSITY
    );
    vec3 bottomGrading = vec3(
        1. - sin(u_time * 1.43 * .3) * GRADING_INTENSITY,
        1. - sin(u_time * 1.53 * .3) * GRADING_INTENSITY,
        1. + sin(u_time * 1.63 * .3) * GRADING_INTENSITY
    );
    float origDist = length(origSt);
    vec3 colorGrading = mix(topGrading, bottomGrading, origDist - .5);
    gl_FragColor = vec4(pow(color.rgb, colorGrading), 1.);
    gl_FragColor *= smoothstep(2.1, .7, origDist);
}
```
{{</details >}}