/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'squareBaseplane'],
    function(_, Backbone, appState, lattice, three, THREE, SquareBasePlane){

    return SquareBasePlane.extend({

        _setPosition: function(object3D, height){
            if (!object3D || object3D === undefined) object3D = this.get("object3D");
            object3D.position.set(0,0,height-lattice.zScale());
        },

        calcHighlighterParams: function(face, point){
            point.z = 0;
            var index = lattice.getIndexForPosition(point);
            index.sub(new THREE.Vector3(0.5, 0.5, 0));
            var params = SquareBasePlane.prototype.calcHighlighterParams.call(this, face, point, index);
            params.position.z -= lattice.zScale()/2;
            return params;
        }

    });
});