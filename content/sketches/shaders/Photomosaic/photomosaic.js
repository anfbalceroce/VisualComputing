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