/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'threeModel', 'appState', 'lattice', 'cell', 'three', 'highlighter'],
    function(_, Backbone, three, appState, lattice, DMACell, THREE, Highlighter){

    return Highlighter.extend({

        _makeGeometry: function(){

            var rad = 1/Math.sqrt(3);
            var geometry = new THREE.CylinderGeometry(rad, rad, 0.01, 3);//short triangular prism
            geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
            return geometry;
        },

        _setRotation: function(){
            this.mesh.rotation.set(0,0,(this.highlightedObject.getAbsoluteIndex().z+1)%2*Math.PI);
        }

    });
});