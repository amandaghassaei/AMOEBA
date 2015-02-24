/**
 * Created by aghassaei on 2/1/15.
 */

Highlighter = Backbone.View.extend({

    mesh: null,
    highlightedObject: null,

    initialize: function(){

        var geometry = this._makeGeometry();
        geometry.dynamic = true;
        this.mesh = new THREE.Mesh(geometry,
            new THREE.MeshBasicMaterial({
                side:THREE.DoubleSide,
                transparent:true,
                opacity:0.4,
                color:0xffffff,
                vertexColors:THREE.FaceColors
            }));

        dmaGlobals.three.sceneAdd(this.mesh, null);
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

    highlight: function(intersection){
        if (!intersection.object) return;
        var highlightable = intersection.object;
        if (!(highlightable.parent instanceof THREE.Scene)) highlightable = highlightable.parent;//cell mesh parent is object3d
        if (!highlightable.myParent) console.warn("no parent for highlightable object");

        this.highlightedObject = highlightable.myParent;
        var newVertices = highlightable.myParent.getHighlighterVertices(intersection.face, intersection.point);
        if (!newVertices) {
            this.hide();
            return;
        }

        var geometry = this.mesh.geometry;
        if (geometry.vertices.length != newVertices.length) console.warn("vertices array is changing size");
        geometry.vertices = newVertices;
        geometry.verticesNeedUpdate = true;
//        this.mesh.geometry.normalsNeedUpdate = true;
//        this.mesh.geometry.computeFaceNormals();
//        this.mesh.geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
        this.show(true);
    },

    ///////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////ADD REMOVE////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    //todo this could be more than just z additions
    _getNextCellPosition: function(index){//add one to z index
        index.z += 1;
        return index;
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible() || !this.highlightedObject) return;
            dmaGlobals.lattice.addCellAtIndex(this._getNextCellPosition(this.highlightedObject.getIndex(this.mesh)));
        } else {
            if (!this.highlightedObject) return;
            if (!(this.highlightedObject instanceof DMACell)) return;
            dmaGlobals.lattice.removeCell(this.highlightedObject);
        }
        this.hide();
        this.highlightedObject = null;
    },

    destroy: function(){
        dmaGlobals.three.sceneRemove(this.mesh, null);
        this.mesh = null;
        this.highlightedObject = null;
        this.stopListening();
    }
});

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////OCTA FACE/////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CUBE /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

CubeHighlighter = Highlighter.extend({

    _makeGeometry: function(){

        var geometry = new THREE.Geometry();
        //can't change size of faces or vertices buffers dynamically
        geometry.vertices = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        geometry.faces = [new THREE.Face3(0,1,2), new THREE.Face3(0,2,3)];

        return geometry;
    }

});