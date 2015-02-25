/**
 * Created by aghassaei on 2/1/15.
 */

Highlighter = Backbone.View.extend({

    mesh: null,
    highlightedObject: null,
    index: null,
    direction: null,

    initialize: function(options){

        var geometry = this._makeGeometry();
        this.mesh = new THREE.Mesh(geometry,
            new THREE.MeshBasicMaterial({
                side:THREE.DoubleSide,
                transparent:true,
                opacity:0.4,
                color:0xffffff,
                vertexColors:THREE.FaceColors
            }));

        dmaGlobals.three.sceneAdd(this.mesh, null);
        this.updateScale(options.scale);
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
        if (forceRender || this.isVisible() != visible){
            this.mesh.visible = visible;
            dmaGlobals.three.render();
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
        if (!highlightedPos.direction) {//may be hovering over a face that we shouldn't highlight
            this.hide();
            return;
        }
        this.direction = highlightedPos.direction;
        this._setPosition(highlightedPos.position, this.direction);//position of center point

        this.show(true);
    },

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////POSITION/SCALE////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    updateScale: function(scale){
        this.mesh.scale.set(scale, scale, scale);
    },

    _setPosition: function(position, direction){
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotation.set(direction.y*Math.PI, direction.x*Math.PI, 0);
//        this.mesh.updateMatrix();
    },

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////ADD REMOVE////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    _getNextCellPosition: function(){//add direction vector to current index
        var newIndex = _.clone(this.index);
        var direction = this.direction;
        _.each(_.keys(newIndex), function(key){
            newIndex[key] += direction[key];
        });
        return newIndex;
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible() || !this.highlightedObject) return;
            dmaGlobals.lattice.addCellAtIndex(this._getNextCellPosition());
        } else {
            if (!this.highlightedObject) return;
            if (!(this.highlightedObject instanceof DMACell)) return;
            dmaGlobals.lattice.removeCell(this.highlightedObject);
        }
        this.setNothingHighlighted();
    },

    destroy: function(){
        this.setNothingHighlighted();
        dmaGlobals.three.sceneRemove(this.mesh, null);
        this.mesh = null;
        this.stopListening();
    }
});

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////OCTA//////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

OctaFaceHighlighter = Highlighter.extend({

    _makeGeometry: function(){

        var geometry = new THREE.Geometry();
        //can't change size of faces or vertices buffers dynamically
        geometry.vertices = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        geometry.faces = [new THREE.Face3(0,1,2)];

        return geometry;
    }

});

OctaVertexHighlighter = Highlighter.extend({

    _makeGeometry: function(){
        return new THREE.SphereGeometry(1);
    }

});

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CUBE /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

CubeHighlighter = Highlighter.extend({

    _makeGeometry: function(){

        var geometry = new THREE.BoxGeometry(1,1,0.01);
        return geometry;
    }

});