/**
 * Created by aghassaei on 2/1/15.
 */


define(['threeModel', 'appState', 'lattice'], function(three, appState, lattice){

    return Backbone.View.extend({

        mesh: null,
        highlightedObject: null,
        direction: null,

        initialize: function(){

            var geometry = this._makeGeometry();
            this.mesh = new THREE.Mesh(geometry,
                new THREE.MeshBasicMaterial({
    //                side:THREE.DoubleSide,
                    transparent:true,
                    opacity:0.4,
                    color:0xffffff
    //                vertexColors:THREE.FaceColors
                }));

            three.sceneAdd(this.mesh, "highlighter");
            this.hide();

            //bind events
            this.listenTo(lattice, "change:superCellRange", this._superCellParamDidChange);
            this.listenTo(appState, "change:superCellIndex", this._superCellParamDidChange);
        },

        ///////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////VISIBILITY////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////

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
            this.highlightedObject = null;
            this.direction = null;
            this.position = null;
            this.hide();
        },

        highlight: function(intersection){
            if (!intersection.object) return;
            var highlighted = intersection.object;
            if (!(highlighted.parent instanceof THREE.Scene)) highlighted = highlighted.parent;//cell mesh parent is object3d
            if (!highlighted.myParent) {
                console.warn("no parent for highlighted object");
                return;
            }

            this.highlightedObject = highlighted.myParent;

            var highlightedPos = this.highlightedObject.calcHighlighterPosition(intersection.face, intersection.point);
            this.position = highlightedPos.position;//todo used just for gik
            if (!highlightedPos.direction) {//may be hovering over a face that we shouldn't highlight
                this.hide();
                return;
            }
            this.direction = highlightedPos.direction;
            this._setPosition(highlightedPos.position, this.direction);//position of center point
            this._setRotation(this.direction);

            this.show(true);
        },

        ///////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////POSITION/SCALE////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////

        getHighlightedObjectPosition: function(){//origin selection
            if (this.highlightedObject instanceof DMACell) {
                var position = this.highlightedObject.getPosition();
                return {
                    x:parseFloat(position.x.toFixed(4)),
                    y:parseFloat(position.y.toFixed(4)),
                    z:parseFloat(position.z.toFixed(4))
                };
            }
            return null;
        },

        _setPosition: function(position){
            this.mesh.position.set(position.x, position.y, position.z);
        },

        _setRotation: function(direction){
            this.mesh.rotation.set(direction.y*Math.PI/2, direction.x*Math.PI/2, 0);
        },

        _superCellParamDidChange: function(){
            if (this.updateGikLength) this.updateGikLength();
        },

        ///////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////ADD REMOVE////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////

        _getNextCellPosition: function(){//add direction vector to current index
            var newIndex = _.clone(this.highlightedObject.getIndex());
            var direction = this.direction;
            _.each(_.keys(newIndex), function(key){
                newIndex[key] = Math.round(newIndex[key] + direction[key]);
            });
            return newIndex;
        },

        addRemoveVoxel: function(shouldAdd){
            if (shouldAdd){
                if (!this.isVisible() || !this.highlightedObject) return;
                if (lattice.get("connectionType") == "freeformFace"){
                    //todo make this work for baseplane
                    lattice.addFreeFormCell(this.mesh.position.clone(), this.highlightedObject.getOrientation(), this.direction, this.highlightedObject.getType());
                    return;
                }
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
            three.sceneRemove(this.mesh, null);
            this.mesh = null;
            this.stopListening();
        }
    });
});