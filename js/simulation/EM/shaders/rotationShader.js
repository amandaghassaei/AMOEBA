precision mediump float;

uniform vec2 u_textureDim;
uniform vec3 u_gravity;
uniform float u_dt;

uniform sampler2D u_lastVelocity;
uniform sampler2D u_lastTranslation;
uniform sampler2D u_mass;
uniform sampler2D u_fixed;
uniform sampler2D u_neighborsXMapping;
uniform sampler2D u_neighborsYMapping;
uniform sampler2D u_compositeKs;
uniform sampler2D u_compositeDs;


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

    vec3 force = u_gravity*mass;

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

            vec2 neighborIndex = vec2(neighborsXMapping[j], neighborsYMapping[j]);
            neighborIndex.x += 0.5;
            neighborIndex.y += 0.5;

            vec2 scaledNeighborIndex = neighborIndex/u_textureDim;
            vec3 neighborTranslation = texture2D(u_lastTranslation, scaledNeighborIndex).xyz;
            vec3 neighborVelocity = texture2D(u_lastVelocity, scaledNeighborIndex).xyz;

            float k = compositeKs[j];
            float d = 0.01;//compositeDs[j];

            force += k*(neighborTranslation-lastTranslation) + d*(neighborVelocity-lastVelocity);
        }
    }


    vec3 acceleration = force/mass;
    vec3 velocity = lastVelocity + acceleration*u_dt;

    gl_FragColor = vec4(velocity, 0);
}