let w = 25; // pixel width and height

let mid = w / 2; // to draw lines from center point of each pixel

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

// Bresenham rasterization algorithm
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

// interpolation using extremes colors and length n
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