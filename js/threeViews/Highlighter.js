/**
 * Created by aghassaei on 2/1/15.
 */

Highlighter = Backbone.View.extend({

    mesh: null,
    intersectedFace: null,
    intersectedCell: null,//current cell we are intersecting

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
        this._hide();
    },

    _hide: function(){
        this._setVisibility(false);
    },

    _show: function(forceRender){
        this._setVisibility(true, forceRender);
    },

    _setVisibility: function(visible, forceRender){
        if (this.isVisible() != visible){
            this.mesh.visible = visible;
            window.three.render();
        } else if (forceRender){
            window.three.render();
        }
    },

    highlightCell: function(object, face){

        if (object.parent && object.parent.myParent) {
            this.intersectedCell = object.parent.myParent;
        } else {
            this.intersectedCell = null;//we're on the base plane
        }

//        if (this.isVisible() && this._isHighlighting(face)) return;//nothing has changed

        this.intersectedFace = face;

        if (face.normal.z<0.99){//only highlight horizontal faces
            this._hide();
            return;
        }

        //update highlighter
        this._highlightFace(object, face);
        this._show(true);
    },


    setNoCellIntersections: function(){
        this.intersectedCell = null;
        this._hide();
    },

    isVisible: function(){
        return this.mesh.visible;
    },

    _isHighlighting: function(face){
        return this.intersectedFace == face;
    },

    _highlightFace: function(object, face){
        this.mesh.geometry.vertices = this._calcNewHighlighterVertices(object, face);
        this.mesh.geometry.verticesNeedUpdate = true;
    },

    _calcNewHighlighterVertices: function(object, face){
        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var vertices = object.geometry.vertices;
        var newVertices = [vertices[face.a].clone(), vertices[face.b].clone(), vertices[face.c].clone()];
        var scale = this.model.get("scale");
        var position = (new THREE.Vector3()).setFromMatrixPosition(object.matrixWorld);
        _.each(newVertices, function(vertex){//apply scale
            vertex.multiplyScalar(scale);
            vertex.add(position);
        });
        return newVertices;
    },

    _getNextCellPosition: function(){
        return this.mesh.geometry.vertices[0];
    },

    _getNextCellVertices: function(){//offset vertices with +1 in z
        var vertices = _.clone(this.intersectedCell.indices);
        vertices.z += 1;
        return vertices;
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible()) return;
            if (this.intersectedFace && !this.intersectedCell) this.model.addCellAtPosition(this._getNextCellPosition());//baseplane
            else this.model.addCellAtIndex(this._getNextCellVertices());
        } else {
            if (this.intersectedFace && !this.intersectedCell) return;//baseplane
            this.model.removeCell(this.intersectedCell);
        }
        this._hide();
    }
});