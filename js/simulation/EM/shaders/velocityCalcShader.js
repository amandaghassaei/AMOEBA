#define M_PI 3.1415926535897932384626433832795

precision mediump float;

uniform vec2 u_textureDim;
uniform vec3 u_gravity;
uniform float u_dt;
uniform float u_multiplier;
uniform vec3 u_latticePitch;
uniform float u_wiresMetaLength;
uniform float u_time;


uniform sampler2D u_lastVelocity;
uniform sampler2D u_lastTranslation;
uniform sampler2D u_mass;
uniform sampler2D u_fixed;
uniform sampler2D u_neighborsXMapping;
uniform sampler2D u_neighborsYMapping;
uniform sampler2D u_compositeKs;
uniform sampler2D u_compositeDs;
uniform sampler2D u_originalPosition;
uniform sampler2D u_lastQuaternion;
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
    return vec3(ix * qw + iw * - qx + iy * - qz - iz * - qy, iy * qw + iw * - qy + iz * - qx - ix * - qz,
        iz * qw + iw * - qz + ix * - qy - iy * - qx);
}

float neighborSign(float i){
    if (mod(i+0.001,2.0) < 0.5) return -1.0;
    return 1.0;
}

vec3 neighborOffset(float i){
    vec3 offset = vec3(0);
    int neighborAxis = int(floor(i/2.0+0.001));
    if (neighborAxis == 0) offset[0] = neighborSign(i)*u_latticePitch[0];
    else if (neighborAxis == 1) offset[1] = neighborSign(i)*u_latticePitch[1];
    else if (neighborAxis == 2) offset[2] = neighborSign(i)*u_latticePitch[2];
    return offset;
}

int calcNeighborAxis(float i){
    return int(floor(i/2.0+0.001));
}

int convertToInt(float num){
    return int(floor(num+0.001));
}

float getActuatorVoltage(float wireIndex){
    vec2 wireCoord = vec2(0.5, (floor(wireIndex+0.001)+0.5)/u_wiresMetaLength);
    vec4 wireMeta = texture2D(u_wiresMeta, wireCoord);
    int type = convertToInt(wireMeta[0]);
    if (type == -1) {
        //no signal connected
        return 0.0;
    }
    float frequency = wireMeta[1];
    float period = 1.0/frequency;
    float phase = wireMeta[2];
    float currentPhase = mod(u_time+phase*period, period)/period;
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
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }

    float mass = texture2D(u_mass, scaledFragCoord).x;
    vec3 lastTranslation = texture2D(u_lastTranslation, scaledFragCoord).xyz;
    vec3 lastVelocity = texture2D(u_lastVelocity, scaledFragCoord).xyz;
    vec4 quaternion = texture2D(u_lastQuaternion, scaledFragCoord);

    vec4 wiring = texture2D(u_wires, scaledFragCoord);
    bool isActuator = wiring[0] < -0.5;//-1

    vec3 force = u_gravity*mass;

    //simple collision
    float zPosition = texture2D(u_originalPosition, scaledFragCoord).z + lastTranslation.z*u_multiplier;
    float collisionK = 1.0;
    if (zPosition < 0.0) force.z = force.z -zPosition*collisionK-lastVelocity.z*collisionK/10.0;

    for (float i=0.0;i<2.0;i+=1.0){

        float xIndex = 2.0*(fragCoord.x-0.5) + 0.5;
        if (i>0.0) xIndex += 1.0;

        vec2 mappingIndex = vec2(xIndex/(u_textureDim.x*2.0), scaledFragCoord.y);
        vec3 neighborsXMapping = texture2D(u_neighborsXMapping, mappingIndex).xyz;
        vec3 neighborsYMapping = texture2D(u_neighborsYMapping, mappingIndex).xyz;
        vec3 compositeKs = texture2D(u_compositeKs, mappingIndex).xyz;
        vec3 compositeDs = texture2D(u_compositeDs, mappingIndex).xyz;


        for (int j=0;j<3;j++){
            if (neighborsXMapping[j] < 0.0) continue;//no neighbor

            int neighborAxis = calcNeighborAxis(i*3.0+float(j));

            vec2 neighborIndex = vec2(neighborsXMapping[j], neighborsYMapping[j]);
            neighborIndex.x += 0.5;
            neighborIndex.y += 0.5;

            vec2 scaledNeighborIndex = neighborIndex/u_textureDim;
            vec3 neighborTranslation = texture2D(u_lastTranslation, scaledNeighborIndex).xyz;
            vec3 neighborVelocity = texture2D(u_lastVelocity, scaledNeighborIndex).xyz;
            vec4 neighborQuaternion = texture2D(u_lastQuaternion, scaledNeighborIndex);

            vec3 nominalD = neighborOffset(i*3.0+float(j));
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
            if (neighborWiring[0] < -0.5){
                if (neighborAxis == 0 && neighborWiring[1]>0.1){
                    actuation += 0.3*getActuatorVoltage(neighborWiring[1]-1.0);
                } else if (neighborAxis == 1 && neighborWiring[2]>0.1){
                    actuation += 0.3*getActuatorVoltage(neighborWiring[2]-1.0);
                } else if (neighborAxis == 2 && neighborWiring[3]>0.1){
                    actuation += 0.3*getActuatorVoltage(neighborWiring[3]-1.0);
                }
            }
            if (neighborAxis == 0) actuatedD[0] *= 1.0+actuation;
            else if (neighborAxis == 1) actuatedD[1] *= 1.0+actuation;
            else if (neighborAxis == 2) actuatedD[2] *= 1.0+actuation;

            vec3 rotatedNomD = applyQuaternion(actuatedD, quaternion);
            vec3 neighbRotatedNomD = applyQuaternion(actuatedD, neighborQuaternion);
            vec3 rotatedNominalD = (rotatedNomD + neighbRotatedNomD)*0.5;


            float k = compositeKs[j];
            float d = 0.01;//compositeDs[j];

            force += k*(neighborTranslation - lastTranslation + nominalD - rotatedNominalD) + d*(neighborVelocity - lastVelocity);
        }
    }


    vec3 velocity = lastVelocity + force/mass*u_dt;
    gl_FragColor = vec4(velocity, 0);
}