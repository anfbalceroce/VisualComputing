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
    img = loadImage('../../images/image.png');
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


