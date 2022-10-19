---
title: Ejercicio Opcional
weight: 2
---
# Workshop 02 - Optional Exercises

>### Exercise
>Implement in software any of the visualizations: primitive rasterization, color shading, z-depth, texture-mapping and/or anti-aliasing (requires a bit of research).

## Primitive Rasterization + Color Shading

> Press any key to switch between triangles

{{< p5-iframe sketch="/VisualComputing/sketches/rasterization_shading.js" width="550" height="550">}}

### Implementation Details

#### Declarations

* We declare a variable **w** that will be each pixel width and height.
* We declare a variable **mid** as **w/2** to facilitate draawing lines from the center of a pixel.
* We declare the triangle vertexes coordinates as **xA**, **yB**, **xB**, ...
* We declare three color pickers: one per vertex.

{{<details "Declarations Code">}}

``` js

let mid = 12.5; // to draw lines from center point of each pixel
let w = 25; // pixel width and height

// triangle lines coordinates
let xA = 4;
let yA = 4;

let xB = 10;
let yB = 10;

let xC = 4;
let yC = 15;

let pixels;
let colors;

// color pickers
let cpA
let cpB
let cpC

```
{{</ details>}}

#### Setup

* The canvas of 500 x 500 will be a 20 x 20 pixels grid.
* The color pickers are instantiated with initial colors (R, G, B).
* The grid lines will light green.

{{<details "Setup Code">}}

``` js

function setup() {
  createCanvas(500, 500); // 500 / 25 for a 20x20 pixels grid

  R = color(220, 10, 10); // red

  cpA = createColorPicker(R);
  cpA.position(0, height + 5);

  G = color(10, 220, 10); // green

  cpB = createColorPicker(G);
  cpB.position(50, height + 5);

  B = color(10, 10, 220); // blue

  cpC = createColorPicker(B);
  cpC.position(100, height + 5);

  LG = color(100, 150, 10); // light green for pixels stroke
}

```

{{</ details>}}

#### Draw

* Colors are updated based on the colors pickers values.
* The grid of 20x20 black pixels is painted. Some of those pixels are then re-painted in colors to display the triangle.
* The triangle vertexes pixels are painted using the current color pickers colors.
* The sides AB, BC, CA are painted.
* To paint a side, we run rasterization Bresenham's line algorithm.
* Bresenham's algorithm returns a list of pixels coordinates. Those pixels are the ones covered by the triangle side.
* We know the vertexes colors for the side that is being painted. From Bresenham's algorithm we now know the side length in terms of pixels.
* We both vertexes colors and side length in pixels we can perform interpolation to do the shading.
* Interolation generated colors are stored in a dictionary **COLORS**, because they will be needed when painting inner pixels.
* An array named **PIXELS** will contain all sides pixels. They will be needed when painting inner pixels.
* The inner pixels painting consists of iterating row by row belonging to the triangle (top to bottom).
* For each row, we get the left most pixel and right most pixel colors.
* With these extremes pixels coordinates, we can calculate the row length.
* Both colors and the row length is then used by the interpolation method to generate the colors of inner pixels.
* Inner pixels are painted.
* Triangle "continous" lines are painted from the center of each vertex pixel to the center of each vertex pixel.

{{<details "Draw Code">}}

