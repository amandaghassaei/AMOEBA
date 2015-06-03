/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'threeModel', 'appState', 'lattice', 'cell', 'three', 'highlighter'],
    function(_, Backbone, three, appState, lattice, DMACell, THREE, Highlighter){

    return Highlighter.extend({

        _makeGeometry: function(){
            return new THREE.SphereGeometry(0.2);
        },

        _setRotation: function(){}

    });
});