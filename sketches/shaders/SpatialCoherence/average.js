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