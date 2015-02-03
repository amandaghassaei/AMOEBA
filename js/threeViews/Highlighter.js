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
        this.hide();
    },

    hide: function(){
        if (this.mesh.visible){
            this.mesh.visible = false;
            window.three.render();
        }
    },

    show: function(){
        if (!this.mesh.visible){
            this.mesh.visible = true;
            window.three.render();
        }
    },

    highlightCell: function(object, face){

        if (object.parent && object.parent.myCell) {
            this.intersectedCell = object.parent.myCell;
        } else {
            this.intersectedCell = null;//we're on the base plane
        }

        if (this.isVisible() && this._isHighlighting(face)) return;//nothing has changed

        this.currentHighlightedFace = face;

        if (face.normal.z<0.99){//only highlight horizontal faces
            this.hide();
            return;
        }

        //update highlighter
        this._highlightFace(object, face);
        this.show();
    },

    _getCurrentIntersectedCell: function(){
        return this.currentIntersectedCell;
    },

    setNoCellIntersections: function(){
        this.intersectedCell = null;
        this.currentIntersectedCell = null;
        this.hide();
    },

    isVisible: function(){
        return this.mesh.visible;
    },

    _isHighlighting: function(face){
        return this.currentHighlightedFace == face;
    },

    _highlightFace: function(object, face){
        this.mesh.geometry.vertices = this._calcNewHighlighterVertices(object, face);
        this.mesh.geometry.verticesNeedUpdate = true;
    },

    _calcNewHighlighterVertices: function(object, face){
        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var vertices = object.geometry.vertices;
        var position = (new THREE.Vector3()).setFromMatrixPosition(object.matrixWorld);
        var newVertices =  [(new THREE.Vector3()).addVectors(vertices[face.a], position),
            (new THREE.Vector3()).addVectors(vertices[face.b], position), (new THREE.Vector3()).addVectors(vertices[face.c], position)];
        var scale = this.model.get("scale");
        _.each(newVertices, function(vertex){//apply scale
            vertex.multiplyScalar(scale);
        });
        return newVertices;
    },

    getNextCellPosition: function(){
        return this.mesh.geometry.vertices[0];
    },

    addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.isVisible()) return;
            this.model.addCell(this.getNextCellPosition());
        } else {
            var currentIntersectedCell = this._getCurrentIntersectedCell();
            if (currentIntersectedCell === this.model.get("basePlane").get("mesh")) return;
            this.model.removeCellFromMesh(currentIntersectedCell);
        }
        this.hide();
    }


});