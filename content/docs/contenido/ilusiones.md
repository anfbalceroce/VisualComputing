# Ilusiones

Aquí se presentan cada una de las ilusiones con sus respectivas explicaciones sobre cómo funcionan.

## Steping Illusion
> <p>En esta ilusion se observan dos rectangulos de color amarillo y azul que se desplazan a lo largo de un patron de barras claras y oscuras. Cuando las condiciones de color y tamaño son adecuadas los rectangulos parecen moverse de manera intermitente, como si fueran pies caminando.</p><p>Cuando el pie amarillo tiene un brillo similar a las barras claras, y el pie azul un brillo similar a las barras oscuras (caso extremo cuando son del mismo color y suficiente contraste entre los claros y los oscuros) solo hay evidencia clara de movimiento cuando los extremos del rectangulo claro pasan sobre una barra oscura o los del rectangulo oscuro pasan sobre una barra clara, efectivamente la mitad del espacio. En la otra mitad no (claro en claro o  oscuro en oscuro) no es evidente el movimiento por lo que el cerebro asume que no hay movimiento (por defecto si algo no está en movimiento, entonces está en reposo).</p><p>Este fenómeno también explica otra posible ilusión, que no se vean los rectángulos caminando si no oscilando, como un gusano. Esto se logra cuando la razón entre el largo del rectángulo y el ancho de las barras es un número impar (un número par causa la ilusión de caminar).</p>

{{< p5-iframe sketch="/VisualComputing/sketches/steps.js" width="470" height="403">}}

## Complementary Colors
>Existe algo llamado **"imagen remanente retiniana negativa"**. Se vuelve visible cuando un tono determinado permanece en la misma posición de la retina durante varios segundos (por lo general, moveríamos los ojos 3 veces por segundo, por lo que esto no es una desventaja en la visualización normal). La imagen remanente se acumula a medida que esa ubicación retiniana se adapta a este tono especial, y al mirar un fondo neutro se ve el color complementario. Investigaciones recientes han localizado de manera convincente las células ganglionares de la retina como sustrato neural para la imagen residual (Zaidi et al. 2012).

>Esto es algo bueno, normalmente, porque ayuda a la **"constancia del color"**, es decir, vemos colores algo independientes de la iluminación ambiental (compare el sol glaciar azulado del mediodía con un tinte rojizo en la sala de estar junto a la chimenea).

>Entonces la imagen residual está "grabada", lo que significa que la ubicación de la retina está adaptada. Ahora el parche magenta cambia repentinamente a gris. Por la adaptación, ahora se ve el color complementario, que sería el verde para el magenta, o el gris claro para un gris oscuro.

>La imagen residual de la retina generalmente se desvanece rápidamente (en unos pocos segundos en condiciones normales). Pero aquí este desvanecimiento no reduce la percepción de la imagen remanente, porque se descubre una nueva justo después en la siguiente ubicación.

>Además, un **efecto Gestalt**, aquí entra en juego el **"fenómeno phi"**: la imagen residual de las sucesivas ubicaciones retinianas se integra y se percibe como un solo objeto en movimiento, a saber, el disco verde.

{{< p5-iframe sketch="/VisualComputing/sketches/illusion-complementary-colors.js" width="520" height="542">}}

>En resumen, los siguientes factores hacen que esta ilusión sea bastante convincente:
>
>* Es bastante fácil fijarse constantemente en el centro
>
>* La mayoría de las veces, las ubicaciones de la retina se readaptan y la imagen remanente se descubre solo brevemente
>
>* Un efecto Gestalt conduce a la percepción de un disco verde volador.
>

>Tomado de <https://michaelbach.de/ot/col-lilacChaser/index.html>


## Spinning Ellipses
> El efecto consiste en una **ilusión de movimiento**, dado que es una serie de elipses que gira respecto a otro a una razón de 0.003 grados se crea un "puente" entre elipses, que a su vez crea un arco con el borde exterior de los elipses conectados subsecuentemente, mirando el punto central se puede ver como se crean dos patrones de espiral, lo que a su vez al estar rotando da esta espiral "hipnótica".

> Si se mira durante un tiempo y luego se mira un fondo blanco dejará una impresión en la visión como de un halo alrededor de donde se encontraba el punto central.
> Tomado de: https://youtu.be/xlPWCrjQsTE, Autor: Computing Masterclass
{{< p5-iframe sketch="/VisualComputing/sketches/ellipse-spin.js" width="530" height="530">}}

## Moving Dots
> El efecto consiste en una **ilusión de movimiento**, debido a que cada círculo contiene dos arcos de colores similares en  movimiento de traslación sobre el mismo círculo, el ojo, al fijar su visión central solo en un punto o zona de toda la imagen, provoca que la visión periférica al captar el resto de la imagen, se dé un efecto de movimiento sobre los círculos, como si estuvieran bailando y moviéndose en forma de onda, a pesar de que el círculo central se encuentre **siempre sin moverse**, esto debido al movimiento contrario entre ambos arcos y que esten colocados de tal modo
> Tomado de : https://youtu.be/BQbrx6V0jTs, Autor: Computing Masterclass

{{< p5-iframe sketch="/VisualComputing/sketches/illusion-moving-dots.js" width="720" height="723">}}
