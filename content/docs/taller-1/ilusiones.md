---
title: Ilusiones
weight: 1
---

# Ilusiones
## Introducción
Aquí se presentan cada una de las siguiente ilusiones con sus respectivas explicaciones sobre cómo funcionan, tratando de explicar porque se dan dichos fenómenos al analizar los diferentes componente de cada ilusiòn.

## Steping Illusion
> <p>En esta ilusion se observan dos rectangulos de color amarillo y azul que se desplazan a lo largo de un patron de barras claras y oscuras. Cuando las condiciones de color y tamaño son adecuadas los rectangulos parecen moverse de manera intermitente, como si fueran pies caminando.</p><p>Cuando el pie amarillo tiene un brillo similar a las barras claras, y el pie azul un brillo similar a las barras oscuras (caso extremo cuando son del mismo color y suficiente contraste entre los claros y los oscuros) solo hay evidencia clara de movimiento cuando los extremos del rectangulo claro pasan sobre una barra oscura o los del rectangulo oscuro pasan sobre una barra clara, efectivamente la mitad del espacio. En la otra mitad no (claro en claro o  oscuro en oscuro) no es evidente el movimiento por lo que el cerebro asume que no hay movimiento (por defecto si algo no está en movimiento, entonces está en reposo).</p><p>Este fenómeno también explica otra posible ilusión, que no se vean los rectángulos caminando si no oscilando, como un gusano. Esto se logra cuando la razón entre el largo del rectángulo y el ancho de las barras es un número impar (un número par causa la ilusión de caminar).</p>
>
>>Autor: Tomado de https://michaelbach.de/ot/mot-feetLin/index.htmlm, Autor: Michael Bach

{{< p5-iframe sketch="/VisualComputing/sketches/steps.js" width="473" height="410">}}

{{<details "Còdigo">}}

``` js

let barWidth;
let x = 0;
let feetWidth;
let feetHeight;
let feetDistance;
let speed;
let direction = 1;

let barWidthSlider;
let feetWidthSlider;
let feetHeightSlider;
let feetDistanceSlider;
let speedSlider;

const labels = ["Ancho\nBarras","Longitud\nPies","Ancho\nPies","Distancia\nPies","Velocidad"];

function setup() {
  createCanvas(450, 380);
  frameRate(60);
  colorMode(HSB);

  barWidthSlider = createSlider(5, 50, 25);
  barWidthSlider.position(5, 310);
  barWidthSlider.style('width', '80px');

  feetWidthSlider = createSlider(5, 150, 100);
  feetWidthSlider.position(90, 310);
  feetWidthSlider.style('width', '80px');

  feetHeightSlider = createSlider(5, 0.5*(height-80), 25);
  feetHeightSlider.position(175, 310);
  feetHeightSlider.style('width', '80px');

  feetDistanceSlider = createSlider(0, (height-80), 40);
  feetDistanceSlider.position(260, 310);
  feetDistanceSlider.style('width', '80px');

  speedSlider = createSlider(0, 300, 100);
  speedSlider.position(345, 310);
  speedSlider.style('width', '80px');
}



function draw() {
  speed = direction * speedSlider.value()/100;
  barWidth = barWidthSlider.value();  
  if (x + feetWidthSlider.value() <= width){
    feetWidth = feetWidthSlider.value();
  }
  feetHeight = feetHeightSlider.value();
  if (feetDistanceSlider.value() <= (height-80)-2*feetHeight){
    feetDistance = feetDistanceSlider.value();
  }else{
    feetDistance = (height-80)-2*feetHeight;
  }
  

  background(0,0,98);
  stroke(0,0,0);
  fill(0,0,0);
  for (let i = 0; i < width; i = i + 2 * barWidth) {
    rect(i,0,barWidth,(height-80));
  }

  stroke(60,100,100);
  fill(60,100,100);
  rect(x,(0.5*(height-80))-feetHeight-0.5*feetDistance,feetWidth,feetHeight);

  stroke(240,100,40);
  fill(240,100,40);
  rect(x,(0.5*(height-80))+0.5*feetDistance,feetWidth,feetHeight);

  x = x + speed;
  if (x >= width-feetWidth) {
    direction = -1;
  }
  if (x <= 0) {
    direction = 1;
  }
  stroke(0,0,100);
  fill(0,0,100);
  rect(0,300,width,80);
  textSize(16);
  textAlign(CENTER);
  stroke(0,0,0);
  fill(0,0,0);
  text(labels[0], 45, 347);
  text(labels[1], 130, 347);
  text(labels[2], 215, 347);
  text(labels[3], 300, 347);
  text(labels[4], 385, 347);  
}
```
{{</details>}}
## Complementary Colors
>Existe algo llamado **"imagen remanente retiniana negativa"**. Se vuelve visible cuando un tono determinado permanece en la misma posición de la retina durante varios segundos (por lo general, moveríamos los ojos 3 veces por segundo, por lo que esto no es una desventaja en la visualización normal). La imagen remanente se acumula a medida que esa ubicación retiniana se adapta a este tono especial, y al mirar un fondo neutro se ve el color complementario. Investigaciones recientes han localizado de manera convincente las células ganglionares de la retina como sustrato neural para la imagen residual (Zaidi et al. 2012).
>
>Esto es algo bueno, normalmente, porque ayuda a la **"constancia del color"**, es decir, vemos colores algo independientes de la iluminación ambiental (compare el sol glaciar azulado del mediodía con un tinte rojizo en la sala de estar junto a la chimenea).
>
>Entonces la imagen residual está "grabada", lo que significa que la ubicación de la retina está adaptada. Ahora el parche magenta cambia repentinamente a gris. Por la adaptación, ahora se ve el color complementario, que sería el verde para el magenta, o el gris claro para un gris oscuro.
>
>La imagen residual de la retina generalmente se desvanece rápidamente (en unos pocos segundos en condiciones normales). Pero aquí este desvanecimiento no reduce la percepción de la imagen remanente, porque se descubre una nueva justo después en la siguiente ubicación.
>
>Además, un **efecto Gestalt**, aquí entra en juego el **"fenómeno phi"**: la imagen residual de las sucesivas ubicaciones retinianas se integra y se percibe como un solo objeto en movimiento, a saber, el disco verde.

