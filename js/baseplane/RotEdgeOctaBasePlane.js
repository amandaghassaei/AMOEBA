/**
 * Created by aghassaei on 6/2/15.
 */


define(['underscore', 'backbone', 'appState', 'lattice', 'threeModel', 'three', 'squareBaseplane'],
    function(_, Backbone, appState, lattice, three, THREE, SquareBasePlane){

    return SquareBasePlane.extend({

        calcHighlighterPosition: function(face, position){
            var index = lattice.getIndexForPosition(position);
            index.z = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
            var latticePosition = lattice.getPositionForIndex(index);
            latticePosition.x -= lattice.xScale()/2;
            latticePosition.y -= lattice.yScale()/2;
            this.index = new THREE.Vector3(index.x, index.y, index.z);//todo no!!!
            return {index: index, direction: new THREE.Vector3(0,0,1), position:latticePosition};
        }
    });
});