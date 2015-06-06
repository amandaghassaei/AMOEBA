/**
 * Created by aghassaei on 6/2/15.
 */

//globals namespace, not sure if there's a way to get around this

define(['three'], function(THREE){
    return {
        baseplane: null,
            highlighter: null,
        materials: {
            deleteMaterial: new THREE.MeshLambertMaterial({color:"#ff0000"})
        }
    };
});