/**
 * Created by ghassaei on 2/10/16.
 */

//create an arrow object3D
define(['three', 'threeModel'], function(THREE, three){

    var arrowGeometry = new THREE.CylinderGeometry(0, 1, 1);
    var axisGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1);
    arrowGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));
    axisGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));

    function Arrow(direction, diameter, length, material, position){
        if (!material) material = new THREE.MeshBasicMaterial({color: "#FF0000"});
        if (!diameter) diameter = 1;
        var xAxisMesh = new THREE.Mesh(axisGeometry, material);
        var xArrowMesh = new THREE.Mesh(arrowGeometry, material);
        var object3D = new THREE.Object3D();
        object3D.add(xArrowMesh);
        object3D.add(xAxisMesh);
        this.object3D = object3D;
        xArrowMesh.scale.set(diameter, 1, diameter);
        xAxisMesh.scale.set(diameter, 1, diameter);

        if (position) this.setPosition(position);
        if (length) this.setLength(length);
        if (direction) this.setDirection(direction);
    }

    Arrow.prototype.setLength = function(length){
        this.object3D.children[1].scale.y  = length;
        this.object3D.children[0].position.y = length;
    };

    Arrow.prototype.setPosition = function(position){
        this.object3D.position.set(position.x, position.y, position.z);
    };

    Arrow.prototype.setDirection = function(direction){
        var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        var euler = new THREE.Euler().setFromQuaternion(quaternion);
        this.object3D.rotation.set(euler.x, euler.y, euler.z);
    };

    Arrow.prototype.getObject3D = function(){
        return this.object3D;
    };

    Arrow.prototype.destroy = function(){
        this.object3D = null;
    };

    Arrow.prototype.setVisibility = function(visible){
        this.object3D.visible = visible;
    };

    return Arrow;
});