{{< p5-iframe sketch="/VisualComputing/sketches/illusion-complementary-colors.js" width="520" height="544">}}

>En resumen, los siguientes factores hacen que esta ilusión sea bastante convincente:
>* Es bastante fácil fijarse constantemente en el centro
>* La mayoría de las veces, las ubicaciones de la retina se readaptan y la imagen remanente se descubre solo brevemente
>* Un efecto Gestalt conduce a la percepción de un disco verde volador.
>>Tomado de <https://michaelbach.de/ot/col-lilacChaser/index.html>, Autor: Michael Bach

{{<details "Còdigo">}}

``` js

let colors = [];
let maincolor
let flag = false;

let select

function setup() {
  createCanvas(500, 500);
  angleMode(DEGREES);
  
  select = createSelect();
  select.option('magenta');
  select.option('yellow');
  select.option('cyan');
  select.option('red');
  select.option('blue');
  select.option('green');
  select.option(color(255, 216, 255)); /* magenta with 15% saturation */
  select.option(color(255, 255, 216)); /* yellow with 15% saturation */
  select.option(color(216, 255, 255)); /* cyan with 15% saturation */
  select.changed(selectEvent);
  
  maincolor = select.value()
  
  colors = [color(maincolor), color(maincolor), color(maincolor),
            color(maincolor), color(maincolor), color(maincolor),
            color(maincolor), color(maincolor), color(maincolor),
            color(maincolor), color(maincolor), color(maincolor)]

  
}

function draw() {

  background(240);
  strokeWeight(1);
  noStroke();
  fill(240);
  circle(250, 250, 400);
  
  
  let p0 = createVector(450, 250);
  let p30 = createVector(cos(30)*200 + 200 + 50, (1-sin(30))*200 + 50);
  let p60 = createVector(cos(60)*200 + 200 + 50, (1-sin(60))*200 + 50);
  let p90 = createVector(250, 50);
  let p120 = createVector((1-(-cos(120)))*200 + 50, (1-sin(120))*200 + 50);
  let p150 = createVector((1-(-cos(150)))*200 + 50, (1-sin(150))*200 + 50);
  let p180 = createVector(50, 250);
  let p210 = createVector((1-(-cos(210)))*200 + 50, -sin(210)*200 + 200 + 50);
  let p240 = createVector((1-(-cos(240)))*200 + 50, -sin(240)*200 + 200 + 50);
  let p270 = createVector(250, 450);
  let p300 = createVector(cos(300)*200 + 200 + 50, -sin(300)*200 + 200 + 50);
  let p330 = createVector(cos(330)*200 + 200 + 50, -sin(330)*200 + 200 + 50)  
  
  point(p0);
  point(p30);
  point(p60);
  point(p90);
  point(p120);
  point(p150);
  point(p180);
  point(p210);
  point(p240);
  point(p270);
  point(p300);
  point(p330);
  
  noStroke();
  fill(colors[0]);
  circle(p0.x, p0.y, 60);
  fill(colors[1]);
  circle(p30.x, p30.y, 60);
  fill(colors[2]);
  circle(p60.x, p60.y, 60);
  fill(colors[3]);
  circle(p90.x, p90.y, 60);
  fill(colors[4]);
  circle(p120.x, p120.y, 60);
  fill(colors[5]);
  circle(p150.x, p150.y, 60);
  fill(colors[6]);
  circle(p180.x, p180.y, 60);
  fill(colors[7]);
  circle(p210.x, p210.y, 60);
  fill(colors[8]);
  circle(p240.x, p240.y, 60);
  fill(colors[9]);
  circle(p270.x, p270.y, 60);
  fill(colors[10]);
  circle(p300.x, p300.y, 60);
  fill(colors[11]);
  circle(p330.x, p330.y, 60);  
  
  strokeWeight(10);
  stroke(1)
  point(250, 250)

  if (flag == false)
    go();
  flag = true;
}

async function go() {
    for (let i = 0; i < colors.length; i++) {
      await sleep(200); 
      if (i == 0)
        colors[colors.length - 1] = color(maincolor);  
      else
        colors[i-1] = color(maincolor); 
      colors[i] = color(240); 
    } 
    flag = false;
}

function selectEvent() {
  maincolor = select.value()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```
{{</details>}}
## Spinning Ellipses
> El efecto consiste en una **ilusión de movimiento**, dado que es una serie de elipses que gira respecto a otro a una razón de 0.003 grados se crea un "puente" entre elipses, que a su vez crea un arco con el borde exterior de los elipses conectados subsecuentemente, mirando el punto central se puede ver como se crean dos patrones de espiral, lo que a su vez al estar rotando da esta espiral "hipnótica".
> Si se mira durante un tiempo y luego se mira un fondo blanco dejará una impresión en la visión como de un halo alrededor de donde se encontraba el punto central.
>> Tomado de: https://youtu.be/xlPWCrjQsTE, Autor: Computing Masterclass

