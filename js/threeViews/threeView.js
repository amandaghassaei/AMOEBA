/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":            "_mouseMoved",
        "mousedown":            "_mouseDown",
        "mouseup":              "_mouseUp"
    },

    mouseIsDown: false,//store state of mouse click
    shiftIsDown: false,//used to add many voxels at once
    deleteMode: false,//delete cells instead of adding (space bar)
    extrudeMode: false,//extrude a column of cells
    extrudeVisualizer: ExtrudeVisualizer(),
    mouseProjection: new THREE.Raycaster(),
    highlighter: null,
    currentHighlightedFace: null,
    currentIntersectedObject: null,
    basePlane: null,

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "_animate", "_mouseMoved", "_handleKeyStroke");

        //bind events
        $(document).bind('keydown', {state:true}, this._handleKeyStroke);
        $(document).bind('keyup', {state:false}, this._handleKeyStroke);
        this.listenTo(this.lattice, "change:type", this.drawBasePlane);
        this.listenTo(this.lattice, "change:scale", this.scaleBasePlane);

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);

        this._animate();

        this.basePlane = this.drawBasePlane();

        //init highlighter
        var highlightGeometry = new THREE.Geometry();
        //can't change size of faces or vertices buffers dynamically
        highlightGeometry.vertices = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        highlightGeometry.faces = [new THREE.Face3(0,1,2)];
        this.highlighter = new THREE.Mesh(highlightGeometry,
            new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true, opacity:0.4, color:0xffffff, vertexColors:THREE.FaceColors}));
        this.highlighter.geometry.dynamic = true;
        this.highlighter.visible = false;
        window.three.sceneAdd(this.highlighter, true);

        this.model.render();
    },

    _animate: function(){
        requestAnimationFrame(this._animate);
        this.controls.update();
    },

    _handleKeyStroke: function(e){//receives keyup and keydown

        var state = e.data.state;

        switch(e.keyCode){
            case 16://shift
                this.shiftIsDown = state;
                this.controls.enabled = !state;
                break;
            case 32://space bar
                this.deleteMode = state;
                this.controls.enabled = !state;
                break;
            case 69://e
                this.extrudeMode = state;
                this.controls.enabled = !state;
                break;

            default:
                break;
        }
    },

    _mouseUp: function(){
        this.mouseIsDown = false;
        this._addRemoveVoxel();
    },

    _mouseDown: function(){
        this.mouseIsDown = true;
    },

    _mouseMoved: function(e){

        if (this.mouseIsDown && this.controls.enabled) {//in the middle of a camera move
            this._hideHighlighter();
            return;
        }

        if (this.extrudeMode && this.mouseIsDown && this.extrudeVisualizer.getMeshNum()>0){
            this.extrudeVisualizer.dragHandle(1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
            return;
        }

        //make projection vector
        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);


        //check if we're intersecting anything
        var intersections = this.mouseProjection.intersectObjects(this.model.objects, true);
        if (intersections.length == 0) {
            this.currentIntersectedObject == null;
            this._hideHighlighter();
            return;
        }

        this.currentIntersectedObject = intersections[0].object;

        if (this.deleteMode && this.mouseIsDown){
            this._addRemoveVoxel();
            return;
        }

        if (this.extrudeMode && this.mouseIsDown){
            if (!this.highlighter.visible) return;
            this.extrudeVisualizer.makeMeshFromProfile([this.highlighter]);
            return;
        }

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

        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var vertices = intersections[0].object.geometry.vertices;
        var position = (new THREE.Vector3()).setFromMatrixPosition(intersections[0].object.matrixWorld);
        this.highlighter.geometry.vertices = [(new THREE.Vector3()).addVectors(vertices[intersection.a], position),
            (new THREE.Vector3()).addVectors(vertices[intersection.b], position), (new THREE.Vector3()).addVectors(vertices[intersection.c], position)];
        this.highlighter.geometry.verticesNeedUpdate = true;

        if (this.mouseIsDown && this.shiftIsDown) this._addRemoveVoxel();

        window.three.render();
    },

    _addRemoveVoxel: function(){

        if (this.deleteMode){
            if (this.currentIntersectedObject === this.basePlane) return;
            this.lattice.removeCell(this.currentIntersectedObject);
        } else {
            if (!this.highlighter.visible) return;
            this.lattice.addCell(this.highlighter.geometry.vertices[0]);
        }
        this._hideHighlighter();
    },

    _hideHighlighter: function(){
        if (this.highlighter.visible){
            this.highlighter.visible = false;
            window.three.render();
        }
    },

    drawBasePlane: function(){

        this.lattice.clearCells();

        var type = this.lattice.get("type");

        var baseDim = 100;
        var gridSize = this.lattice.get("scale");
        var geometry = new THREE.Geometry();
        var planeMaterial = new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true, side:THREE.DoubleSide});

        var vertices = geometry.vertices;
        var faces = geometry.faces;

        if (type == "octagonFace" || type == "octagonEdge"){

            this.lattice.addCell(new THREE.Vector3(0,0,0));
            var triangleHeight = gridSize/2*Math.sqrt(3);

            for (var j=-baseDim;j<=baseDim;j++){
                for (var i=-baseDim;i<=baseDim;i++){

                    var xOffset = 0;
                    if (Math.abs(j)%2==1) xOffset = gridSize/2;
                    vertices.push(new THREE.Vector3(i*gridSize + xOffset, j*triangleHeight, 0));

                    if (j==-baseDim || i==-baseDim) continue;

                    var currentOffset = vertices.length;

                    if (Math.abs(j)%2==1){
//                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-2-2*baseDim));
                        faces.push(new THREE.Face3(currentOffset-2, currentOffset-3-2*baseDim, currentOffset-2-2*baseDim));
                    } else {
                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-3-2*baseDim, currentOffset-2-2*baseDim));
//                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-3-2*baseDim));
                    }

                }

            }


        } else if (type == "octagonVertex"){

//            geometry.vertices.push(new THREE.Vector3(-baseSize, 0, 0));
//            geometry.vertices.push(new THREE.Vector3(baseSize, 0, 0));
//
//            for ( var i = 0; i <= baseSize/gridSize; i ++ ) {
//
//                var line = new THREE.Line(geometry, linesMaterial);
//                line.position.y = (i * gridSize) - baseSize;
//                window.three.sceneAdd(line);
//
//                line = new THREE.Line(geometry, linesMaterial);
//                line.position.x = (i * gridSize) - baseSize;
//                line.rotation.z = 90 * Math.PI / 180;
//                window.three.sceneAdd(line);
//            }
        }

        geometry.computeFaceNormals();

        var basePlane = new THREE.Mesh(geometry, planeMaterial);
        window.three.sceneAdd(basePlane);

        return basePlane;
    },

    scaleBasePlane: function(){

        console.log("scale base plane");

    }

});