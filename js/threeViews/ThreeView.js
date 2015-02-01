/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":                            "_mouseMoved",
        "mouseup":                              "_mouseUp",
        "mousedown":                            "_mouseDown",
        "mouseout":                             "_mouseOut"
    },

    mouseIsDown: false,//store state of mouse click inside this el
    extrudeVisualizer: ExtrudeVisualizer(),

    //intersections/object highlighting
    mouseProjection: new THREE.Raycaster(),
    highlighter: null,
    currentHighlightedFace: null,
    currentIntersectedCell: null,
    currentIntersectedPart:null,

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.lattice = options.lattice;
        this.appState = options.appState;

        _.bindAll(this, "_animate", "_mouseMoved");

        //bind events
        this.listenTo(this.appState, "change:deleteMode change:extrudeMode change:shift", this._setControlsEnabled);

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);//render only once

        //init highlighter
        this.highlighter = this._initHighlighter();
        window.three.sceneAdd(this.highlighter, null);

        this.model.render();
        this._animate();
    },

    _initHighlighter: function(){
        var highlightGeometry = new THREE.Geometry();
        //can't change size of faces or vertices buffers dynamically
        highlightGeometry.vertices = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        highlightGeometry.faces = [new THREE.Face3(0,1,2)];
        var highlighter = new THREE.Mesh(highlightGeometry,
            new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true, opacity:0.4, color:0xffffff, vertexColors:THREE.FaceColors}));
        highlighter.geometry.dynamic = true;
        highlighter.visible = false;
        return highlighter;
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////CONTROLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _animate: function(){
        requestAnimationFrame(this._animate);
        this.controls.update();
    },

    _setControlsEnabled: function(){
        var state = this.appState.get("deleteMode") || this.appState.get("shift") || this.appState.get("extrudeMode");
        this.controls.enabled = !state;
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////MOUSE EVENTS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _mouseOut: function(){
        this._setNoCellIntersections();
        this._setNoPartIntersections();
    },

    _mouseUp: function(){
        this.mouseIsDown = false;
        if (this.currentIntersectedPart) this.currentIntersectedPart.removeFromCell();
        else this._addRemoveVoxel(!this.appState.get("deleteMode"));
    },

    _mouseDown: function(){
        this.mouseIsDown = true;
    },

    _mouseMoved: function(e){

        if (this.mouseIsDown && this.controls.enabled) {//in the middle of a camera move
            this._setNoCellIntersections();
            this._setNoPartIntersections();
            return;
        }

        //make projection vector
        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);

        //check if we're intersecting anything
        var cellIntersections = this.mouseProjection.intersectObjects(this.model.cells.concat(this.model.basePlane), true);
        if (cellIntersections.length == 0) {
            this._setNoCellIntersections();
            this._setNoPartIntersections();
            return;
        }
        this._handleCellIntersections(cellIntersections);

        if (this.lattice.get("cellMode") == "part"){//additionally check for part intersections in part mode
            var partIntersections = this.mouseProjection.intersectObjects(this.model.parts, false);
            if (partIntersections.length == 0) {
                this._setNoPartIntersections();
                return;
            }
            this._handlePartIntersections(partIntersections, cellIntersections[0].distance);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////INTERSECTIONS////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _setNoCellIntersections: function(){
        this.currentIntersectedCell = null;
        this._hideHighlighter();
    },

    _setNoPartIntersections: function(){
        if (this.currentIntersectedPart){
            this.currentIntersectedPart.unhighlight();
            this.currentIntersectedPart = null;
            window.three.render();
        }
    },

    _handlePartIntersections: function(intersections, distanceToNearestCell){
        var part = intersections[0].object.myPart;
        if (this.highlighter.visible && intersections[0].distance > distanceToNearestCell){
            this._setNoPartIntersections();
            return;
        }
        this._setNoCellIntersections();
        if (part!= this.currentIntersectedPart){
            if (this.currentIntersectedPart) this.currentIntersectedPart.unhighlight();
            part.highlight();
            this.currentIntersectedPart = part;
            window.three.render();
        }
    },

    _handleCellIntersections: function(intersections){

        this.currentIntersectedCell = intersections[0].object;

        if (this.appState.get("deleteMode") && this.mouseIsDown){
            this._addRemoveVoxel(false);
            return;
        }

//        if (this.appState.get("extrudeMode") && this.mouseIsDown){
//            if (!this.highlighter.visible) return;
//            this.extrudeVisualizer.makeMeshFromProfile([this.highlighter]);
//            return;
//        }

        //check if we've moved to a new face
        var intersection = intersections[0].face;
        if (this.highlighter.visible && this.currentHighlightedFace == intersection) return;

        if (intersection.normal.z<0.99){//only highlight horizontal faces
            this._hideHighlighter();
            return;
        }

        //update highlighter
        this.highlighter.visible = true;
        this.currentHighlightedFace = intersection;
        this.highlighter.geometry.vertices = this._calcNewHighlighterVertices(intersections[0].object, intersection);
        this.highlighter.geometry.verticesNeedUpdate = true;

        if (this.mouseIsDown && this.appState.get("shift")) this._addRemoveVoxel(true);

        window.three.render();
    },

    _calcNewHighlighterVertices: function(object, face){
        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var vertices = object.geometry.vertices;
        var position = (new THREE.Vector3()).setFromMatrixPosition(object.matrixWorld);
        return [(new THREE.Vector3()).addVectors(vertices[face.a], position),
            (new THREE.Vector3()).addVectors(vertices[face.b], position), (new THREE.Vector3()).addVectors(vertices[face.c], position)];
    },

    _addRemoveVoxel: function(shouldAdd){

        if (shouldAdd){
            if (!this.highlighter.visible) return;
            this.lattice.addCell(this.highlighter.geometry.vertices[0]);
        } else {
            if (this.currentIntersectedCell === this.model.basePlane[0]) return;
            this.lattice.removeCellFromMesh(this.currentIntersectedCell);
        }
        this._hideHighlighter();
    },

    _hideHighlighter: function(){
        if (this.highlighter.visible){
            this.highlighter.visible = false;
            window.three.render();
        }
    }

});