export const velocityShader = `
uniform float delta;
uniform float timestep;

void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float idParticle = uv.y * resolution.x + uv.x;
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 pos = tmpPos.xyz;
    float active = tmpPos.w;
    vec4 tmpVel = texture2D( textureVelocity, uv );
    vec3 vel = tmpVel.xyz;
    float mass = tmpVel.w;
    if ( mass > 0.0 && active == 1.0 ) {
        vec3 acceleration = vec3( 0.0 );
        // Gravity interaction
        for ( float y = 0.0; y < resolution.y; y++ ) {
            for ( float x = 0.0; x < resolution.x; x++ ) {
                vec2 secondParticleCoords = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
                vec4 tmpPos2 = texture2D( texturePosition, secondParticleCoords );
                vec3 pos2 = tmpPos2.xyz;
                float active2 = tmpPos2.w;
                vec4 tmpVel2 = texture2D( textureVelocity, secondParticleCoords );
                vec3 vel2 = tmpVel2.xyz;
                float mass2 = tmpVel2.w;
                float idParticle2 = secondParticleCoords.y * resolution.x + secondParticleCoords.x;
                if ( idParticle == idParticle2 ) {
                    continue;
                }
                if ( mass2 == 0.0 ) {
                    continue;
                }
                if (active == 0.0) {
                    continue;
                }
                vec3 dPos = pos2 - pos;
                float distance = length( dPos );
                if ( distance == 0.0 ) {
                    continue;
                }
                
                float distanceSq = distance * distance;
                float gravityField = 6.67 * mass2 / distanceSq / 10000.0;
                acceleration += gravityField * normalize( dPos );
            }
        }
        // Dynamics
        vel += timestep * delta * acceleration / 1000.0;
    }
    gl_FragColor = vec4( vel, mass );
}
`

export const positionShader = `
uniform float delta;
uniform float timestep;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 pos = tmpPos.xyz;
    float active = tmpPos.w;
    vec4 tmpVel = texture2D( textureVelocity, uv );
    vec3 vel = tmpVel.xyz;
    float mass = tmpVel.w;
    if ( mass == 0.0 ) {
        vel = vec3( 0.0 );
    }
    if ( active == 1.0 ) {
        pos += vel * 0.000000001 * timestep * delta;
    }
    gl_FragColor = vec4( pos, active );
}
`
