# Convolución
<iframe src="/VisualComputing/kernels.html" style="border:none;width:100%;height:1000px;"></iframe>

```html

<img hidden id="uploaded-image" src=""></img> <!--imagen subida, de ella se obtiene la representación binaria que luego es usada por el canvas para obtener la representación en RGBA -->
<canvas hidden id="canvas-for-rgba"></canvas> <!-- canvas solo para dibujar la imagen subida y obtener la representación en RGBA, por eso puede ser oculta -->

<input type="file" id="image-input" accept="image/jpeg, image/png, image/jpg">

<select id="kernel-select">
    <option selected value="identity">Identity</option>
    <option value="gaussian-blur">Gaussian Blur</option>
    <option value="sharpen">Sharpen</option>
    <option value="outline">Outline</option>
    <option value="emboss">Emboss</option>
    <option value="left-sobel">Left Sobel</option>
    <option value="right-sobel">Right Sobel</option>
    <option value="top-sobel">Top Sobel</option>
    <option value="bottom-sobel">Bottom Sobel</option>
</select>

<canvas id="transformed-image-canvas"></canvas>

<script>

    // función de procesamiento de la imagen
    function processImage(image, width, height) {
        let canvas = document.querySelector("#canvas-for-rgba");
        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        var data = ctx.getImageData(0, 0, width, height).data; // data es un arreglo con los valores RGBA de la imagen (arreglo unidimensional)

        transformed_data = [] // es el arreglo transformado o procesado

        let ker = kernel(document.querySelector('#kernel-select').value) // kernel a usar

        for (let i = 0; i < data.length; i += 4) { // se itera de 4, i corresponde al valor R del pixel i-ésimo de la imagen

            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            let a = data[i + 3];

            let pos = position(i, width, height)
            let nbs = neighbours(i, pos, width)
            let ws = weights(ker, pos)

            let sum = ws.reduce((partialSum, a) => partialSum + a, 0); // en la matriz se debe garantizar que la suma de los pesos no sea cero para que funcione
            
            let rtotal = 0
            let gtotal = 0
            let btotal = 0
            let atotal = 0

            // suma ponderada para cada valor R G B A 
            for (let j = 0; j < nbs.length; j++) {
                rtotal += data[nbs[j]] * ws[j]
                gtotal += data[nbs[j] + 1] * ws[j]
                btotal += data[nbs[j] + 2] * ws[j]
                atotal += data[nbs[j] + 3] * ws[j]
            }

            // se obtiene la suma ponderada: error cuando sum es cero ...
            let R = Math.round(rtotal / sum)
            let G = Math.round(gtotal / sum)
            let B = Math.round(btotal / sum)
            let A = Math.round(atotal / sum)

            // se agregan los nuevos valores al arreglo transformado
            transformed_data.push(R)
            transformed_data.push(G)
            transformed_data.push(B)
            transformed_data.push(A)
        }

        // se crea canvas de la imagen transformada para mostrarla en pantalla
        // nota: se necesita usar canvas para poder visualizar la imagen apartir del arreglo de R G B A
        canvas = document.querySelector("#transformed-image-canvas");
        canvas.width = width;
        canvas.height = height;

        ctx = canvas.getContext("2d");

        var imageData = canvas.getContext('2d').createImageData(width, height);
        imageData.data.set(transformed_data);
        ctx.putImageData(imageData, 0, 0)
    }

    // se procesa imagen cuando se sube archivo
    const image_input = document.querySelector("#image-input");
    image_input.addEventListener("change", function() {

        const reader = new FileReader();
        reader.readAsDataURL(this.files[0]);
        reader.onload = (e) => {

            const image = new Image();
            
            image.src = e.target.result;

            image.onload = (e) => {

                const width = e.target.width;
                const height = e.target.height;

                const uploaded_image = reader.result
                document.querySelector("#uploaded-image").src = uploaded_image;

                processImage(image, width, height)

            };
        };
    });

    // se procesa imagen cuando se cambia el valor del select kernel
    const kernel_select = document.querySelector("#kernel-select");
    kernel_select.addEventListener("change", function() {

        const image = new Image();
            
        let img = document.querySelector("#uploaded-image")
        
        image.src = img.src;

        let width = img.width
        let height = img.height
        
        console.log(image.src)

        processImage(image, width, height)
    });


    // obtener posición del pixel según su índice y los valores weight y height
    let position = (i, w, h) => { 
        if (i == 0)
            return 'top-left-corner';
        else if (i == (w * 4) - 1)
            return 'top-right-corner';
        else if (i == h * ((w * 4) - 1))
            return 'bottom-left-corner';
        else if (i == (h * w * 4) - 1)
            return 'bottom-right-corner';
        else if (i < (w * 4) - 1)
            return 'top-row';
        else if (i % (w * 4) == (w * 4) - 1)
            return 'right-row';
        else if (i > h * ((w * 4) - 1) && i < (h * w * 4) - 1)
            return 'bottom-row';      
        else if (i % (w * 4) == 0)
            return 'left-row';        
        else
            return 'inner-cell'
    }

    // arreglo de índices según posición, que será usado para obtener las posiciones de los pixeles vecinos (neighbours) y 
    // las posiciones de los pesos de la matriz del kernel
    let indexes = (position) => { 
        if (position == 'inner-cell')
            return [0, 1, 2,
                    3, 4, 5,
                    6, 7, 8]
        else if (position == 'left-row')
            return [   1, 2, 
                       4, 5,
                       7, 8]
        else if (position == 'right-row')
            return [0, 1, 
                    3, 4,
                    6, 7   ]
        else if (position == 'top-row')
            return [ 
                    3, 4, 5,
                    6, 7, 8]
        else if (position == 'bottom-row')
            return [0, 1, 2, 
                    3, 4, 5,
                           ]
        else if (position == 'top-right-corner')
            return [                               
                    3, 4,
                    6, 7   ]
        else if (position == 'top-left-corner')
            return [
                       4, 5,
                       7, 8]
        else if (position == 'bottom-left-corner')
            return [   1, 2, 
                       4, 5
                           ]
        else if (position == 'bottom-right-corner')
            return [0, 1, 
                    3, 4   
                           ]
        else
            return []
    }

    // arreglo con los índices de los pixeles vecinos
    let neighbours = (i, position, w) => {

        let matrix = [i - (w * 4) - 4, i - (w * 4), i - (w * 4) + 4, 
                      i - 4,           i          , i + 4,
                      i + (w * 4) - 4, i + (w * 4), i + (w * 4) + 4]

        let idx = indexes(position)

        let nbs = []

        idx.forEach((i) => {
            nbs.push(matrix[i])
        })

        return nbs
    }

    // kernels disponibles: cada matriz es una matriz de pesos
    let kernel = (kernel) => {
        if (kernel == 'identity')
            return [0, 0, 0, 
                    0, 1, 0,
                    0, 0, 0]
        else if (kernel == 'gaussian-blur')
            return [1, 2, 1, 
                    2, 4, 1,
                    1, 2, 1]
        else if (kernel == 'emboss')
            return [-2, -1, 0, 
                    -1, 2, 1,
                    0, 1, 2]
        else if (kernel == 'left-sobel')
            return [1, 0, -1, 
                    2, 1, -2,
                    1, 0, -1]
        else if (kernel == 'right-sobel')
            return [-1, 0, 1, 
                    -2, 1, 2, // se agregó 1 en la posición central para garantizar que suma de pesos no sea cero
                    -1, 0, 1]
        else if (kernel == 'top-sobel')
            return [1, 2, 1, 
                    0, 1, 0,
                    -1, -2, -1]
        else if (kernel == 'bottom-sobel')
            return [-1, -2, -1, 
                    0, 1, 0,
                    1, 2, 1]
        else if (kernel == 'sharpen')
            return [0, -1, 0, 
                    -1, 5, -1,
                    0, -1, 0]
        else if (kernel == 'outline')
            return [-1, -1, -1, 
                    -1, 9, -1,
                    -1, 1, -1]
        else
            return []
    }

    // arreglo de pesos que se usarán en la suma ponderada del pixel actual: depende del kernel y de la posición del pixel
    let weights = (ker, position) => {

        let idx = indexes(position)

        let ws = []

        idx.forEach((i) => {
            ws.push(ker[i])
        })

        return ws
    }

</script>

```