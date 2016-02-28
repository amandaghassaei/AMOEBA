precision mediump float;

uniform vec2 u_textureDim;
uniform float u_dt;

uniform sampler2D u_velocity;
uniform sampler2D u_lastTranslation;
uniform sampler2D u_fixed;

void main(){
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_fixed, scaledFragCoord).x;
    if (isFixed < 0.0){//no cell
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }
    if (isFixed == 1.0) {
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }

    vec3 lastTranslation = texture2D(u_lastTranslation, scaledFragCoord).xyz;
    vec3 velocity = texture2D(u_velocity, scaledFragCoord).xyz;

    vec3 translation = lastTranslation + velocity*u_dt;

    gl_FragColor = vec4(translation, 0);
}