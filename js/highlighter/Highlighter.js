/**
 * Created by aghassaei on 2/1/15.
 */


define(['underscore', 'backbone', 'threeModel', 'appState', 'lattice', 'cell', 'three', 'globals', 'arrow'],
    function(_, Backbone, three, appState, lattice, DMACell, THREE, globals, Arrow){

    return Backbone.Model.extend({

        mesh: null,
        highlightedObject: null,
        direction: null,
        
        defaults: {
            fillRect: null,
            sketchEditMode: false
        },

        initialize: function(){

            var geometry = this._makeGeometry();
            this.mesh = new THREE.Mesh(geometry,
                new THREE.MeshBasicMaterial({
                    transparent:true,
                    opacity:0.4,
                    color:0xffffff
                }));
            if (this._makeWireframe) this._makeWireframe(this.mesh);

            three.sceneAdd(this.mesh);
            this._setScale();
            this.hide();

            //bind events
            this.listenTo(appState, "change:deleteMode", this._updateDeleteMode);
            this.listenTo(globals.baseplane, "change:planeType", this.destroyFillRect);

            if (this._initialize) this._initialize();
        },




        //visibility

        hide: function(){
            this._setVisibility(false);
        },

        show: function(forceRender){
            this._setVisibility(true, forceRender);
        },

        _setVisibility: function(visible, forceRender){
            if (!this.mesh) return;
            visible = appState.get("highlighterIsVisible") && visible;
            if (forceRender || this.isVisible() != visible){
                this.mesh.visible = visible;
                three.render();
            }
            this.mesh.visible = visible;
        },

        isVisible: function(){
            return this.mesh && this.mesh.visible;
        },

        setNothingHighlighted: function(){
            if (appState.get("deleteMode")) this.setDeleteMode(this.highlightedObject, false);
            if (this.highlightedObject && this.highlightedObject instanceof Arrow) this.highlightedObject.highlight(false);
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
                object.getParent().setDeleteMode(state);
            }
            three.render();
        },




        //highlight

        highlight: function(intersection){
            if (!intersection.object) return;
            var highlighted = intersection.object.parent;//cell mesh parent is object3d
            if (!highlighted.myParent) {//myParent is cell instance
                console.warn("no parent for highlighted object");
                console.warn(highlighted);
                return;
            }

            var lastHighlighted = this.highlightedObject;

            if (appState.get("deleteMode") && this.highlightedObject != highlighted.myParent) this.setDeleteMode(this.highlightedObject, false);
            this.highlightedObject = highlighted.myParent;

            if (appState.get("deleteMode")) {
                this.setDeleteMode(this.highlightedObject, true);
                return;
            }

            if (this.highlightedObject instanceof Arrow){
                if (lastHighlighted == this.highlightedObject) return;
                if (lastHighlighted && lastHighlighted instanceof Arrow) lastHighlighted.highlight(false);
                this.get("fillRect").highlight(this.highlightedObject, true);
                return;
            }

            var params = this.highlightedObject.calcHighlighterParams(intersection.face, intersection.point);
            if (!params) {//may be hovering over a face that we shouldn't highlight
                this.hide();
                return;
            }

            if (appState.get("showOneLayer")){//in single layer mode
                if (this.highlightedObject instanceof DMACell) {
                    var normalAxis = globals.baseplane.getNormalAxis();
                    if (Math.abs(params.direction[normalAxis]) > 0.1) {
                        this.hide();
                        return;
                    }
                }
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
                var position = this.highlightedObject.getAbsolutePosition();
                return new THREE.Vector3(parseFloat(position.x.toFixed(4)),
                    parseFloat(position.y.toFixed(4)),
                    parseFloat(position.z.toFixed(4)));
            }
            console.warn("highlighted object is not a DMACell");
            return null;
        },

        _setPosition: function(position, direction){
            this.mesh.position.set(position.x, position.y, position.z);
        },

        _setRotation: function(direction){
            this.mesh.rotation.set(direction.y*Math.PI/2, direction.x*Math.PI/2, 0);
        },

        _setScale: function(){
        },




        //add/remove cells

        _getNextCellIndex: function(){//add direction vector to current index
            var newPosition;
            if (this.highlightedObject.nextCellPosition) newPosition = this.highlightedObject.nextCellPosition(this.mesh.position.clone());
            else newPosition = this.mesh.position.clone().add(this.mesh.position.clone().sub(this.highlightedObject.getAbsolutePosition()));
            return lattice.getIndexForPosition(newPosition);
        },

        mouseDown: function(){
            if (appState.get("shift")){//create new fill rect
                if (!this.isVisible() || !this.highlightedObject) return;
                var self = this;
                this.destroyFillRect();
                require(['fillRect'], function(FillRect){
                    self.set("fillRect", new FillRect({bound: self._getNextCellIndex()}));
                    three.render();
                });
            }
            //push pull arrows
            if (this.highlightedObject && this.highlightedObject instanceof Arrow){
                this.get("fillRect").pushPullArrow();
            }
        },

        destroyFillRect: function(){
            if (this.get("fillRect")) this.get("fillRect").destroy();
            this.set("fillRect", null);
            this.set("sketchEditMode", false);
            three.render();
        },

        adjustFillRect: function(){
            if (!this.get("fillRect")){
                console.warn("no fill rect to adjust");
                return;
            }
            this.get("fillRect").setBound(this._getNextCellIndex());
            this.hide();
        },

        addRemoveVoxel: function(shouldAdd){
            if (this.get("fillRect")){
                this.set("sketchEditMode", true);
                return;
            }
            if (shouldAdd){
                if (!this.isVisible() || !this.highlightedObject) return;
                lattice.getUItarget().addCellAtIndex(this._getNextCellIndex());
            } else {
                if (!this.highlightedObject) return;
                if (!(this.highlightedObject instanceof DMACell)) return;
                lattice.getUItarget().removeCell(this.highlightedObject.getParent());
            }
            this.setNothingHighlighted();
        },

        destroy: function(){
            this.destroyFillRect();
            this.setNothingHighlighted();
            three.sceneRemove(this.mesh);
            this.mesh = null;
            this.stopListening();
        }
    });
});