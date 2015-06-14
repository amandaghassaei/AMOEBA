/**
 * Created by aghassaei on 6/2/15.
 */

define(['underscore', 'backbone', 'threeModel', 'appState', 'lattice', 'cell', 'three', 'highlighter'],
    function(_, Backbone, three, appState, lattice, DMACell, THREE, Highlighter){

    return Highlighter.extend({

        _initialize: function(){

            //bind events
            this.listenTo(appState, "change:superCellRange", this._superCellParamDidChange);
            this.listenTo(appState, "change:superCellIndex", this._superCellParamDidChange);
        },

        _makeGeometry: function(){
            return new THREE.BoxGeometry(lattice.xScale(),lattice.yScale(),lattice.zScale());
        },

        _makeWireframe: function(mesh){
//            var wireframe = new THREE.BoxHelper(mesh);
//            wireframe.material.color.set(0x000000);
//            wireframe.matrixWorld = mesh.matrixWorld;
//            wireframe.matrixAutoUpdate = true;
//            mesh.add(wireframe);
        },

        _setScale: function(){
            this.mesh.scale.set(appState.get("superCellRange").x, appState.get("superCellRange").y,
                appState.get("superCellRange").z);
        },

        _setPosition: function(position, direction){
            this.mesh.position.set(position.x+lattice.xScale()*direction.x/2, position.y+lattice.yScale()*direction.y/2,
                position.z+lattice.zScale()*direction.z/2);
        },

        _setRotation: function(direction){
            if (!this.highlightedObject) return;
            var index = this.highlightedObject.getAbsoluteIndex();

            if ((index.z%2 == 0 && Math.abs(direction.z) > 0.9) || (index.z%2 != 0 && Math.abs(direction.z) < 0.1))
                this.mesh.rotation.set(0, 0, Math.PI/2);
            else this.mesh.rotation.set(0,0,0);

            var superCellIndex = appState.get("superCellIndex");
            this.mesh.translateX(-(superCellIndex.x + 0.5 - this.mesh.scale.x/2)*lattice.xScale());
            this.mesh.translateY(-(superCellIndex.y + 0.5 - this.mesh.scale.y/2)*lattice.yScale());
            this.mesh.translateZ(-(superCellIndex.z + 0.5 - this.mesh.scale.z/2)*lattice.zScale());
        },

        _superCellParamDidChange: function(){
            if (!this.mesh || !this.direction) return;
            this._setScale();
            this._setPosition(this.position, this.direction);//position of center point
            this._setRotation(this.direction);
            three.render();
        },

        _getNextCellPosition: function(){//add direction vector to current index
            var newIndex = this.highlightedObject.getAbsoluteIndex();
            newIndex.add(this.direction.clone()).round();
            var offset = appState.get("superCellIndex").clone();
            offset.applyQuaternion(this.mesh.quaternion).round();
            newIndex.sub(offset);
            return newIndex;
        }
    });
});