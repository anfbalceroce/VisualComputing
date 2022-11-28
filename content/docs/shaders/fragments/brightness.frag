precision mediump float;

uniform int mode;
uniform sampler2D texture;

varying vec2 texcoords2;

float luma(vec3 texel) {
    return 0.299 * texel.r + 0.587 * texel.g + 0.114 * texel.b;
}

float value(vec3 texel) {
    return max(texel.r, max(texel.g, texel.b));
}

float lightness(vec3 texel) {
    float M = max(texel.r, max(texel.g, texel.b));
    float m = min(texel.r, min(texel.g, texel.b));
    return 0.5 * (M + m);
}

float intensity(vec3 texel) {
    return (1. / 3.) * (texel.r + texel.g + texel.b);
}

void main() {

    vec4 texel = texture2D(texture, texcoords2);

    if (mode == 1) {
        gl_FragColor = vec4((vec3(luma(texel.rgb))), 1.0);
    }
    else if (mode == 2) {
        gl_FragColor = vec4((vec3(value(texel.rgb))), 1.0);
    }
    else if (mode == 3) {
        gl_FragColor = vec4((vec3(lightness(texel.rgb))), 1.0);
    }
    else if (mode == 4) {
        gl_FragColor = vec4((vec3(intensity(texel.rgb))), 1.0);
    }
    else {
        gl_FragColor = texel;
    }
}