/**
 * Created by aghassaei on 1/22/15.
 */


function ExtrudeVisualizer(){

    var triRad = 30*Math.sqrt(3)/4;
    var geometry = new THREE.CylinderGeometry(triRad, triRad, 1, 3);//1 unit tall
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
    var material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.2});
    var meshes = [];

    function makeMeshFromProfile(profiles){//profiles is an array of meshes
        _.each(profiles, function(profile){
            var mesh = new THREE.Mesh(geometry, material);
            var profilePos = profile.geometry.vertices[0];
            mesh.position.x = profilePos.x;
            mesh.position.y = profilePos.y;
            mesh.position.z = profilePos.z;
//            dmaGlobals.three.sceneAdd(mesh, false);
            meshes.push(mesh);
        });
        dmaGlobals.three.render();
    }

    function makeHandle(){

    }

    function getMeshNum(){
        return meshes.length;
    }

    function dragHandle(height){
        _.each(meshes, function(mesh){
            mesh.scale.z = height;
        })
        dmaGlobals.three.render();
    }

    function renderIntoCells(){

    }

    return {//return public properties/methods
        makeMeshFromProfile:makeMeshFromProfile,
        getMeshNum:getMeshNum,
        dragHandle:dragHandle
    }
}