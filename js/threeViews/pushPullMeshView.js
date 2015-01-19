/**
 * Created by aghassaei on 1/17/15.
 */

//this is a parent class for other threeJS VCs that allows push and pull scale and orientation changes in the threeJS scene

PushPullMeshView = Backbone.View.extend({


    events: {
    },

    boundsBox: null,
    boxHelper: null,
    currentHighlightedFace: null,

    initialize: function(options){

        this.three = options.three;

        //bind events
        this.listenTo(this.model, "change:bounds change:scale change:orientation", this.updateBounds);

        this.drawBounds();

    },

    drawBounds: function(){
        var materials = [
            new THREE.MeshLambertMaterial({color:0xffffff, shading:THREE.FlatShading, transparent:true, opacity:0.0, vertexColors:THREE.FaceColors}),
            new THREE.MeshLambertMaterial({color:0xffffff, shading:THREE.FlatShading, transparent:true, opacity:1.0, vertexColors:THREE.FaceColors})
        ];
        this.boundsBox = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100));//, new THREE.MeshFaceMaterial(materials)
        this.boxHelper = new THREE.BoxHelper(this.boundsBox);

        this.boxHelper.material.color.set(this.defaultColor);
        this.three.sceneAdd(this.boxHelper);
        this.three.sceneAdd(this.boundsBox);
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

    checkHighlight: function(intersections){
        if (this.currentHighlightedFace) {
            this.currentHighlightedFace.color.setHex(this.defaultColor);
            this.model.get("mesh").geometry.colorsNeedUpdate = true;
            this.render();
        }
        if (intersections.length>0){
            var face = intersections[0].face;
            face.color.setHex(0xffffff);
            this.currentHighlightedFace = face;
            intersections[0].object.geometry.colorsNeedUpdate = true;
            this.render();
        } else {

            this.currentHighlightedFace = null;
        }

    }

});