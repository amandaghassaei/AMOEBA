/**
 * Created by aghassaei on 6/2/15.
 */


define(['highlighter', 'three'], function(Highlighter, THREE){

    return Highlighter.extend({

        _makeGeometry: function(){
            return new THREE.SphereGeometry(0.2);
        },

        _setRotation: function(){}

    });
});