``` js

function draw() {

  // colors will be set based on color pickers
  R = cpA.color()
  G = cpB.color()
  B = cpC.color()

  fill(0); // black background

  stroke(LG); // a light green grid

  // we draw black squares (pixels) of width and height 25
  for (let i = 0; i < 500; i += w)
  {
      for (let j = 0; j < 500; j += w)
      {
        square(i, j, w);
      } 
  }   
  
  // we draw triangle vertexes points (A, B, C)
  fill(R);
  square(xA*w, yA*w, w);
  
  fill(G);
  square(xB*w, yB*w, w);
  
  fill(B);
  square(xC*w, yC*w, w);
  
  let PIXELS = [] // will contain triangle sides pixels coordinates
  let COLORS = {} // will contain triangle sides pixels colors (key: [r-c] -> value: color)
    
  // SIDES PAINTING

  // SIDE AB
  pixels = bresenham(xA, yA, xB, yB) // apply bresenham to get sides pixels coordinates
  colors = interpolate(R, G, pixels.length) // interpolate using side length and vertexes colors
  for (let i = 0; i < pixels.length; i++) {
      COLORS[`[${pixels[i].x}-${pixels[i].y}]`] = colors[i] // we store colors because we will need them to paint inner pixels (this may have been unnecessary)
      // we paint side pixels based on bresenham and interpolation results
      fill(colors[i]);
      square(pixels[i].x*w, pixels[i].y*w, w);
  }
  
  PIXELS = PIXELS.concat(pixels) // we will have duplicates pixels (vertex and maybe others)
  
  // SIDE BC
  pixels = bresenham(xB, yB, xC, yC)  
  colors = interpolate(G, B, pixels.length)
  for (let i = 0; i < pixels.length; i++) {
      COLORS[`[${pixels[i].x}-${pixels[i].y}]`] = colors[i]
      fill(colors[i]);
      square(pixels[i].x*w, pixels[i].y*w, w);
  }
  
  PIXELS = PIXELS.concat(pixels)
  
  // SIDE CA
  pixels = bresenham(xC, yC, xA, yA)  
  colors = interpolate(B, R, pixels.length)
  for (let i = 0; i < pixels.length; i++) {
      COLORS[`[${pixels[i].x}-${pixels[i].y}]`] = colors[i]
      fill(colors[i]);
      square(pixels[i].x*w, pixels[i].y*w, w);
  }
  
  PIXELS = PIXELS.concat(pixels) // it containes sides pixels coordinates (with some duplicates, but it's ok with lmp == rmp condition check below in the code)
  

  // INNER PIXELS PAINTING

  // we iterate vertically row by row covering the triangle
  let minY = Math.min(yA, yB, yC); // indicates row to start with
  let maxY = Math.max(yA, yB, yC); // indicates row to end with
  
  for (let row = minY; row <= maxY; row++) {
    
    let limits = PIXELS.filter((p) => p.y == row); // sides pixels belonging to this row
    
    let lmp = limits.reduce((a, b) => (a.x < b.x) ? a : b) // left most pixel
    let rmp = limits.reduce((a, b) => (a.x > b.x) ? a : b) // right most pixel  
    // lmp and rmp colors will be used in interpolation
    
    if (lmp == rmp) // if both equal, there's only one pixel in this row and we don't need to paint any inner pixel
      continue;
    
    let rowpixels = []; // will contain pixels to fill the row
    
    let ip = rmp.x - lmp.x - 1; // intermediate pixels count // if consecutive, it's 0 and for loop below won't run (no inner pixels to paint)
    
    rowpixels.push(lmp) // we add first pixel in row
    
    // won't run if no intermediate pixels
    for (let i = 1; i <= ip; i++) {
      rowpixels.push({x:lmp.x + i, y:row}) // y is fixed, but x will be incremented from x + 1 to x + ip so that limits are ignored since they are added outside the loop
    }
    
    rowpixels.push(rmp) // we add last pixel in row // we add it here to conserve order
    
    // COLORS dict lookup to get colors and start interpolation
    let lmc = COLORS[`[${lmp.x}-${lmp.y}]`] // left most color
    let rmc = COLORS[`[${rmp.x}-${rmp.y}]`] // right most color
           
    colors = interpolate(lmc, rmc, rowpixels.length) // we interpolate using lmc, rmc and row length
    for (let i = 0; i < rowpixels.length; i++) { 
        // we paint based on interpolation (no bresenham needed here)
        fill(colors[i]);
        square(rowpixels[i].x*w, rowpixels[i].y*w, w);
    }  
  }
  
  // "CONTINUOUS" LINES PAINTING

  push();
  
  stroke(10, 200, 200);
  strokeWeight(5);
  // we use mid so that lines start and end at the center of each vertex pixel
  line(xA*w + mid, yA*w + mid, xB*w + mid, yB*w + mid);  
  line(xB*w + mid, yB*w + mid, xC*w + mid, yC*w + mid);
  line(xC*w + mid, yC*w + mid, xA*w + mid, yA*w + mid);  
  
  pop();
  
}

```

{{</ details>}}

#### Bresenham's line algorithm implementation

