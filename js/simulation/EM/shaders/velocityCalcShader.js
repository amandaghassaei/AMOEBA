precision mediump float;

uniform vec2 u_textureDim;
uniform vec3 u_gravity;
uniform float u_dt;

uniform sampler2D u_lastVelocity;
uniform sampler2D u_lastTranslation;
uniform sampler2D u_mass;
uniform sampler2D u_fixed;



void main(){
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_fixed, scaledFragCoord).x;
    if (isFixed == 1.0) {
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }
    float mass = texture2D(u_mass, scaledFragCoord).x;

    vec3 lastTranslation = texture2D(u_lastTranslation, scaledFragCoord).xyz;
    vec3 lastVelocity = texture2D(u_lastVelocity, scaledFragCoord).xyz;

    vec3 force = u_gravity*mass;
    vec3 acceleration = force/mass;
    vec3 velocity = acceleration*u_dt;

    gl_FragColor = vec4(velocity, 0);
}