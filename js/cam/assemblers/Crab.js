/**
 * Created by aghassaei on 6/23/15.
 */


define(['stlLoader', 'bin!crabSTL', 'threeModel'], function(THREE, geometry, three){


    var loader = new THREE.STLLoader();
    var unitGeo = preProcessGeo(loader.parse(geometry));

    function preProcessGeo(geo){
        var unitScale = 1/4;
        geo.applyMatrix(new THREE.Matrix4().makeScale(unitScale, unitScale, unitScale));
        geo.applyMatrix(new THREE.Matrix4().makeTranslation(0.6, 0.7, 0.5));
        return geo;
    }

    var mesh = new THREE.Mesh(unitGeo, new THREE.MeshLambertMaterial({color:0x777777, shading:THREE.FlatShading}));
    three.sceneAdd(mesh);
    three.render();

});