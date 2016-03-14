#define M_PI 3.1415926535897932384626433832795

precision mediump float;

uniform vec2 u_textureDim;
uniform vec3 u_latticePitch;
uniform float u_wiresMetaLength;
uniform float u_time;

uniform sampler2D u_lastTranslation;
uniform sampler2D u_fixed;
uniform sampler2D u_neighborsXMapping;
uniform sampler2D u_neighborsYMapping;
uniform sampler2D u_lastQuaternion;
uniform sampler2D u_compositeKs;
uniform sampler2D u_wires;
uniform sampler2D u_wiresMeta;



vec3 applyQuaternion(vec3 vector, vec4 quaternion) {

    float x = vector[0];
    float y = vector[1];
    float z = vector[2];

    float qx = quaternion[0];
    float qy = quaternion[1];
    float qz = quaternion[2];
    float qw = quaternion[3];

    // calculate quat * vector

    float ix =  qw * x + qy * z - qz * y;
    float iy =  qw * y + qz * x - qx * z;
    float iz =  qw * z + qx * y - qy * x;
    float iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    return vec3(ix * qw + iw * - qx + iy * - qz - iz * - qy, iy * qw + iw * - qy + iz * - qx - ix * - qz, iz * qw + iw * - qz + ix * - qy - iy * - qx);
}

vec4 quaternionFromUnitVectors(vec3 vFrom, vec3 vTo) {
    vec3 v1 = vec3(0);
    float r = dot(vFrom, vTo)+1.0;
    if (r < 0.000001) {
        r = 0.0;
        if (abs(vFrom[0]) > abs(vFrom[2])) v1 = vec3(-vFrom[1], vFrom[0], 0.0);
        else v1 = vec3(0.0, - vFrom[2], vFrom[1]);
    } else  v1 = cross(vFrom, vTo);
    return normalize(vec4(v1, r));
}

mat4 makeRotationMatrixFromQuaternion(vec4 q) {

    mat4 te;

    float x = q[0];
    float y = q[1];
    float z = q[2];
    float w = q[3];
    float x2 = x + x;
    float y2 = y + y;
    float z2 = z + z;
    float xx = x * x2;
    float xy = x * y2;
    float xz = x * z2;
    float yy = y * y2;
    float yz = y * z2;
    float zz = z * z2;
    float wx = w * x2;
    float wy = w * y2;
    float wz = w * z2;

    te[0] = vec4(1.0 - ( yy + zz ), xy - wz, xz + wy, 0);
    te[1] = vec4(xy + wz, 1.0 - ( xx + zz ), yz - wx, 0);
    te[2] = vec4(xz - wy, yz + wx, 1.0 - ( xx + yy ), 0);
    te[3] = vec4(0, 0, 0, 1);

    return te;
}

vec3 setFromRotationMatrix(mat4 te) {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    float m11 = te[0][0];
    float m12 = te[0][1];
    float m13 = te[0][2];
    float m21 = te[1][0];
    float m22 = te[1][1];
    float m23 = te[1][2];
    float m31 = te[2][0];
    float m32 = te[2][1];
    float m33 = te[2][2];
    if (abs(m13) < 0.99999){
        return vec3(atan(-m23, m33), asin(clamp(m13, -1.0, 1.0)), atan(-m12, m11));
    }
    return vec3(atan(m32, m22), asin(clamp(m13, -1.0, 1.0)), 0);
}

vec3 eulerFromQuaternion(vec4 q){
    return setFromRotationMatrix(makeRotationMatrixFromQuaternion(q));
}

vec4 quaternionFromEuler(vec3 euler) {

    float c1 = cos(euler[0]/2.0);
    float c2 = cos(euler[1]/2.0);
    float c3 = cos(euler[2]/2.0);
    float s1 = sin(euler[0]/2.0);
    float s2 = sin(euler[1]/2.0);
    float s3 = sin(euler[2]/2.0);

    return vec4(s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3);
}

