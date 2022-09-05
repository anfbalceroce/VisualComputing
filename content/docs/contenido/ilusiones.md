# Ilusiones

Aquí se presentan cada una de las ilusiones con sus respectivas explicaciones sobre cómo funcionan.

## Steping Illusion
> <p>En esta ilusion se observan dos rectangulos de color amarillo y azul que se desplazan a lo largo de un patron de barras claras y oscuras. Cuando las condiciones de color y tamaño son adecuadas los rectangulos parecen moverse de manera intermitente, como si fueran pies caminando.</p><p>Cuando el pie amarillo tiene un brillo similar a las barras claras, y el pie azul un brillo similar a las barras oscuras (caso extremo cuando son del mismo color y suficiente contraste entre los claros y los oscuros) solo hay evidencia clara de movimiento cuando los extremos del rectangulo claro pasan sobre una barra oscura o los del rectangulo oscuro pasan sobre una barra clara, efectivamente la mitad del espacio. En la otra mitad no (claro en claro o  oscuro en oscuro) no es evidente el movimiento por lo que el cerebro asume que no hay movimiento (por defecto si algo no está en movimiento, entonces está en reposo).</p><p>Este fenómeno también explica otra posible ilusión, que no se vean los rectángulos caminando si no oscilando, como un gusano. Esto se logra cuando la razón entre el largo del rectángulo y el ancho de las barras es un número impar (un número par causa la ilusión de caminar).</p>
>
{{< p5-iframe sketch="/VisualComputing/sketches/steps.js" width="470" height="403">}}

## Complementary Colors

Existe algo llamado **"imagen remanente retiniana negativa"**. Se vuelve visible cuando un tono determinado permanece en la misma posición de la retina durante varios segundos (por lo general, moveríamos los ojos 3 veces por segundo, por lo que esto no es una desventaja en la visualización normal). La imagen remanente se acumula a medida que esa ubicación retiniana se adapta a este tono especial, y al mirar un fondo neutro se ve el color complementario. Investigaciones recientes han localizado de manera convincente las células ganglionares de la retina como sustrato neural para la imagen residual (Zaidi et al. 2012).

Esto es algo bueno, normalmente, porque ayuda a la **"constancia del color"**, es decir, vemos colores algo independientes de la iluminación ambiental (compare el sol glaciar azulado del mediodía con un tinte rojizo en la sala de estar junto a la chimenea).

Entonces la imagen residual está "grabada", lo que significa que la ubicación de la retina está adaptada. Ahora el parche magenta cambia repentinamente a gris. Por la adaptación, ahora se ve el color complementario, que sería el verde para el magenta, o el gris claro para un gris oscuro.

La imagen residual de la retina generalmente se desvanece rápidamente (en unos pocos segundos en condiciones normales). Pero aquí este desvanecimiento no reduce la percepción de la imagen remanente, porque se descubre una nueva justo después en la siguiente ubicación.

Además, un **efecto Gestalt**, aquí entra en juego el **"fenómeno phi"**: la imagen residual de las sucesivas ubicaciones retinianas se integra y se percibe como un solo objeto en movimiento, a saber, el disco verde.

{{< p5-iframe sketch="/VisualComputing/sketches/illusion-complementary-colors.js" width="550" height="550">}}

>En resumen, los siguientes factores hacen que esta ilusión sea bastante convincente:
>
>* Es bastante fácil fijarse constantemente en el centro
>
>* La mayoría de las veces, las ubicaciones de la retina se readaptan y la imagen remanente se descubre solo brevemente
>
>* Un efecto Gestalt conduce a la percepción de un disco verde volador.
>

>Tomado de <https://michaelbach.de/ot/col-lilacChaser/index.html>


El código en p5 propuesto para esta ilusión se muestra a continuación:

```javascript
    let colors = [];
    let maincolor
    let flag = false;

    let select

    function setup() {
        createCanvas(500, 500);
        angleMode(DEGREES);
        
        select = createSelect();

        /* opciones del elemento select */
        select.option('magenta');
        select.option('yellow');
        select.option('cyan');
        select.option('red');
        select.option('blue');
        select.option('green');
        select.option(color(255, 216, 255)); /* magenta with 15% saturation */
        select.option(color(255, 255, 216)); /* yellow with 15% saturation */
        select.option(color(216, 255, 255)); /* cyan with 15% saturation */
        /* para saber el valor RGB con cierto porcentaje de saturación, se debe convertir el color a HSB */
        /* se usó el siguiente sitio web para ello: https://www.peko-step.com/es/tool/hsvrgb.html */

        select.changed(selectEvent);
        
        maincolor = select.value()
        
        /* arreglo que indica los colores de cada uno de los 12 círculos, incluido el imaginario */
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
        circle(250, 250, 400); /* círculo no visible que actuará como "reloj": en su circunferencia estarán los centros de los círculos */
        
        /* centros de cada uno de los 12 círculos (incluido el imaginario) */
        /* las operaciones trigonométricas se escalan a 200 pues este es el radio de la circunferencia y se le suma 50 pues esta es la distancia entre los bordes de la animación y el círculo grande (no visible) */
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
        
        /* por cada vector se inicializa un punto para ser re-utilizado */
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
        
        /* se dibujan los círculos usando los puntos inicializados, todos de radio 60*/
        noStroke();
        fill(colors[0]); // este valor será actualizado dinámicamente por la función go y el evento del elemento select
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
        point(250, 250) /* punto para fijar la mirada */

        if (flag == false) /* flag indica si se ha llamado la función go */
            go();
        flag = true; /* la función ha sido llamada entonces no se vuelve a llamar hasta que termine una vuelta */
    }

    async function go() {
        for (let i = 0; i < colors.length; i++) {
            await sleep(200); 
            /* el círculo actual se pinta en 240 y el anterior se pinta del color principal */
            if (i == 0) /* i-1 no funciona como en Python cuando i=0 */
                colors[colors.length - 1] = color(maincolor);
            else
                colors[i-1] = color(maincolor); 
                colors[i] = color(240); 
            } 
        flag = false; /* una vez se termina una vuelta, la función draw sabrá que debe llamar otra vez la función */
    }

    /* función de evento para cambiar el color principal maincolor */
    function selectEvent() {
        maincolor = select.value()
    }

    /* función sleep de utilidad */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
```

## Spinning Ellipses
> El efecto consiste en una **ilusión de movimiento**, dado que es una serie de elipses que gira respecto a otro a una razón de 0.003 grados se crea un "puente" entre elipses, que a su vez crea un arco con el borde exterior de los elipses conectados subsecuentemente, mirando el punto central se puede ver como se crean dos patrones de espiral, lo que a su vez al estar rotando da esta espiral "hipnótica".

> Si se mira durante un tiempo y luego se mira un fondo blanco dejará una impresión en la visión como de un halo alrededor de donde se encontraba el punto central.

{{< p5-iframe sketch="/VisualComputing/sketches/ellipse-spin.js" width="530" height="530">}}

## Moving Dots
> El efecto consiste en una **ilusión de movimiento**, debido a que cada círculo contiene dos arcos de colores similares en  movimiento de traslación sobre el mismo círculo, el ojo, al fijar su visión central solo en un punto o zona de toda la imagen, provoca que la visión periférica al captar el resto de la imagen, se dé un efecto de movimiento sobre los círculos, como si estuvieran bailando y moviéndose en forma de onda, a pesar de que el círculo central se encuentre **siempre sin moverse**, esto debido al movimiento contrario entre ambos arcos y que esten colocados de tal modo

{{< p5-iframe sketch="/VisualComputing/sketches/illusion-moving-dots.js" width="720" height="723">}}
