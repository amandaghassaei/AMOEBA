/**
 * Created by aghassaei on 1/18/15.
 */

//a draggable vector that moves a mesh face, singleton for now

function MeshHandle(three){
    //init invisible arrow and add to scene
    this.arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 10, 0x000000);
//    this.arrow.visibility = false;
//    three.sceneAdd(this.arrow);
}

MeshHandle.prototype.updatePosition = function(origin, normal){
    this.arrow.position.set(origin);
    this.arrow.setDirection(normal);
};

MeshHandle.prototype.setForFaces = function(faces, vertices){
    if (!faces || faces.length<1) console.warn("no faces passed in to mesh handle");

    var mutuallyExclusiveVertices = [faces[1].a, faces[1].b, faces[1].c];
    _.each([faces[0].a, faces[0].b, faces[0].c], function(vertex){
        if (mutuallyExclusiveVertices.indexOf(vertex) == -1) mutuallyExclusiveVertices.push(vertex);
        else mutuallyExclusiveVertices.remove(vertex);
    });
    if (mutuallyExclusiveVertices.length != 2) console.warn("not a square face");
    var origin = numeric.mul(numeric.add(vertices[mutuallyExclusiveVertices[0]], vertices[mutuallyExclusiveVertices[1]]), 0.5);

    this.arrow.position.set(origin);
    this.arrow.setDirection(faces[0].normal);
    this.arrow.visibility = true;
};

MeshHandle.prototype.hide = function(){
    this.arrow.visibility = false;
};