vec4 quaternionFromAxisAngle(vec3 axis, float angle) {
    float halfAngle = angle/2.0;
    float s = sin(halfAngle);
    return vec4(s*axis, cos(halfAngle));
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

float neighborSign(float i){
    if (mod(i+0.001,2.0) < 0.5) return -1.0;
    return 1.0;
}

vec3 neighborOffset(float i, int neighborAxis){
    vec3 offset = vec3(0);
    if (neighborAxis == 0) offset[0] = neighborSign(i)*u_latticePitch[0];
    else if (neighborAxis == 1) offset[1] = neighborSign(i)*u_latticePitch[1];
    else if (neighborAxis == 2) offset[2] = neighborSign(i)*u_latticePitch[2];
    return offset;
}

int calcNeighborAxis(int i){
    return int(floor(float(i)/2.0+0.001));
}

int convertToInt(float num){
    return int(floor(num+0.001));
}

float getActuatorVoltage(float wireIndex){
    vec2 wireCoord = vec2(0.5, (floor(wireIndex*4.0+0.001)+0.5)/u_wiresMetaLength);
    vec4 wireMeta = texture2D(u_wiresMeta, wireCoord);
    int type = convertToInt(1.2);
    if (type == -1) {
        //no signal connected
        return 0.0;
    }
    float frequency = wireMeta[1];
    float period = 1.0/frequency;
    float phase = wireMeta[2];
    float currentPhase = mod(u_time + phase*period, period)/period;
    if (type == 0){
        return 0.5*sin(2.0*M_PI*currentPhase);
    }
    if (type == 1){
        float pwm = wireMeta[3];
        if (currentPhase < pwm) return 0.5;
        return -0.5;
    }
    if (type == 2){
        if (wireMeta[3]>0.5) return 0.5-currentPhase;
        return currentPhase-0.5;
    }
    if (type == 3){
        if (currentPhase < 0.5) return currentPhase*2.0-0.5;
        return 0.5-(currentPhase-0.5)*2.0;
    }
    return 0.0;
}

void main(){

    vec2 fragCoord = gl_FragCoord.xy;
    vec2 scaledFragCoord = fragCoord/u_textureDim;

    float isFixed = texture2D(u_fixed, scaledFragCoord).x;
    if (isFixed < 0.0 || isFixed == 1.0){//no cell or is fixed
        gl_FragColor = vec4(0,0,0,1);
        return;
    }

    vec3 translation = texture2D(u_lastTranslation, scaledFragCoord).xyz;
    vec4 quaternion = texture2D(u_lastQuaternion, scaledFragCoord);

    vec3 rTotal = vec3(0);
    float rContrib = 0.0;

    for (float i=0.0;i<2.0;i+=1.0){

        float xIndex = 2.0*(fragCoord.x-0.5) + 0.5;
        if (i>0.0) xIndex += 1.0;

        vec2 mappingIndex = vec2(xIndex/(u_textureDim.x*2.0), scaledFragCoord.y);
        vec3 neighborsXMapping = texture2D(u_neighborsXMapping, mappingIndex).xyz;
        vec3 neighborsYMapping = texture2D(u_neighborsYMapping, mappingIndex).xyz;
        vec3 compositeKs = texture2D(u_compositeKs, mappingIndex).xyz;

        vec4 wiring = texture2D(u_wires, mappingIndex);
        bool isActuator = wiring.x < 0.5;//-1

        for (int j=0;j<3;j++){
            if (neighborsXMapping[j] < 0.0) continue;//no neighbor

            int neighborAxis = calcNeighborAxis(j);

            vec2 neighborIndex = vec2(neighborsXMapping[j], neighborsYMapping[j]);
            neighborIndex.x += 0.5;
            neighborIndex.y += 0.5;
            vec2 scaledNeighborIndex = neighborIndex/u_textureDim;

            vec3 neighborTranslation = texture2D(u_lastTranslation, scaledNeighborIndex).xyz;
            vec4 neighborQuaternion = texture2D(u_lastQuaternion, scaledNeighborIndex);
            vec3 neighborEuler = eulerFromQuaternion(neighborQuaternion);

            vec3 nominalD = neighborOffset(i*3.0+float(j), neighborAxis);
            vec3 actuatedD = vec3(nominalD[0], nominalD[1], nominalD[2]);
            float actuation = 0.0;
            if (isActuator){
                if (neighborAxis == 0 && wiring[1]>0.1){//>0
                    actuation += 0.3*getActuatorVoltage(wiring[1]-1.0);
                } else if (neighborAxis == 1 && wiring[2]>0.1){
                    actuation += 0.3*getActuatorVoltage(wiring[2]-1.0);
                } else if (neighborAxis == 2 && wiring[3]>0.1){
                    actuation += 0.3*getActuatorVoltage(wiring[3]-1.0);
                }
            }
            vec4 neighborWiring = texture2D(u_wires, scaledNeighborIndex);
            if (neighborWiring[0] < 0.5){
                if (neighborWiring[1]>0.1){
                    actuation += 0.3*getActuatorVoltage(neighborWiring[1]-1.0);
                } else if (neighborWiring[2]>0.1){
                    actuation += 0.3*getActuatorVoltage(neighborWiring[1]-1.0);
                } else if (neighborWiring[3]>0.1){
                    actuation += 0.3*getActuatorVoltage(neighborWiring[1]-1.0);
                }
            }
            if (neighborAxis == 0) actuatedD[0] *= 1.0+actuation;
            else if (neighborAxis == 1) actuatedD[1] *= 1.0+actuation;
            else if (neighborAxis == 2) actuatedD[2] *= 1.0+actuation;

            vec3 D = neighborTranslation-translation+nominalD;

            vec3 halfNominalD = actuatedD*0.5;
            vec3 rotatedHalfNomD = applyQuaternion(halfNominalD, quaternion);
            vec3 neighbRotatedHalfNomD = applyQuaternion(halfNominalD, neighborQuaternion);
            vec3 rotatedNominalD = rotatedHalfNomD + neighbRotatedHalfNomD;

            float k = compositeKs[j];

            //non-axial rotation
            vec4 nonAxialRotation = quaternionFromUnitVectors(normalize(nominalD), normalize(D));

            //axial rotation
            vec3 axis = rotatedNominalD;//neighbRotatedHalfNomD
            float angle = dot(neighborEuler, normalize(axis));
            vec4 torsion = quaternionFromAxisAngle(normalize(nominalD), angle);

            vec3 rotaionEuler = eulerFromQuaternion(multiplyQuaternions(nonAxialRotation, torsion));
            rTotal += rotaionEuler*k;
            rContrib += k;
        }
    }

    gl_FragColor = quaternionFromEuler(rTotal/rContrib);
}