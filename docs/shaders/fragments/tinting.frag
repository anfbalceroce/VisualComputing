precision mediump float;

uniform sampler2D texture;
uniform int mode;
uniform float brightness;

varying vec2 texcoords2;
varying vec4 color4;


void main() {

    vec4 texel = texture2D(texture, texcoords2);
    vec4 colorA = texel;
    vec4 colorB = color4;

    if (mode == 0) { // multiply
        gl_FragColor = colorA * colorB * brightness;
    }
    else if (mode == 1) { // add (linear dodge)
        gl_FragColor = (colorA + colorB) * brightness;
    }
    else if (mode == 2) { // screen
        gl_FragColor = (1. - (1. - colorA) * (1. - colorB)) * brightness;
    }
    else if (mode == 3) { // overlay
        float R = (colorA[0] < 0.5) ? 2. * colorA[0] * colorB[0] : (1. - (1. - colorA[0]) * (1. - colorB[0]));
        float G = (colorA[1] < 0.5) ? 2. * colorA[1] * colorB[1] : (1. - (1. - colorA[1]) * (1. - colorB[1]));
        float B = (colorA[2] < 0.5) ? 2. * colorA[2] * colorB[2] : (1. - (1. - colorA[2]) * (1. - colorB[2]));
        float A = (colorA[3] < 0.5) ? 2. * colorA[3] * colorB[3] : (1. - (1. - colorA[3]) * (1. - colorB[3]));
        gl_FragColor = vec4(R, G, B, A) * brightness;
    }
    else if (mode == 4) { // darkest
        gl_FragColor = vec4(min(colorA[0], colorB[0]), 
                            min(colorA[1], colorB[1]), 
                            min(colorA[2], colorB[2]), 
                            min(colorA[3], colorB[3])) * brightness;
    }
    else if (mode == 5) { // lightest
        gl_FragColor = vec4(max(colorA[0], colorB[0]), 
                            max(colorA[1], colorB[1]), 
                            max(colorA[2], colorB[2]), 
                            max(colorA[3], colorB[3])) * brightness;
    }
    else if (mode == 6) { // color burn
        gl_FragColor = 1. - ((1. - colorA) / colorB) * brightness;
    }
    else if (mode == 7) { // linear burn
        gl_FragColor = (colorA + colorB - 1.) * brightness;
    }
    else if (mode == 8) { // difference
        gl_FragColor = (abs(colorA - colorB)) * brightness;
    }
    else if (mode == 9) { // divide
        gl_FragColor = (colorA / colorB) * brightness;
    }
    else if (mode == 10) { // exclusion
        gl_FragColor = (0.5 - 2. * (colorA - 0.5) * (colorB - 0.5)) * brightness;
    }
    else if (mode == 11) { // color dodge
        gl_FragColor = (colorA / (1. - colorB)) * brightness;
    }
    else if (mode == 12) { // hard light
        float R = (colorB[0] > 0.5) ? (1. - (1. - colorA[0]) * (1. - 2. * (colorB[0] - 0.5))) : colorA[0] * 2. * colorB[0];
        float G = (colorB[1] > 0.5) ? (1. - (1. - colorA[1]) * (1. - 2. * (colorB[1] - 0.5))) : colorA[1] * 2. * colorB[1];
        float B = (colorB[2] > 0.5) ? (1. - (1. - colorA[2]) * (1. - 2. * (colorB[2] - 0.5))) : colorA[2] * 2. * colorB[2];
        float A = (colorB[3] > 0.5) ? (1. - (1. - colorA[3]) * (1. - 2. * (colorB[3] - 0.5))) : colorA[3] * 2. * colorB[3];
        gl_FragColor = vec4(R, G, B, A) * brightness;
    }
    else if (mode == 13) { // vivid light
        float R = (colorB[0] > 0.5) ? colorA[0] / (1. - 2. * (colorB[0] - 0.5)) : (1. - (1. - colorA[0]) / (2. * colorB[0]));
        float G = (colorB[1] > 0.5) ? colorA[1] / (1. - 2. * (colorB[1] - 0.5)) : (1. - (1. - colorA[1]) / (2. * colorB[1]));
        float B = (colorB[2] > 0.5) ? colorA[2] / (1. - 2. * (colorB[2] - 0.5)) : (1. - (1. - colorA[2]) / (2. * colorB[2]));
        float A = (colorB[3] > 0.5) ? colorA[3] / (1. - 2. * (colorB[3] - 0.5)) : (1. - (1. - colorA[3]) / (2. * colorB[3]));
        gl_FragColor = vec4(R, G, B, A) * brightness;
    }
    else if (mode == 14) { // vivid light
        float R = (colorB[0] > 0.5) ? colorA[0] + 2. * (colorB[0] - 0.5) : (colorA[0] + 2. * colorB[0] - 1.);
        float G = (colorB[1] > 0.5) ? colorA[1] + 2. * (colorB[1] - 0.5) : (colorA[1] + 2. * colorB[1] - 1.);
        float B = (colorB[2] > 0.5) ? colorA[2] + 2. * (colorB[2] - 0.5) : (colorA[2] + 2. * colorB[2] - 1.);
        float A = (colorB[3] > 0.5) ? colorA[3] + 2. * (colorB[3] - 0.5) : (colorA[3] + 2. * colorB[3] - 1.);
        gl_FragColor = vec4(R, G, B, A) * brightness;
    }
    else if (mode == 15) { // pin light
        float R = (colorB[0] > 0.5) ? max(colorA[0], 2. * (colorB[0] - 0.5)) : min(colorA[0], 2. * colorB[0]);
        float G = (colorB[1] > 0.5) ? max(colorA[1], 2. * (colorB[1] - 0.5)) : min(colorA[1], 2. * colorB[1]);
        float B = (colorB[2] > 0.5) ? max(colorA[2], 2. * (colorB[2] - 0.5)) : min(colorA[2], 2. * colorB[2]);
        float A = (colorB[3] > 0.5) ? max(colorA[3], 2. * (colorB[3] - 0.5)) : min(colorA[3], 2. * colorB[3]);
        gl_FragColor = vec4(R, G, B, A) * brightness;    
    }
    else if (mode == 16) { // soft light photoshop
        float R = (colorB[0] < 0.5) ? 2. * colorA[0] * colorB[0] + colorA[0] * colorA[0] * (1. - 2. * colorB[0]) : 2. * colorA[0] * (1. - colorB[0]) + sqrt(colorA[0]) * (2. * colorB[0] - 1.);
        float G = (colorB[1] < 0.5) ? 2. * colorA[1] * colorB[1] + colorA[1] * colorA[1] * (1. - 2. * colorB[1]) : 2. * colorA[1] * (1. - colorB[1]) + sqrt(colorA[1]) * (2. * colorB[1] - 1.);
        float B = (colorB[2] < 0.5) ? 2. * colorA[2] * colorB[2] + colorA[2] * colorA[2] * (1. - 2. * colorB[2]) : 2. * colorA[2] * (1. - colorB[2]) + sqrt(colorA[2]) * (2. * colorB[2] - 1.);
        float A = (colorB[3] < 0.5) ? 2. * colorA[3] * colorB[3] + colorA[3] * colorA[3] * (1. - 2. * colorB[3]) : 2. * colorA[3] * (1. - colorB[3]) + sqrt(colorA[3]) * (2. * colorB[3] - 1.);
        gl_FragColor = vec4(R, G, B, A) * brightness;
    }
    else if (mode == 17) { // soft light pegtop
        gl_FragColor = ((1. - (2. * colorB)) * (colorA * colorA) + (2. * colorB * colorA)) * brightness;
    }
    else if (mode == 18) { // soft light illusions.hu
        float R = pow(colorA[0], pow(2., 2. * (0.5 - colorB[0])));
        float G = pow(colorA[1], pow(2., 2. * (0.5 - colorB[1])));
        float B = pow(colorA[2], pow(2., 2. * (0.5 - colorB[2])));
        float A = pow(colorA[3], pow(2., 2. * (0.5 - colorB[3])));
        gl_FragColor = vec4(R, G, B, A) * brightness;
    }
    else if (mode == 19) { // soft-light w3c
        float gRa = (colorA[0] <= 0.25) ? ((16. * colorA[0] - 12.) * colorA[0] + 4.) * colorA[0] : sqrt(colorA[0]); 
        float gGa = (colorA[1] <= 0.25) ? ((16. * colorA[1] - 12.) * colorA[1] + 4.) * colorA[1] : sqrt(colorA[1]); 
        float gBa = (colorA[2] <= 0.25) ? ((16. * colorA[2] - 12.) * colorA[2] + 4.) * colorA[2] : sqrt(colorA[2]); 
        float gAa = (colorA[3] <= 0.25) ? ((16. * colorA[3] - 12.) * colorA[3] + 4.) * colorA[3] : sqrt(colorA[3]);

        float R = (colorB[0] <= 0.5) ? colorA[0] - (1. - 2. * colorB[0]) * colorA[0] * (1. - colorA[0]) : colorA[0] + (2. * colorB[0] - 1.) * (gRa - colorA[0]);
        float G = (colorB[1] <= 0.5) ? colorA[1] - (1. - 2. * colorB[1]) * colorA[1] * (1. - colorA[1]) : colorA[1] + (2. * colorB[1] - 1.) * (gGa - colorA[1]);
        float B = (colorB[2] <= 0.5) ? colorA[2] - (1. - 2. * colorB[2]) * colorA[2] * (1. - colorA[2]) : colorA[2] + (2. * colorB[2] - 1.) * (gBa - colorA[2]);
        float A = (colorB[3] <= 0.5) ? colorA[3] - (1. - 2. * colorB[3]) * colorA[3] * (1. - colorA[3]) : colorA[3] + (2. * colorB[3] - 1.) * (gAa - colorA[3]);

        gl_FragColor = vec4(R, G, B, A) * brightness;

    }
}