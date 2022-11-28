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