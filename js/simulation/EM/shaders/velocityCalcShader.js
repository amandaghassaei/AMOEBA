precision mediump float;

uniform vec2 u_textureDim;

uniform sampler2D u_mass;
uniform sampler2D u_fixed;



void main(){
    vec2 fragCoord = gl_FragCoord.xy;
    float isFixed = texture2D(u_fixed, fragCoord/u_textureDim).x;
    float mass = texture2D(u_mass, fragCoord/u_textureDim).x;
    gl_FragColor = vec4(mass, isFixed, 0, 0);
}