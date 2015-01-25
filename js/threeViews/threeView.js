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
    shiftIsDown:false,//used to add many voxels at once
    mouseProjection: new THREE.Raycaster(),
    highlighter: null,
    currentHighlightedFace: null,

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

        this.drawBasePlane();

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

//        e.preventDefault();
        var state = e.data.state;

        switch(e.keyCode){
            case 16://shift
                this.shiftIsDown = state;
                break;
            default:
        }
    },

    _mouseUp: function(){
        this.mouseIsDown = false;

        if (!this.highlighter.visible) return;

        this.lattice.addCell(this.highlighter.geometry.vertices[0]);
    },

    _mouseDown: function(){
        this.mouseIsDown = true;
    },

    _mouseMoved: function(e){

        if (this.mouseIsDown) {//in the middle of a camera move
            this._hideHighlighter();
            return;
        }

        //make projection vector
        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);

        //check if we're intersecting anything
        var intersections = this.mouseProjection.intersectObjects(this.model.objects, true);
        if (intersections.length == 0) {
            this._hideHighlighter();
            return;
        }

        //check if we've moved to a new face
        var intersection = intersections[0].face;
        if (this.highlighter.visible && this.currentHighlightedFace == intersection) return;

        if (intersection.normal.z<0.99){//only highlight horizontal faces
            this._hideHighlighter();
            return;

            //delete cell if side clicked
//            window.three.sceneRemove(intersection.object);
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

        window.three.render();
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

        window.three.sceneAdd(new THREE.Mesh(geometry, planeMaterial));

        return vertices;
    },

    scaleBasePlane: function(){

        console.log("scale base plane");

    },

});