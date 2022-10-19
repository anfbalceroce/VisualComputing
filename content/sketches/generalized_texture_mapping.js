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
