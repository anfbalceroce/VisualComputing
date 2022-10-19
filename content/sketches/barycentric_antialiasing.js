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
