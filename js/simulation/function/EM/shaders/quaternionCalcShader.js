#define M_PI 3.1415926535897932384626433832795

precision mediump float;

uniform vec2 u_textureDim;
uniform float u_dt;

uniform sampler2D u_angVelocity;
uniform sampler2D u_lastQuaternion;
uniform sampler2D u_mass;

vec4 quaternionFromEuler(vec3 euler) {

    float c1 = cos(euler[0] / 2.0);
    float c2 = cos(euler[1] / 2.0);
    float c3 = cos(euler[2] / 2.0);
    float s1 = sin(euler[0] / 2.0);
    float s2 = sin(euler[1] / 2.0);
    float s3 = sin(euler[2] / 2.0);

    return vec4(s1 * c2 * c3 - c1 * s2 * s3, c1 * s2 * c3 + s1 * c2 * s3, c1 * c2 * s3 - s1 * s2 * c3, c1 * c2 * c3 + s1 * s2 * s3);//zyx
}

vec4 multiplyQuaternions(vec4 a, vec4 b){
    float qax = a[0];
    float qay = a[1];
    float qaz = a[2];
    float qaw = a[3];
    float qbx = b[0];
    float qby = b[1];
    float qbz = b[2];
    float qbw = b[3];
    return vec4(qax * qbw + qaw * qbx + qay * qbz - qaz * qby, qay * qbw + qaw * qby + qaz * qbx - qax * qbz,
        qaz * qbw + qaw * qbz + qax * qby - qay * qbx, qaw * qbw - qax * qbx - qay * qby - qaz * qbz);
}

void main(){

    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_mass, scaledFragCoord).y;
    if (isFixed < 0.0 || isFixed == 1.0){//no cell or is fixed
        gl_FragColor = vec4(0, 0, 0, 1);
        return;
    }

    vec4 quaternion = texture2D(u_lastQuaternion, scaledFragCoord);
    vec3 angVelocity = texture2D(u_angVelocity, scaledFragCoord).xyz;

    vec4 quaternionDelta = quaternionFromEuler(angVelocity*u_dt);
    gl_FragColor = multiplyQuaternions(quaternion, quaternionDelta);
}