/**
 * Created by aghassaei on 2/1/15.
 */


define(['underscore', 'backbone', 'threeModel', 'appState', 'lattice', 'cell', 'three'],
    function(_, Backbone, three, appState, lattice, DMACell, THREE){

    return Backbone.View.extend({

        mesh: null,
        highlightedObject: null,
        direction: null,

        initialize: function(){

            var geometry = this._makeGeometry();
            this.mesh = new THREE.Mesh(geometry,
                new THREE.MeshBasicMaterial({
                    transparent:true,
                    opacity:0.4,
                    color:0xffffff
                }));

            three.sceneAdd(this.mesh);
            this.hide();

            //bind events
            this.listenTo(lattice, "change:superCellRange", this._superCellParamDidChange);
            this.listenTo(appState, "change:superCellIndex", this._superCellParamDidChange);

            this.listenTo(appState, "change:deleteMode", this._updateDeleteMode);
        },




        //visibility

        hide: function(){
            this._setVisibility(false);
        },

        show: function(forceRender){
            this._setVisibility(true, forceRender);
        },

        _setVisibility: function(visible, forceRender){
            visible = appState.get("highlighterIsVisible") && visible;
            if (forceRender || this.isVisible() != visible){
                this.mesh.visible = visible;
                three.render();
            }
            this.mesh.visible = visible;
        },

        isVisible: function(){
            return this.mesh.visible;
        },

        setNothingHighlighted: function(){
            this.setDeleteMode(this.highlightedObject, false);
            this.highlightedObject = null;
            this.direction = null;
            this.position = null;
            this.hide();
        },

        _updateDeleteMode: function(){
            this.setDeleteMode(this.highlightedObject, appState.get("deleteMode"));
        },

        setDeleteMode: function(object, state){
            if (object && object.setDeleteMode) {
                if (state) this.hide();
                this.highlightedObject.setDeleteMode(state);
            }
        },




        //highlight

        highlight: function(intersection){
            if (!intersection.object) return;
            var highlighted = intersection.object.parent;//cell mesh parent is object3d
            if (!highlighted.myParent) {//myParent is cell instance
                console.warn("no parent for highlighted object");
                return;
            }

            if (this.highlightedObject != highlighted.myParent) this.setDeleteMode(this.highlightedObject, false);
            this.highlightedObject = highlighted.myParent;

            if (appState.get("deleteMode")) {
                this.setDeleteMode(this.highlightedObject, true);
                return;
            }

            var params = this.highlightedObject.calcHighlighterParams(intersection.face, intersection.point);
            if (!params) {//may be hovering over a face that we shouldn't highlight
                this.hide();
                return;
            }
            this.position = params.position;
            this.direction = params.direction;
            this._setPosition(params.position, params.direction);//position of center point
            this._setRotation(params.direction);

            this.show(true);
        },




        //position/scale/rotation

        getHighlightedObjectPosition: function(){//origin selection
            if (this.highlightedObject instanceof DMACell) {
                var position = this.highlightedObject.getPosition();
                return new THREE.Vector3(parseFloat(position.x.toFixed(4)),
                    parseFloat(position.y.toFixed(4)),
                    parseFloat(position.z.toFixed(4)));
            }
            console.warn("highlighted object is not a DMACell")
            return null;
        },

        _setPosition: function(position, direction){
            this.mesh.position.set(position.x, position.y, position.z);
        },

        _setRotation: function(direction){
            this.mesh.rotation.set(direction.y*Math.PI/2, direction.x*Math.PI/2, 0);
        },

        _superCellParamDidChange: function(){
            if (this.updateGikLength) this.updateGikLength();
        },




        //add/remove cells

        _getNextCellPosition: function(){//add direction vector to current index
            var newIndex = this.highlightedObject.getAbsoluteIndex().clone();
            var direction = this.direction;
            _.each(_.keys(newIndex), function(key){
                newIndex[key] = Math.round(newIndex[key] + direction[key]);
            });
            return newIndex;
        },

        addRemoveVoxel: function(shouldAdd){
            if (shouldAdd){
                if (!this.isVisible() || !this.highlightedObject) return;
                lattice.addCellAtIndex(this._getNextCellPosition());
            } else {
                if (!this.highlightedObject) return;
                if (!(this.highlightedObject instanceof DMACell)) return;
                lattice.removeCell(this.highlightedObject);
            }
            this.setNothingHighlighted();
        },

        destroy: function(){
            this.setNothingHighlighted();
            three.sceneRemove(this.mesh);
            this.mesh = null;
            this.stopListening();
        }
    });
});