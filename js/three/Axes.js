/**
 * Created by aghassaei on 8/18/15.
 */


define(['three', 'threeModel'], function(THREE, three){

    var radius = 0.5;
    var height = 20;

    var arrowGeometry = new THREE.CylinderGeometry(0, 2 * radius, height / 5);
    var axisGeometry = new THREE.CylinderGeometry(radius, radius, height);

    var xAxisMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var xAxisMesh = new THREE.Mesh(axisGeometry, xAxisMaterial);
    var xArrowMesh = new THREE.Mesh(arrowGeometry, xAxisMaterial);
    xAxisMesh.add(xArrowMesh);
    xArrowMesh.position.y += height / 2;
    xAxisMesh.rotation.z  -= 90 * Math.PI / 180;
    xAxisMesh.position.x  += height / 2;

    var yAxisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
    var yAxisMesh = new THREE.Mesh(axisGeometry, yAxisMaterial);
    var yArrowMesh = new THREE.Mesh(arrowGeometry, yAxisMaterial);
    yAxisMesh.add(yArrowMesh);
    yArrowMesh.position.y += height / 2;
    yAxisMesh.position.y  += height / 2;

    var zAxisMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});
    var zAxisMesh = new THREE.Mesh(axisGeometry, zAxisMaterial);
    var zArrowMesh = new THREE.Mesh(arrowGeometry, zAxisMaterial);
    zAxisMesh.add(zArrowMesh);
    zAxisMesh.rotation.x  += 90 * Math.PI / 180;
    zArrowMesh.position.y += height / 2;
    zAxisMesh.position.z  += height / 2;

    var axesMesh = new THREE.Object3D();
    axesMesh.add(xAxisMesh);
    axesMesh.add(yAxisMesh);
    axesMesh.add(zAxisMesh);
    three.sceneAdd(axesMesh);
    setVisibility(false);


    function setVisibility(visible){
        axesMesh.visible = visible;
    }

    return {
        setVisibility: setVisibility
    }

});