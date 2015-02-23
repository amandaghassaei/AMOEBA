/**
 * Created by aghassaei on 2/1/15.
 */

Highlighter = Backbone.View.extend({

    mesh: null,
    highlightedObject: null,

    initialize: function(){

        var geometry = new THREE.Geometry();
        //can't change size of faces or vertices buffers dynamically
        geometry.vertices = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        geometry.faces = [new THREE.Face3(0,1,2)];
        geometry.dynamic = true;
        this.mesh = new THREE.Mesh(geometry,
            new THREE.MeshBasicMaterial({
                side:THREE.DoubleSide,
                transparent:true,
                opacity:0.4,
                color:0xffffff,
                vertexColors:THREE.FaceColors
            }));
        window.three.sceneAdd(this.mesh, null);
        this.hide();
    },

    hide: function(){
        this._setVisibility(false);
    },

    show: function(forceRender){
        this._setVisibility(true, forceRender);
    },

    _setVisibility: function(visible, forceRender){
        if (forceRender || this.isVisible() != visible){
            this.mesh.visible = visible;
            window.three.render();
        }
        this.mesh.visible = visible;
    },

    highlight: function(intersection){
        if (!intersection.object) return;
        var highlightable = intersection.object;
        if (!(highlightable.parent instanceof THREE.Scene)) highlightable = highlightable.parent;//cell mesh parent is object3d
        if (!highlightable.myParent) console.warn("no parent for highlightable object");

        this.highlightedObject = highlightable.myParent;
        this.highlightedFace = intersection.face;
        var newVertices = highlightable.myParent.getHighlighterVertices(intersection.face);
        if (!newVertices) {
            this.hide();
            return;
        }
        this.mesh.geometry.vertices = newVertices;
        this.mesh.geometry.verticesNeedUpdate = true;
//        this.mesh.geometry.normalsNeedUpdate = true;
//        this.mesh.geometry.computeFaceNormals();
//        this.mesh.geometry.computeVertexNormals();
        this.mesh.geometry.computeBoundingSphere();
        this.show(true);
    },

    isVisible: function(){
        return this.mesh.visible;
    },

    _getNextCellPosition: function(indices){//add one to z index
        indices.z += 1;
        return indices;
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible() || !this.highlightedObject) return;
            window.lattice.addCellAtIndex(this._getNextCellPosition(this.highlightedObject.getIndex(this.mesh)));
        } else {
            if (!this.highlightedObject || !this.highlightedObject.canRemove()) return;
            if (this.highlightedObject instanceof DMACell){
                window.lattice.removeCell(this.highlightedObject);
                return;
            }
//            window.lattice.removeCellAtIndex(this.highlightedObject.getIndex(this.mesh));
        }
        this.hide();
        this.highlightedObject = null;
    }
});