{{< p5-iframe sketch="/VisualComputing/sketches/ellipse-spin.js" width="530" height="530">}}

{{<details "Còdigo">}}

``` js

let angle = 0;

function setup() {
  createCanvas(500, 500);
  strokeWeight(4);
}

function draw() {
  background(50);
  noStroke()
  fill(255,255,255)
  ellipse(width/2, height/2,10,10)
 
  for(let i = 15; i<500; i+=15){
    push() //Empieza un nuevo dibujo
    translate(width/2,height/2)
    rotate(i+angle *2)
    noFill()
    stroke(i, i+100, 200)
    ellipse(0,0,i+20,i)
    //reemplazado i por slider.value
    pop()
   
    angle += 0.0003
  }
     
}

function changeColor(){
  background(bgcolor)
}

```
{{</details>}}

## Moving Dots
> El efecto consiste en una **ilusión de movimiento**, debido a que cada círculo contiene dos arcos de colores similares en  movimiento de traslación sobre el mismo círculo, el ojo, al fijar su visión central solo en un punto o zona de toda la imagen, provoca que la visión periférica al captar el resto de la imagen, se dé un efecto de movimiento sobre los círculos, como si estuvieran bailando y moviéndose en forma de onda, a pesar de que el círculo central se encuentre **siempre sin moverse**, esto debido al movimiento contrario entre ambos arcos y que esten colocados de tal modo que, en cierto punto de rotaciòn, el circulo central queda expuesto a la zona exterior, provocando que la otra zona, con ambos arcos uno encima de otro, se vea como un circulo sin un pedazo
>> Tomado de : https://youtu.be/BQbrx6V0jTs, Autor: Computing Masterclass

{{< p5-iframe sketch="/VisualComputing/sketches/illusion-moving-dots.js" width="720" height="723">}}

{{<details "Còdigo">}}

``` js

let angle = 0;
function setup() {
  createCanvas(700, 700);
}

function draw() {
  background(50);
  for (let i = 50; i < width - 45; i += 50) {
    for (let j = 50; j < height - 45; j += 50) {

      push()
      fill(0, 168, 0);
      stroke(0, 0, 150);
      strokeWeight(3);
      ellipse(i, j, 25, 25);
      pop()

      push()
      translate(i, j);
      rotate(HALF_PI + i - angle * 3)
      stroke(0, 168, 168);
      strokeWeight(3);
      noFill();
      arc(0, 0, 30, 30, 0, PI)
      pop()

      push()
      translate(i, j);
      rotate(QUARTER_PI * j + angle * 4)
      stroke(0, 255, 255);
      strokeWeight(3);
      noFill();
      arc(0, 0, 25, 25, PI , 0)
      pop()

      angle += 0.0005

    }
  }
}
```
{{</details>}}

## Conclusiones
* Las ilusiones ópticas son efectos que logran engañar nuestro cerebro provocando que veamos cosas que no necesariamente ocurren de dicho modo, en este caso se presentaron, a través de ilusiones generada con código en p5 sin truco

* Las ilusiones opticas presentadas en su mayoria basadas en movimiento provocaron que los ojos humanos viera fenomenos difernetes a como se ejecutaban en realidad, esto debido a interpretaciones de nuestro cerebro ante diferens circunstacias que cambiaban por difernetes cirucunstacias, en el primero provcada por el fondo, en el segundo por el cambio de color sucesivo de los circulos de color rosa, el tercero por el movimiento y la sobreposicion de algunos arcos sobre otros, y el ultimo por el movimiento translacional de los dos arcos exteriores a los circulos

## References

* Steping Illusion, Autor: Muchael Bach, Tomado de https://michaelbach.de/ot/mot-feetLin/index.html
* Complementary Colors, Autor: Michael Bach, Tomado de https://michaelbach.de/ot/col-lilacChaser/index.html
* Spinning Ellipses, Autor: Computing Masterclass, Tomado de: https://youtu.be/xlPWCrjQsTE
* Moving Dots, Autor: Computing Masterclass, Tomado de : https://youtu.be/BQbrx6V0jTs
