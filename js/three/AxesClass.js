/**
 * Created by ghassaei on 5/26/16.
 */


define(['three', "arrow", 'threeModel'], function(THREE, Arrow, three){

    var xAxisMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var yAxisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
    var zAxisMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});

    function AxesClass(diameter, length){
        this.object3D = new THREE.Object3D();
        var xAxis = new Arrow(new THREE.Vector3(1,0,0), diameter, length, xAxisMaterial);
        var yAxis = new Arrow(new THREE.Vector3(0,1,0), diameter, length, yAxisMaterial);
        var zAxis = new Arrow(new THREE.Vector3(0,0,1), diameter, length, zAxisMaterial);
        this.object3D.add(xAxis.getObject3D());
        this.object3D.add(yAxis.getObject3D());
        this.object3D.add(zAxis.getObject3D());
        three.secondPassSceneAdd(this.object3D);
        this.setVisibility(false);
    }

    AxesClass.prototype.setVisibility = function(visible){
        this.object3D.visible = visible;
    };

    AxesClass.prototype.setPosition = function(position){
        this.object3D.position.set(position.x, position.y, position.z);
    };

    AxesClass.prototype.setRotation = function(rotation){
        this.object3D.rotation.set(rotation.x, rotation.y, rotation.z);
    };

    AxesClass.prototype.destroy = function(){
        three.secondPassSceneRemove(this.object3D);
    };

    return AxesClass;
});