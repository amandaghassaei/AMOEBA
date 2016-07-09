precision highp float;

uniform vec2 u_textureDim;
uniform float u_dt;

uniform sampler2D u_velocity;
uniform sampler2D u_lastTranslation;
uniform sampler2D u_mass;

void main(){
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_mass, scaledFragCoord).y;
    if (isFixed < 0.0 || isFixed == 1.0){//no cell or is fixed
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }

    vec3 lastTranslation = texture2D(u_lastTranslation, scaledFragCoord).xyz;
    vec3 velocity = texture2D(u_velocity, scaledFragCoord).xyz;

    vec3 translation = lastTranslation + velocity*u_dt;

    gl_FragColor = vec4(translation, 0);
}