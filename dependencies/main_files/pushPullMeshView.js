/**
 * Created by aghassaei on 1/17/15.
 */

//this is a parent class for other threeJS VCs that allows push and pull scale changes in the threeJS scene

PushPullMeshView = Backbone.View.extend({

    el: "#threeContainer",

    events: {
    },

    boundsBox: null,
    boxHelper: null,
    currentHighlightedFaces:[],
    shouldReceiveHighlight: true,
    highlightPlane: null,

    initialize: function(options){

        this.three = options.three;

        //bind events
        this.listenTo(this.model, "change:bounds change:scale change:orientation", this.updateBounds);

        this.drawBounds();
//        this.createHighlightPlane();
    },

    drawBounds: function(){
        this.boundsBox = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100),
            new THREE.MeshLambertMaterial({color:0x0000ff, shading:THREE.FlatShading, transparent:true, opacity:0.0, vertexColors:THREE.FaceColors}));
        this.boxHelper = new THREE.BoxHelper(this.boundsBox);

        this.boxHelper.material.color.set(this.defaultColor);
        this.three.sceneAdd(this.boxHelper);
//        this.three.sceneAdd(this.boundsBox);
        this.updateBounds();
    },

    updateBounds: function(){
        var bounds = this.model.get("bounds");//this has not been scaled or rotated, as is when model was first imported
        var max = bounds.max.toArray();
        var min = bounds.min.toArray();
        var size = numeric.sub(max, min);
        var translation = numeric.mul(numeric.add(max, min), 0.5);
        var geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(translation[0], translation[1], translation[2]));
        this.boundsBox.geometry = geometry;
        this.boxHelper.update(this.boundsBox);
        this.render();
    },

//    createHighlightPlane: function(){
//        var squareGeometry = new THREE.Geometry();
//        squareGeometry.vertices.push(new THREE.Vector3());
//        squareGeometry.vertices.push(new THREE.Vector3());
//        squareGeometry.vertices.push(new THREE.Vector3());
//        squareGeometry.vertices.push(new THREE.Vector3());
//        squareGeometry.faces.push(new THREE.Face3(0, 1, 2));
//        squareGeometry.faces.push(new THREE.Face3(0, 2, 3));
//        var squareMaterial = new THREE.MeshBasicMaterial({color:0xffffff, shading:THREE.FlatShading, transparent:true, opacity:0.0, vertexColors:THREE.FaceColors});
//        this.highlightPlane = new THREE.Mesh(squareGeometry, squareMaterial);
//        this.three.sceneAdd(this.highlightPlane);
//    },

    checkHighlight: function(intersections){
        if (intersections.length>0){
            var face = intersections[0].face;
            if (this.currentHighlightedFaces.indexOf(face) != -1) return;//stay the same
            this.setHighlightColor(this.currentHighlightedFaces, 0x0000ff);

            var faceIndex = intersections[0].object.geometry.faces.indexOf(face);
            var face2Index = faceIndex-1;
            if (faceIndex%2==0) face2Index = faceIndex+1;
            this.currentHighlightedFaces = [face, intersections[0].object.geometry.faces[face2Index]];
            this.setHighlightColor(this.currentHighlightedFaces, 0xffffff);

            this.render();
        } else if (this.currentHighlightedFaces.length > 0){
            this.setHighlightColor(this.currentHighlightedFaces, 0x0000ff);
            this.currentHighlightedFaces = [];
            this.render();
        }
    },

    setHighlightColor: function(faces, color){
        _.each(faces, function(face){
            face.color.setHex(color);
        });
        this.boundsBox.geometry.colorsNeedUpdate = true;
//        this.boundsBox.geometry.__dirtyColors = true
//        this.boundsBox.geometry.dynamic = true
    }

});