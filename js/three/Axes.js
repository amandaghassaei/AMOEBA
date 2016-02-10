/**
 * Created by aghassaei on 8/18/15.
 */


define(['three', 'threeModel', 'arrow'], function(THREE, three, Arrow){

    var xAxisMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var yAxisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
    var zAxisMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});

    var axesMesh = new THREE.Object3D();
    var xAxis = new Arrow(new THREE.Vector3(1,0,0), 0.5, 7, xAxisMaterial);
    var yAxis = new Arrow(new THREE.Vector3(0,1,0), 0.5, 7, yAxisMaterial);
    var zAxis = new Arrow(new THREE.Vector3(0,0,1), 0.5, 7, zAxisMaterial);
    axesMesh.add(xAxis.getObject3D());
    axesMesh.add(yAxis.getObject3D());
    axesMesh.add(zAxis.getObject3D());
    three.secondPassSceneAdd(axesMesh);
    setVisibility(false);


    function setVisibility(visible){
        axesMesh.visible = visible;
    }

    return {
        setVisibility: setVisibility
    }

});