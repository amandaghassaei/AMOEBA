/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":            "mouseMoved",
        "mousedown":            "mouseDown",
        "mouseup":              "mouseUp"
    },

    mouseIsDown: false,//store state of mouse click
    mouseProjection: new THREE.Raycaster(),
    highlighter: null,
    currentHighlightedFace: null,

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "animate", "mouseMoved");

        //bind events
        this.listenTo(this.lattice, "change:type", this.drawBasePlane);
        this.listenTo(this.lattice, "change:scale", this.scaleBasePlane);

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);

        this.animate();

        this.drawBasePlane();

        //init highlighter
        var highlightGeometry = new THREE.Geometry();
        //can't change size of faces or vertices buffers dynamically
        highlightGeometry.vertices = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
        highlightGeometry.faces = [new THREE.Face3(0,1,2)];
        this.highlighter = new THREE.Mesh(highlightGeometry,
            new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true, opacity:0.4, color:0xffffff, vertexColors:THREE.FaceColors}));
        this.highlighter.geometry.dynamic = true;
        window.three.sceneAdd(this.highlighter, true);

        this.model.render();
    },

    animate: function(){
        requestAnimationFrame(this.animate);
        this.controls.update();
    },

    mouseUp: function(){
        this.mouseIsDown = false;
    },

    mouseDown: function(e){
        this.mouseIsDown = true;
//
//        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
//        var camera = this.model.camera;
//        this.mouseProjection.setFromCamera(vector, camera);
//        var intersections = this.mouseProjection.intersectObjects(this.model.objects);
//
//                console.log(intersections);
//
//        if (intersections.length>1){
//            var voxel = new THREE.Mesh(this.cubeGeometry);
//            voxel.position.copy(intersections[1].point);
//            if (intersections[1].face) voxel.position.add(intersections[1].face.normal);
//            voxel.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
//            this.model.sceneAdd(voxel);
//            this.model.render();
//        }
    },

    mouseMoved: function(e){

        if (this.mouseIsDown) return;//in the middle of a drag event

        var vector = new THREE.Vector2(2*(e.pageX-this.$el.offset().left)/this.$el.width()-1, 1-2*(e.pageY-this.$el.offset().top)/this.$el.height());
        var camera = this.model.camera;
        this.mouseProjection.setFromCamera(vector, camera);
        var intersections = this.mouseProjection.intersectObjects(this.model.objects, true);

        if (intersections.length == 0) return;

        //check if we've moved to a new face
        var intersection = intersections[0].face;
        if (this.currentHighlightedFace == intersection) return;

        this.currentHighlightedFace = intersection;
        var vertices = intersections[0].object.geometry.vertices;
        this.highlighter.geometry.vertices = [vertices[intersection.a], vertices[intersection.b], vertices[intersection.c]];
        this.highlighter.geometry.verticesNeedUpdate = true;

        window.three.render();
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

            this.lattice.addCell();
            var triangleHeight = gridSize/2*Math.sqrt(3);

            for (var j=-baseDim;j<=baseDim;j++){
                for (var i=-baseDim;i<=baseDim;i++){

                    var xOffset = 0;
                    if (Math.abs(j)%2==1) xOffset = gridSize/2;
                    vertices.push(new THREE.Vector3(i*gridSize + xOffset, j*triangleHeight, 0));

                    if (j==-baseDim || i==-baseDim) continue;

                    var currentOffset = vertices.length;

                    if (Math.abs(j)%2==1){
                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-2-2*baseDim));
                        faces.push(new THREE.Face3(currentOffset-2, currentOffset-3-2*baseDim, currentOffset-2-2*baseDim));
                    } else {
                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-3-2*baseDim, currentOffset-2-2*baseDim));
                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-3-2*baseDim));
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

        for (i = 0; i < geometry.faces.length; i ++ ) {
            var face = geometry.faces[ i ];
            face.color.setHex( Math.random() * 0xffffff );
        }
        geometry.colorsNeedUpdate = true;

        window.three.sceneAdd(new THREE.Mesh(geometry, planeMaterial));

        return vertices;
    },

    scaleBasePlane: function(){

        console.log("scale base plane");

    },

});