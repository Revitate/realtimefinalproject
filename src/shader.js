export const vertexShader = `
uniform float screenHeight;
uniform float fov;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

varying vec3 vColor;
attribute float size;
attribute float select;
varying float vActive;
varying float vSelect;
void main() {
    vec4 posTemp = texture2D( texturePosition, uv );
    vec3 pos = posTemp.xyz;
    float active = posTemp.w;
    vec4 velTemp = texture2D( textureVelocity, uv );
    vec3 vel = velTemp.xyz;
    float mass = velTemp.w;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    float distancePerPixels = (tan(fov / 2.0) * mvPosition.z) / (screenHeight / 2.0);
    gl_PointSize = size / distancePerPixels * 2.0;
    vColor = color;
    vActive = active;
    vSelect = select;
}
`

export const fragmentShader = `
varying vec3 vColor;
varying float vActive;
varying float vSelect;
uniform sampler2D texture;
uniform sampler2D glow;

void main() {
    vec4 outColor = texture2D( texture, gl_PointCoord );
    if (vSelect > 0.0) {
        vec4 glowTexture = texture2D( glow, gl_PointCoord);
        if (glowTexture.a < 0.3) discard;
        if (outColor.a < 0.5) {
            gl_FragColor = glowTexture;
        }
        else{
            gl_FragColor = glowTexture * vec4( vColor.rgb, vActive );
        }
    } else {
        if ( outColor.a < 0.5 ) discard;
        gl_FragColor = outColor * vec4( vColor.rgb, vActive );
    }
}
`
