/**
 * Created by aghassaei on 2/1/15.
 */

Highlighter = Backbone.View.extend({

    mesh: null,
    highlightedObject: null,
    index: null,
    direction: null,

    initialize: function(){

        var geometry = this._makeGeometry();
        this.mesh = new THREE.Mesh(geometry,
            new THREE.MeshBasicMaterial({
                side:THREE.DoubleSide,
                transparent:true,
                opacity:0.4,
                color:0xffffff,
                vertexColors:THREE.FaceColors
            }));

        globals.three.sceneAdd(this.mesh, null);
        this.hide();

        //bind events
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
        visible = globals.appState.get("highlighterIsVisible") && visible;
        if (forceRender || this.isVisible() != visible){
            this.mesh.visible = visible;
            globals.three.render();
        }
        this.mesh.visible = visible;
    },

    isVisible: function(){
        return this.mesh.visible;
    },

    setNothingHighlighted: function(){
        this.highlightedObject = null;
        this.index = null;
        this.direction = null;
        this.position = null;
        this.hide();
    },

    highlight: function(intersection){
        if (!intersection.object) return;
        var highlighted = intersection.object;
        if (!(highlighted.parent instanceof THREE.Scene)) highlighted = highlighted.parent;//cell mesh parent is object3d
        if (!highlighted.myParent) console.warn("no parent for highlighted object");

        this.highlightedObject = highlighted.myParent;

        var highlightedPos = highlighted.myParent.calcHighlighterPosition(intersection.face, intersection.point);
        this.index = highlightedPos.index;
        this.position = highlightedPos.position;//todo used just for gik
        if (!highlightedPos.direction) {//may be hovering over a face that we shouldn't highlight
            this.hide();
            return;
        }
        this.direction = highlightedPos.direction;
        this._setPosition(highlightedPos.position, this.direction);//position of center point
        this._setRotation(this.direction, this.index);

        this.show(true);
    },

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////POSITION/SCALE////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    getHighlightedObjectPosition: function(){
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

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////ADD REMOVE////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    _getNextCellPosition: function(){//add direction vector to current index
        var newIndex = _.clone(this.index);
        var direction = this.direction;
        _.each(_.keys(newIndex), function(key){
            newIndex[key] = Math.round(newIndex[key] + direction[key]);
        });
        return newIndex;
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible() || !this.highlightedObject) return;
            if (globals.lattice.get("connectionType") == "freeformFace"){
                //todo make this work for baseplane
                globals.lattice.addFreeFormCell(this.mesh.position.clone(), this.highlightedObject.getOrientation(), this.direction, this.highlightedObject.getType());
                return;
            }
            globals.lattice.addCellAtIndex(this._getNextCellPosition());
        } else {
            if (!this.highlightedObject) return;
            if (!(this.highlightedObject instanceof DMACell)) return;
            globals.lattice.removeCell(this.highlightedObject);
        }
        this.setNothingHighlighted();
    },

    destroy: function(){
        this.setNothingHighlighted();
        globals.three.sceneRemove(this.mesh, null);
        this.mesh = null;
        this.stopListening();
    }
});

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////OCTA//////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

OctaFaceHighlighter = Highlighter.extend({

    _makeGeometry: function(){

        var rad = 1/Math.sqrt(3);
        var geometry = new THREE.CylinderGeometry(rad, rad, 0.01, 3);//short triangular prism
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
        return geometry;
    },

    _setRotation: function(){
        this.mesh.rotation.set(0,0,(this.index.z+1)%2*Math.PI);
    }

});

OctaEdgeHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.SphereGeometry(0.2);
    },

    _setRotation: function(){}

});

OctaVertexHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.SphereGeometry(0.2);
    }

});

OctaFreeFormHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.SphereGeometry(0.2);
    },

    _setRotation: function(){}
});

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CUBE /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

CubeHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.BoxGeometry(1,1,0.01);
    }

});

GIKHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.BoxGeometry(1,1,globals.lattice.zScale(0));
    },

    _setPosition: function(position, direction){
        this.mesh.position.set(position.x+direction.x/2, position.y+direction.y/2, position.z+globals.lattice.zScale()*direction.z/2);
    },

    _setRotation: function(direction, index){
        var superCellIndex = globals.appState.get("superCellIndex");
        if ((index.z%2 == 0 && Math.abs(direction.z) > 0.9) || (index.z%2 != 0 && Math.abs(direction.z) < 0.1))
            this.mesh.rotation.set(0, 0, Math.PI/2);
        else this.mesh.rotation.set(0,0,0);
        this.mesh.translateX(superCellIndex - this.mesh.scale.x/2 + 0.5);
    },

    updateGikLength: function(){
        if (!this.mesh) return;
        this.mesh.scale.set(globals.lattice.get("gikLength"), 1, 1);
        globals.three.render();
        if (!this.direction) return;
        this._setPosition(this.position, this.direction);//position of center point
        this._setRotation(this.direction, this.index);
        globals.three.render();
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible() || !this.highlightedObject) return;
            var position = this._getNextCellPosition();
            var index = globals.appState.get("superCellIndex");
            var min, max;
            if (this.mesh.rotation.z == 0) {
                min = {x:position.x-globals.lattice.get("gikLength")+1+index, y:position.y, z:position.z};
                max = {x:position.x+index, y:position.y, z:position.z};
            }
            else {
                min = {x:position.x, y:position.y-globals.lattice.get("gikLength")+1+index, z:position.z};
                max = {x:position.x, y:position.y+index, z:position.z};
            }
            var range = {min:min, max:max};
            globals.lattice.makeSuperCell(range);
        } else {
            if (!this.highlightedObject) return;
            if (!(this.highlightedObject instanceof DMACell)) return;
            globals.lattice.removeCell(this.highlightedObject);
        }
        this.setNothingHighlighted();
    }
});


TruncatedCubeHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.BoxGeometry(1,1,0.01);
    },

    _setRotation: function(direction){
        this.mesh.rotation.set(direction.y*Math.PI/2, direction.x*Math.PI/2, Math.PI/4);
    }

});