* This implementation was translated to JavaScript from an implementation written in Python available at: [encukou Bresenham's line algorithm Python implementation](https://github.com/encukou/bresenham)

{{<details "Bresenham's line algorithm Code">}}

``` js

function bresenham(x0, y0, x1, y1) {
    let dx = x1 - x0
    let dy = y1 - y0

    let xx
    let xy
    let yx
    let yy

    let xsign = (dx > 0) ? 1 : -1
    let ysign = (dy > 0) ? 1 : -1

    dx = Math.abs(dx)
    dy = Math.abs(dy)

    if (dx > dy) {
      xx = xsign
      xy = 0
      yx = 0
      yy = ysign
    } else {
      temp = dx
      dx = dy
      dy = temp

      xx = 0
      xy = ysign
      yx = xsign
      yy = 0
    }

    let D = 2*dy - dx
    let y = 0

    let pixels = []

    for (let x = 0; x < dx + 1; x++) {
      pixels.push({x: x0 + x*xx + y*yx, y: y0 + x*xy + y*yy})
      if (D >= 0) {
        y += 1
        D -= 2*dx
      }
      D += 2*dy
    }

  return pixels
}

```

{{</ details>}}

#### Shading Interpolation implementation

* This function was written based on a rasterization algorithm explainer found in YouTube and available at: [
Cédric Girardin (HuCE - cpvrLab) - Rasterizer Algorithm Explanation](https://www.youtube.com/watch?v=t7Ztio8cwqM)

* The intuitive idea behind the linear interpolation can be grasped with the help of below image:

![Shading with linear interpolation](../images/interpolation.PNG)

{{<details "Shading Interpolation Code">}}

``` js

function interpolate(c0, c1, n) {
  
  let colors = []
  
  let r0 = c0._getRed() // color 0 red
  let g0 = c0._getGreen() // color 0 green
  let b0 = c0._getBlue() // color 0 blue
  
  let r1 = c1._getRed() // color 1 red
  let g1 = c1._getGreen() // color 1 green
  let b1 = c1._getBlue() // color 1 blue
  
  for (let i = 0; i < n; i++) {
    d = n - 1; // denominator
    
    n0 = d - i; // color 0 numerator
    n1 = i; // color 1 numerator
    
    ratio_0 = n0 / d;
    ratio_1 = n1 / d;
    
    scaled_r0 = ratio_0 * r0; // scaled red 0 
    scaled_g0 = ratio_0 * g0; // scaled green 0
    scaled_b0 = ratio_0 * b0; // scaled blue 0 
    
    scaled_r1 = ratio_1 * r1; // scaled red 0 
    scaled_g1 = ratio_1 * g1; // scaled green 0 
    scaled_b1 = ratio_1 * b1; // scaled blue 0
    
    interpolated_r = scaled_r0 + scaled_r1;
    interpolated_g = scaled_g0 + scaled_g1;
    interpolated_b = scaled_b0 + scaled_b1;
    
    colors.push(color(interpolated_r, interpolated_g, interpolated_b));
  }
  
  return colors
  
}

```

{{</ details>}}

#### Auxiliary Functions

* Any time a key is pressed, vertex coordinates are updated based on a random integer method with max being inclusive.

{{<details "Auxiliary Functions Code">}}

```js

// new vertex coordinates are generated when pressing a key
function keyPressed() {
  xA = randomint(0, 19);
  yA = randomint(0, 19);
  
  xB = randomint(0, 19);
  yB = randomint(0, 19);
  
  xC = randomint(0, 19);
  yC = randomint(0, 19);
}

// auxiliary function to get random integers (inclusive)
function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // inclusive
}

```

{{</ details>}}

## Z-buffer

> Press any key to visualize z-buffer.

> Press any key again to deactivate it.

{{< p5-iframe sketch="/VisualComputing/sketches/zbuffer.js" width="550" height="550" lib1="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.js">}}

### Implementation Details

#### Declarations

* **P** is the position of the camara in the 3D space.
* **positions** contains the position of each box at any moment.
* **zbuffer** contains distance from each box to the camera position **P** at any moment.
* **colors** contains the interpolated gray scale color of each box at any moment **P**.

{{<details "Declarations Code">}}

```js

let angle = 0; // angle for boxes rotation
let positions = [ // will contain boxes 3D positions

];
let zbuffer = [] // will contain distance between camera and each box.
let colors = []; // will contain colors of boxes at any moment.

let active = false; // flag to indicate z-buffer is being visualized

let easycam;

let P; // camera position

let t = 0; // time counter just to play with ligths transitions

// lights colors
let R1 = 255;
let G1 = 255;
let B1 = 255;
let R2 = 255;
let G2 = 255;
let B2 = 255;

```
{{</ details>}}

#### Setup

* The camara starting position is (0, 0, 600).
* 50 boxes are placed throughout the space at random positions.
* Boxes positions are stored in array **positions**

{{<details "Setup Code">}}

``` js

function setup() {

  createCanvas(500, 500, WEBGL);
  
  easycam = createEasyCam();

  // camera distance from center (0, 0, 0) will be 600.
  // when applying the quaternion (1, 0, 0, 0) with qpq' operation, camera will be in (0, 0, 600) position as expected.
  let state = {
    distance: 600,           
    center: [0, 0, 0],       
    rotation: [1, 0, 0, 0], // p=(0, 0, 600) => qpq'=(0, 0, 600)  
  };

  easycam.setState(state, 1000);
  
  // 50 boxes are placed throughout the space with random positions.
  for (let i = 0; i < 50; i++) {
    let x = randomint(-250, 250);
    let y = randomint(-250, 250);
    let z = randomint(-250, 250);
    positions.push([x, y, z]); // positions are stored.
  }
}

```

{{</ details>}}

#### Draw

* Z-buffer visualization drawing consists of:
* Getting the camera position P.
* Updating the **zbuffer** by calculating distances from boxes to P.
* Updating the **colors** array by interpolating using some given thresholds.
* With **colors** array being updated, each box is painted.

{{<details "Draw Code">}}

``` js

function draw() {
  
  P = easycam.getPosition(); // P is the camera position.

  updateZBuffer(); // update Z-buffer function stores the distance between camera and each point in the zbuffer array.
  updateColors(); // based on the zbuffer values, each box will have a color calculated via interpolation.
  
  background(50);
  
  if (!active) { // if z-buffer is not being visualized, lights colores are updated every so often.
    let locX = mouseX - height / 2;
    let locY = mouseY - width / 2;
    
    if (t % 300 == 0) {
      R1 = randomint(0, 255);
      G1 = randomint(0, 255);
      B1 = randomint(0, 255); 
    }
    else if (t % 151 == 0) {
      R2 = randomint(0, 255);
      G2 = randomint(0, 255);
      B2 = randomint(0, 255); 
    }
    
    ambientLight(60, 60, 60);
    // 3 lights are being used
    pointLight(R1, G1, B1, 0, 0, 0); // center light
    pointLight(R2, G2, B2, locX, locY, 250); // mouse driven light
    pointLight(B2, R1, G2, P[2], P[1], P[0]); // camera driven light
    ambientMaterial(250);
  }
  
  for (let i = 0; i < positions.length; i++) {
    push();
    translate(positions[i][0], positions[i][1], positions[i][2]); // with push and pop, translation and rotation of each box is independent of each other.
    rotateX(angle);
    rotateY(angle * 0.4);
    if (active) fill(colors[i]); // if zbuffer is being visualized, boxes are painted based on interpolated colors in colors array
    box(50);
    pop();
  }

  angle += 0.01; // boxes rotation
  t += 1;
}

```

{{</ details>}}

#### Update Functions, Interpolation and Distance Calculation.

* Interpolation uses 250 and 750 thresholds. These are needed so that colors changed when zooming in and zooming out.

{{<details "Draw Code">}}

``` js

function updateZBuffer() {
  zbuffer = [];
  for (let i = 0; i < positions.length; i++) {
    zbuffer.push(distance(P, positions[i])); // distance between box and camera position P
  }
}

function updateColors() {
  colors = [];
  // thresholds (250, 750) are used so that boxes color change when zooming in and zooming out.
  for (let i = 0; i < positions.length; i++) {
    colors.push(interpolate(250, 750, zbuffer[i])); // interpolation returns a gray scale color.
  }
}

// linear interpolation with gray scale colors.
function interpolate(low, high, mid) {
  let x0 = low;
  let y0 = 255;
  let x1 = high;
  let y1 = 0;
  let x = mid;
  let y = y0 + (x - x0) * ((y1 - y0) / (x1 - x0));
  return y;
}

```

{{</ details>}}

#### Auxiliary Functions

* **active** flag is to toggle z-buffer visualiztion. 

{{<details "Auxiliary Functions Code">}}

```js

// auxiliary functions
function keyPressed() {
    if (active) active = false;
    else active = true;
  }

function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}


```

{{</ details>}}

## Texture Mapping

> Press ENTER to toggle full texture.

> Press any key (different from ENTER ) to update triangle vertexes.

{{< p5-iframe sketch="/VisualComputing/sketches/dedicated_texture_mapping.js" width="1100" height="550">}}

### Implementation Details

* The texture mapping consisted on iterating over each pixel of the real image. For each of these coordinates of the form **(r, c)** we applied the mapping:

{{< katex display>}}

\left(r,\ c\right)\rightarrow(\left\lfloor\frac{r}{w}\right\rfloor,\ \left\lfloor\frac{c}{w}\right\rfloor\ )\ 

{{< /katex >}}

* In this implementation **w** is 16.

* This mapping splits all pixels in groups of **16 x 16 = 256** pixels each one. All colors of those pixels are averaged to get the texture pixel color.

* Important details were already presented in the first exercise. Please refer to code comments for more information.

{{<details "Full Implementation Code">}}

``` js

let w = 16; // pixels width and height is 16

let mid = 8; // pixel mid length to draw lines

let img;

// triangle vertexes coordinates
let xA = 4;
let yA = 4;

let xB = 10;
let yB = 10;

let xC = 4;
let yC = 15;

let full = false; // flag to toggle full texture view

function setup() {
    createCanvas(512 + 512, 512);
    LG = color(10, 150, 10); // line green
    img = loadImage('/VisualComputing/docs/contenido/images/image.png');
}

function draw() {

    image(img, 512, 0, img.width * 2, img.height * 2); // image is scaled up so we are treating it as a 512 px x 512 px image

    fill(0);

    // pixels grid is painted
    stroke(LG);
    for (let i = 0; i < 512; i += w)
    {
        for (let j = 0; j < 512; j += w)
        {
            square(i, j, w);
        } 
    }   

    let COLORS = {} // colors dictionary when key is pixel coordinate

    for (let i = 0; i < 512; i++) {
        let i_ = i + 512;
        for (let j = 0; j < 512; j++) {
            let color = get(i_, j); // color is obtained from real image
            let key = `${Math.floor(i / 16)}-${Math.floor(j / 16)}`; // key generation is the mapping done from real image to texture image
            if (COLORS[key] == null)
                COLORS[key] = [];
            COLORS[key].push(color); // each value of dictionary is an array of 16 x 16 = 256 colors
        }
    }

    // for each array of 256 colors, we average to get pixel color.
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
        COLORS[key] = [Math.floor(R / 16**2), Math.floor(G / 16**2), Math.floor(B / 16**2)] // COLORS values are no longer arrays but a single averaged color.
    }

    // if full texture view, we paint all pixels.
    if (full) {
        for (const key in COLORS) {
            fill(COLORS[key])
            let x = parseInt(key.split('-')[0])
            let y = parseInt(key.split('-')[1])
            square(x*w, y*w, w);
        }
    }

    // we paint triangle sides by using Bresenham's algorithm.
    // we don't need interpolation because we already have the colors.
    let PIXELS = []
      
    pixels = bresenham(xA, yA, xB, yB)  
    for (let i = 0; i < pixels.length; i++) {
        let c = COLORS[`${pixels[i].x}-${pixels[i].y}`]
        fill(color(c[0], c[1], c[2]));
        square(pixels[i].x*w, pixels[i].y*w, w);
    }
    
    PIXELS = PIXELS.concat(pixels)

    pixels = bresenham(xB, yB, xC, yC)  
    for (let i = 0; i < pixels.length; i++) {
        let c = COLORS[`${pixels[i].x}-${pixels[i].y}`]
        fill(color(c[0], c[1], c[2]));
        square(pixels[i].x*w, pixels[i].y*w, w);
    }
    
    PIXELS = PIXELS.concat(pixels)

    pixels = bresenham(xC, yC, xA, yA)  
    for (let i = 0; i < pixels.length; i++) {
        let c = COLORS[`${pixels[i].x}-${pixels[i].y}`]
        fill(color(c[0], c[1], c[2]));
        square(pixels[i].x*w, pixels[i].y*w, w);
    }
    
    PIXELS = PIXELS.concat(pixels)

    // iterate vertically row by row covering the triangle
    let minY = Math.min(yA, yB, yC);
    let maxY = Math.max(yA, yB, yC);

    for (let row = minY; row <= maxY; row++) {
    
        let limits = PIXELS.filter((p) => p.y == row); // sides pixels
        
        let lmp = limits.reduce((a, b) => (a.x < b.x) ? a : b) // right most pixel
        let rmp = limits.reduce((a, b) => (a.x > b.x) ? a : b) // right most pixel  
        
        if (lmp == rmp) // if both equal, just one pixel in this row and no painting is needed since no inner pixels
            continue;
        
        let rowpixels = []; // will contain pixels to fill the row
        
        let ip = rmp.x - lmp.x - 1; // intermediate pixels // if consecutive, 0 and for loop below won't run
        
        rowpixels.push(lmp) // we add first pixel in row
        
        // won't run if no intermediate pixels
        for (let i = 1; i <= ip; i++) {
            rowpixels.push({x:lmp.x + i, y:row}) // y is fixed, but x will be incremented from x + 1 to x + ip so that limits are ignored since they are added outside the loop
        }
        
        rowpixels.push(rmp) // we add last pixel in row // we add it here to conserve order
        
        // we paint row pixels using COLORS dictionary
        for (let i = 0; i < rowpixels.length; i++) {
            fill(COLORS[`${rowpixels[i].x}-${rowpixels[i].y}`]);
            square(rowpixels[i].x*w, rowpixels[i].y*w, w);
        }   
    }

    // we paint lines on both texture and real images
    push();
  
    stroke(255, 255, 255);
    strokeWeight(2);
    line(xA*w + mid, yA*w + mid, xB*w + mid, yB*w + mid);  
    line(xB*w + mid, yB*w + mid, xC*w + mid, yC*w + mid);
    line(xC*w + mid, yC*w + mid, xA*w + mid, yA*w + mid);  

    line(xA*w + mid + 512, yA*w + mid, xB*w + mid + 512, yB*w + mid);  
    line(xB*w + mid + 512, yB*w + mid, xC*w + mid + 512, yC*w + mid);
    line(xC*w + mid + 512, yC*w + mid, xA*w + mid + 512, yA*w + mid);      
    pop();
}

// Bresenham's line algorithm implementation
function bresenham(x0, y0, x1, y1) {
    let dx = x1 - x0
    let dy = y1 - y0

    let xx
    let xy
    let yx
    let yy

    let xsign = (dx > 0) ? 1 : -1
    let ysign = (dy > 0) ? 1 : -1

    dx = Math.abs(dx)
    dy = Math.abs(dy)

    if (dx > dy) {
      xx = xsign
      xy = 0
      yx = 0
      yy = ysign
    } else {
      temp = dx
      dx = dy
      dy = temp

      xx = 0
      xy = ysign
      yx = xsign
      yy = 0
    }

    let D = 2*dy - dx
    let y = 0

    let pixels = []

    for (let x = 0; x < dx + 1; x++) {
      pixels.push({x: x0 + x*xx + y*yx, y: y0 + x*xy + y*yy})
      if (D >= 0) {
        y += 1
        D -= 2*dx
      }
      D += 2*dy
    }

  return pixels
}

// Auxiliaty Functions
function keyPressed() {

    if (keyCode === ENTER && !full)
        full = true;
    else if (keyCode === ENTER && full)
        full = false;
    else {
        xA = randomint(0, 31);
        yA = randomint(0, 31);
        
        xB = randomint(0, 31);
        yB = randomint(0, 31);
        
        xC = randomint(0, 31);
        yC = randomint(0, 31);
    }

}

function randomint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


```

{{</ details>}}

## Generalized Texture Mapping

> Press ENTER to toggle full texture.

> Press any key (different from ENTER ) to update triangle vertexes.

{{< p5-iframe sketch="/VisualComputing/sketches/generalized_texture_mapping.js" width="2000" height="1000">}}

### Implementation Details

* Following is a generalized implementation of texture mapping that allows the user to upload an image.

* Implementation is the same as the one we presented, but it now uses a file handler and construct a canvas and a pixels grid based on the uploaded image dimensions.

* Mapping keeps being done with **w = 16** to get groups of 256 pixels.

* For a better experience, please consider to upload small to medium size images.

{{<details "Full Implementation Code">}}

``` js

let mid = 8;
let w = 16; // pixel width and height: split is in groups of 256 pixels.

let input;
let img;

let xA = 4;
let yA = 4;

let xB = 10;
let yB = 10;

let xC = 4;
let yC = 15;

let full = false;

let width;
let height;

function setup() {
    LG = color(150);
    input = createFileInput(handleFile);
}

function draw() {

    if (img != null && img.width > 0) {

        width = img.width;

        height = img.height;

        input.position(2 * width, 0);

        createCanvas(2 * width, height);

        image(img, width, 0);
    
        fill(100);
        stroke(LG);
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
    
        if (full) {
            for (const key in COLORS) {
                fill(COLORS[key])
                let x = parseInt(key.split('-')[0])
                let y = parseInt(key.split('-')[1])
                square(x*w, y*w, w);
            }
        }
    
        let PIXELS = []
          
        pixels = bresenham(xA, yA, xB, yB)  
        for (let i = 0; i < pixels.length; i++) {
            let c = COLORS[`${pixels[i].x}-${pixels[i].y}`]
            if (c == null)
                continue
            fill(color(c[0], c[1], c[2]));
            square(pixels[i].x*w, pixels[i].y*w, w);
        }
        
        PIXELS = PIXELS.concat(pixels)
    
        pixels = bresenham(xB, yB, xC, yC)  
        for (let i = 0; i < pixels.length; i++) {
            let c = COLORS[`${pixels[i].x}-${pixels[i].y}`]
            if (c == null)
                continue
            fill(color(c[0], c[1], c[2]));
            square(pixels[i].x*w, pixels[i].y*w, w);
        }
        
        PIXELS = PIXELS.concat(pixels)
    
        pixels = bresenham(xC, yC, xA, yA)  
        for (let i = 0; i < pixels.length; i++) {
            let c = COLORS[`${pixels[i].x}-${pixels[i].y}`]
            if (c == null)
                continue
            fill(color(c[0], c[1], c[2]));
            square(pixels[i].x*w, pixels[i].y*w, w);
        }
        
        PIXELS = PIXELS.concat(pixels)
    
        // iterate vertically row by row covering the triangle
        let minY = Math.min(yA, yB, yC);
        let maxY = Math.max(yA, yB, yC);
    
        for (let row = minY; row <= maxY; row++) {
        
            let limits = PIXELS.filter((p) => p.y == row); // sides pixels
            
            let lmp = limits.reduce((a, b) => (a.x < b.x) ? a : b) // right most pixel
            let rmp = limits.reduce((a, b) => (a.x > b.x) ? a : b) // right most pixel  
            
            if (lmp == rmp) // if both equal, just one pixel in this row and no inner pixels
                continue;
            
            let rowpixels = []; // will contain pixels to fill the row
            
            let ip = rmp.x - lmp.x - 1; // intermediate pixels // if consecutive, 0 and for loop below won't run
            
            rowpixels.push(lmp) // we add first pixel in row
            
            // won't run if no intermediate pixels
            for (let i = 1; i <= ip; i++) {
                rowpixels.push({x:lmp.x + i, y:row}) // y is fixed, but x will be incremented from x + 1 to x + ip so that limits are ignored since they are added outside the loop
            }
            
            rowpixels.push(rmp) // we add last pixel in row // we add it here to conserve order
            
            for (let i = 0; i < rowpixels.length; i++) {
                let c = COLORS[`${rowpixels[i].x}-${rowpixels[i].y}`]
                if (c == null)
                    continue
                fill(c);
                square(rowpixels[i].x*w, rowpixels[i].y*w, w);
            }   
        }
    
        push();
      
        stroke(255, 255, 255);
        strokeWeight(2);
        line(xA*w + mid, yA*w + mid, xB*w + mid, yB*w + mid);  
        line(xB*w + mid, yB*w + mid, xC*w + mid, yC*w + mid);
        line(xC*w + mid, yC*w + mid, xA*w + mid, yA*w + mid);  
    
        line(xA*w + mid + width, yA*w + mid, xB*w + mid + width, yB*w + mid);  
        line(xB*w + mid + width, yB*w + mid, xC*w + mid + width, yC*w + mid);
        line(xC*w + mid + width, yC*w + mid, xA*w + mid + width, yA*w + mid);      
        pop();
    }
}

function keyPressed() {

    if (keyCode === ENTER && !full)
        full = true;
    else if (keyCode === ENTER && full)
        full = false;
    else {
        xA = randomint(0, Math.floor(width / w)  - 1);
        yA = randomint(0, Math.floor(height / w) - 1);
        
        xB = randomint(0, Math.floor(width / w) - 1);
        yB = randomint(0, Math.floor(height / w) - 1);
        
        xC = randomint(0, Math.floor(width / w) - 1);
        yC = randomint(0, Math.floor(height / w) - 1);
    }

}

function randomint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function bresenham(x0, y0, x1, y1) {
    let dx = x1 - x0
    let dy = y1 - y0

    let xx
    let xy
    let yx
    let yy

    let xsign = (dx > 0) ? 1 : -1
    let ysign = (dy > 0) ? 1 : -1

    dx = Math.abs(dx)
    dy = Math.abs(dy)

    if (dx > dy) {
      xx = xsign
      xy = 0
      yx = 0
      yy = ysign
    } else {
      temp = dx
      dx = dy
      dy = temp

      xx = 0
      xy = ysign
      yx = xsign
      yy = 0
    }

    let D = 2*dy - dx
    let y = 0

    let pixels = []

    for (let x = 0; x < dx + 1; x++) {
      pixels.push({x: x0 + x*xx + y*yx, y: y0 + x*xy + y*yy})
      if (D >= 0) {
        y += 1
        D -= 2*dx
      }
      D += 2*dy
    }

  return pixels
}

function handleFile(file) {
    print(file);
    if (file.type === 'image') {
      img = createImg(file.data, '');
      img.hide();
    } else {
      img = null;
    }
  }


```

{{</ details>}}

### Some Examples

![Parrots Example 1 Image](../images/parrots1.jpg)

![Parrots Example 1 Result](../images/parrots1result.PNG)

![Parrots Example 2 Image](../images/parrots2.jpg)

![Parrots Example 2 Result](../images/parrots2result.PNG)

## Anti-aliasing

> Press ENTER to toggle anti-aliasing.

> Press BACKSPACE to toggle triangle lines.

> Press any other key to randomly update triangle vertexes.

{{< p5-iframe sketch="/VisualComputing/sketches/barycentric_antialiasing.js" width="700" height="700">}}

### Implementation Details

* Implementation is almost the same as the first exercise we presented. The difference is that it adds an additional layer for anti-aliasing.

* The anti-aliasing was implemented based on Fabian “ryg” Giesen blog article: "The barycentric conspiracy" which is available at: [The Barycentric Conspiracy by Fabian "ryg" Giesen](https://fgiesen.wordpress.com/2013/02/06/the-barycentric-conspirac/)

* Summarizing, the anti-aliasing implemented consists in: taking all pixels belonging to the triangle sides (obtained from Bresenham's line algorithm). Subdividing each of these pixels in 4 subpixels. For each of these subpixels, apply the barycentric coordinates method to determine whether the point in the center of each of these subpixels is in the triangle. The test will either return true or false. If it's true, then we use pixel (the pixel to whcih the subpixel belongs) color. If false, we use background color which in this case is black (0). We add the four colors and take its average. We paint all subpixels with this color.

* The code used to test whether a point is in a triangle (describe by its vertexes A, B, C) was took from Glenn Slayden answer to the following question in Stack Overflow: [How to determine if a point is in a 2D triangle? [closed]](https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle). Glenn's answer computes the test without needing to know how are the triangle vertexes numbered: clockwise or counterclockwise, which is a requirement of other implementations.

{{<details "Full Implementation Code">}}

``` js

let mid = 16;
let w = 32; // width and height of pixels

let xA = 4;
let yA = 4;

let xB = 10;
let yB = 10;

let xC = 4;
let yC = 15;

let pixels;
let colors;

let antialiasing = false;
let lines = true;

// color pickers
let cpA
let cpB
let cpC

function setup() {
  createCanvas(640, 640);

  R = color(220, 10, 10); // red

  cpA = createColorPicker(R);
  cpA.position(0, height + 5);

  G = color(10, 220, 10); // green

  cpB = createColorPicker(G);
  cpB.position(50, height + 5);

  B = color(10, 10, 220); // blue

  cpC = createColorPicker(B);
  cpC.position(100, height + 5);

  LG = color(10, 150, 10); // line green
}

function draw() {

  // colors will be set based on color pickers
  R = cpA.color()
  G = cpB.color()
  B = cpC.color()

  fill(0);
  stroke(LG);
  for (let i = 0; i < 640; i += w)
  {
      for (let j = 0; j < 640; j += w)
      {
        square(i, j, w);
      } 
  }   
  
  fill(R);
  square(xA*w, yA*w, w);
  
  fill(G);
  square(xB*w, yB*w, w);
  
  fill(B);
  square(xC*w, yC*w, w);
  
  let PIXELS = []
  let COLORS = {}
    
  pixels = bresenham(xA, yA, xB, yB)  
  colors = interpolate(R, G, pixels.length)
  for (let i = 0; i < pixels.length; i++) {
      COLORS[`[${pixels[i].x}-${pixels[i].y}]`] = colors[i]
      fill(colors[i]);
      square(pixels[i].x*w, pixels[i].y*w, w);
  }
  
  PIXELS = PIXELS.concat(pixels)
  
  pixels = bresenham(xB, yB, xC, yC)  
  colors = interpolate(G, B, pixels.length)
  for (let i = 0; i < pixels.length; i++) {
      COLORS[`[${pixels[i].x}-${pixels[i].y}]`] = colors[i]
      fill(colors[i]);
      square(pixels[i].x*w, pixels[i].y*w, w);
  }
  
  PIXELS = PIXELS.concat(pixels)
  
  pixels = bresenham(xC, yC, xA, yA)  
  colors = interpolate(B, R, pixels.length)
  for (let i = 0; i < pixels.length; i++) {
      COLORS[`[${pixels[i].x}-${pixels[i].y}]`] = colors[i]
      fill(colors[i]);
      square(pixels[i].x*w, pixels[i].y*w, w);
  }
  
  PIXELS = PIXELS.concat(pixels)
  
  // iterate vertically row by row covering the triangle
  let minY = Math.min(yA, yB, yC);
  let maxY = Math.max(yA, yB, yC);
  
  for (let row = minY; row <= maxY; row++) {
    
    let limits = PIXELS.filter((p) => p.y == row); // sides pixels
    
    let lmp = limits.reduce((a, b) => (a.x < b.x) ? a : b) // right most pixel
    let rmp = limits.reduce((a, b) => (a.x > b.x) ? a : b) // right most pixel  
    
    if (lmp == rmp) // if both equal, no inner pixels
      continue;
    
    let rowpixels = []; // will contain pixels to fill the row
    
    let ip = rmp.x - lmp.x - 1; // intermediate pixels // if consecutive, 0 and for loop below won't run
    
    rowpixels.push(lmp) // we add first pixel in row
    
    // won't run if no intermediate pixels
    for (let i = 1; i <= ip; i++) {
      rowpixels.push({x:lmp.x + i, y:row}) // y is fixed, but x will be incremented from x + 1 to x + ip so that limits are ignored since they are added outside the loop
    }
    
    rowpixels.push(rmp) // we add last pixel in row // we add it here to conserve order
    
    // COLORS dict lookup to get colors and start interpolation
    let lmc = COLORS[`[${lmp.x}-${lmp.y}]`] // left most color
    let rmc = COLORS[`[${rmp.x}-${rmp.y}]`] // right most color
           
    colors = interpolate(lmc, rmc, rowpixels.length)
    for (let i = 0; i < rowpixels.length; i++) {
        fill(colors[i]);
        square(rowpixels[i].x*w, rowpixels[i].y*w, w);
    }  
    
  }
  
  // ANTI-ALIASING
  
  if (antialiasing) {
  
    // Vertexes pixels center points
    let tA = { x:xA*w + w/2, y:yA*w + w/2 };
    let tB = { x:xB*w + w/2, y:yB*w + w/2 };
    let tC = { x:xC*w + w/2, y:yC*w + w/2 };

    // SIDES PIXELS ARE DIVIDED IN 4 SUBPIXELS
    for (let i = 0; i < PIXELS.length; i++) {
      let x = PIXELS[i].x;
      let y = PIXELS[i].y;
      let c = COLORS[`[${x}-${y}]`];

      let SUBPIXELS = [
        { x: x*w, y:y*w },
        { x: x*w + w/2, y: y*w },
        { x: x*w, y: y*w + w/2 },
        { x: x*w + w/2, y: y*w + w/2 }
      ]  

      let R = 0;
      let G = 0;
      let B = 0;

      // FOR EACH SUBPIXEL WE DETERMINE IF ITS CENTER IS IN THE TRIANGLE
      // IF YES: WE USE PIXEL COLOR
      // IF NOT: WE USE BLACK COLOR (BACKGROUND COLOR: 0, WE ADD NOTHING TO THE AVERAGE SUM)
      // WE AVERAGE COLORS TO PAINT THE WHOLE PIXEL
      SUBPIXELS.forEach((SP) => {
        let P = { x: SP.x + w/4, y: SP.y + w/4 }; // center of sub pixel
        let covered = PInTriangle(P, tA, tB, tC);

        if (covered) { // if not covered we don't add (add 0 which is like adding black (background color))
          R += c._getRed();
          G += c._getGreen();
          B += c._getBlue();
          
        }    
      })  

      R = R / 4;
      G = G / 4;
      B = B / 4;

      fill(color(R, G, B));

      // WE PAINT ALL SUBPIXELS WITH THE SAME AVERAGED COLOR
      SUBPIXELS.forEach((SP) => {
        square(SP.x, SP.y, w/2);
      })

    }
  }
  
  if (lines) {
    // we now paint the triangle lines using mid so that line starts and ends in the center of a pixel
    push();

    stroke(10, 200, 200);
    strokeWeight(5);
    line(xA*w + mid, yA*w + mid, xB*w + mid, yB*w + mid);  
    line(xB*w + mid, yB*w + mid, xC*w + mid, yC*w + mid);
    line(xC*w + mid, yC*w + mid, xA*w + mid, yA*w + mid);  

    pop();
  }
  
}

// piece of code took from Glenn Slayden answer to the following StackOverflow question: https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
// This function applies barycentric coordinates method but doesn't need to know if vertex are numerated clock or counter-clock wise. 
function PInTriangle(P, A, B, C)
{
    let s = (A.x - C.x) * (P.y - C.y) - (A.y - C.y) * (P.x - C.x);
    let t = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);

    if ((s < 0) != (t < 0) && s != 0 && t != 0)
        return false;

    var d = (C.x - B.x) * (P.y - B.y) - (C.y - B.y) * (P.x - B.x);
    return d == 0 || (d < 0) == (s + t <= 0);
}

// Bresenham's line algorithm to draw sides.
function bresenham(x0, y0, x1, y1) {
    let dx = x1 - x0
    let dy = y1 - y0

    let xx
    let xy
    let yx
    let yy

    let xsign = (dx > 0) ? 1 : -1
    let ysign = (dy > 0) ? 1 : -1

    dx = Math.abs(dx)
    dy = Math.abs(dy)

    if (dx > dy) {
      xx = xsign
      xy = 0
      yx = 0
      yy = ysign
    } else {
      temp = dx
      dx = dy
      dy = temp

      xx = 0
      xy = ysign
      yx = xsign
      yy = 0
    }

    let D = 2*dy - dx
    let y = 0

    let pixels = []

    for (let x = 0; x < dx + 1; x++) {
      pixels.push({x: x0 + x*xx + y*yx, y: y0 + x*xy + y*yy})
      if (D >= 0) {
        y += 1
        D -= 2*dx
      }
      D += 2*dy
    }

  return pixels
}

// Interpolation for shading coloring
function interpolate(c0, c1, n) {
  
  let colors = []
  
  let r0 = c0._getRed() // color 0 red
  let g0 = c0._getGreen() // color 0 green
  let b0 = c0._getBlue() // color 0 blue
  
  let r1 = c1._getRed() // color 1 red
  let g1 = c1._getGreen() // color 1 green
  let b1 = c1._getBlue() // color 1 blue
  
  for (let i = 0; i < n; i++) {
    d = n - 1; // denominator
    
    n0 = d - i; // color 0 numerator
    n1 = i; // color 1 numerator
    
    ratio_0 = n0 / d;
    ratio_1 = n1 / d;
    
    scaled_r0 = ratio_0 * r0; // scaled red 0 
    scaled_g0 = ratio_0 * g0; // scaled green 0
    scaled_b0 = ratio_0 * b0; // scaled blue 0 
    
    scaled_r1 = ratio_1 * r1; // scaled red 0 
    scaled_g1 = ratio_1 * g1; // scaled green 0 
    scaled_b1 = ratio_1 * b1; // scaled blue 0
    
    interpolated_r = scaled_r0 + scaled_r1;
    interpolated_g = scaled_g0 + scaled_g1;
    interpolated_b = scaled_b0 + scaled_b1;
    
    colors.push(color(interpolated_r, interpolated_g, interpolated_b));
  }
  
  return colors
  
}


// Auxiliary Functions
function keyPressed() {
  if (keyCode == ENTER && antialiasing == false) {
    antialiasing = true;
  } else if (keyCode == ENTER && antialiasing == true) {
    antialiasing = false;
  } else if (keyCode == BACKSPACE && lines == false) {
    lines = true             
  } else if (keyCode == BACKSPACE && lines == true) {
    lines = false             
  } else {
    xA = randomint(0, 19);
    yA = randomint(0, 19);

    xB = randomint(0, 19);
    yB = randomint(0, 19);

    xC = randomint(0, 19);
    yC = randomint(0, 19);
  }
}

function randomint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}



```

{{</ details >}}

