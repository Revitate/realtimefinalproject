export const vertexShader = `
varying vec3 vColor;
attribute float active;
attribute float size;
varying float vActive;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_PointSize = size;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
    if ( isPerspective ) gl_PointSize *= ( 500.0 / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
    vColor = color;
    vActive = active;
}
`

export const fragmentShader = `
varying vec3 vColor;
varying float vActive;
varying vec2 vUv;
uniform sampler2D texture;

void main() {
    vec4 outColor = texture2D( texture, gl_PointCoord );
    if ( outColor.a < 0.5 ) discard;
    gl_FragColor = outColor * vec4(vColor.rgb, 1.0 );
}
`
