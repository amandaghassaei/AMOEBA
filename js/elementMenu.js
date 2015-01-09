/**
 * Created by aghassaei on 1/8/15.
 */

$(function(){

    $("#elementCube").click(function(e){
        e.preventDefault();

        for ( var i = 0; i < 500; i ++ ) {
            var mesh = createCubeGeometry(10);
            mesh.position.x = ( Math.random() - 0.5 ) * 1000;
            mesh.position.y = ( Math.random() - 0.5 ) * 1000;
            mesh.position.z = ( Math.random() - 0.5 ) * 1000;
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;
            three.scene.add( mesh );
        }
        three.render();
    });

    function createCubeGeometry(size){
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
        return new THREE.Mesh( geometry, material );
    }

});