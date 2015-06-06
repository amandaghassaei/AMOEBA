/**
 * Created by aghassaei on 6/2/15.
 */

define(['underscore', 'backbone', 'threeModel', 'appState', 'lattice', 'cell', 'three', 'highlighter'],
    function(_, Backbone, three, appState, lattice, DMACell, THREE, Highlighter){

    return Highlighter.extend({

        _makeGeometry: function(){
            return new THREE.BoxGeometry(lattice.xScale(0),lattice.yScale(0),lattice.zScale(0));
        },

        _setPosition: function(position, direction){
            this.mesh.position.set(position.x+direction.x/2, position.y+direction.y/2, position.z+lattice.zScale()*direction.z/2);
        },

        _setRotation: function(direction){
            if (!this.highlightedObject) return;
            var index = this.highlightedObject.getIndex();
            var superCellIndex = appState.get("superCellIndex");
            if ((index.z%2 == 0 && Math.abs(direction.z) > 0.9) || (index.z%2 != 0 && Math.abs(direction.z) < 0.1))
                this.mesh.rotation.set(0, 0, Math.PI/2);
            else this.mesh.rotation.set(0,0,0);
            this.mesh.translateX(superCellIndex - this.mesh.scale.x/2 + 0.5);
        },

        updateGikLength: function(){
            if (!this.mesh) return;
            this.mesh.scale.set(lattice.get("superCellRange").x, lattice.get("superCellRange").y, lattice.get("superCellRange").z);
            three.render();
            if (!this.direction) return;
            this._setPosition(this.position, this.direction);//position of center point
            this._setRotation(this.direction);
            three.render();
        },

        _getNextCellPosition: function(){//add direction vector to current index
            var newIndex = this.highlightedObject.getIndex();
            var direction = this.direction;
            _.each(_.keys(newIndex), function(key){
                newIndex[key] = Math.round(newIndex[key] + direction[key]);
            });

            var offset = appState.get("superCellIndex");
            if (newIndex.z%2 == 0) newIndex.x -= offset;
            else newIndex.y -= offset;
            return newIndex;
        }
    });
});