/**
 * Created by aghassaei on 1/16/15.
 */

LatticeView = Backbone.View.extend({

    events: {
    },

    el: "#threeContainer",

    controls: null,

    initialize: function(options){

        this.three = options.three;
        this.fillGeometry = options.fillGeometry;


        //bind events
        this.listenTo(this.model, "change:bounds", this.updateBuildPlanes());

        this.buildPlanes();
        this.render();

    },

    updateBuildPlanes: function(){
    },

    buildPlanes: function(){
        var xyPlaneGeo = new THREE.Geometry();
        var xzPlaneGeo = new THREE.Geometry();
        var yzPlaneGeo = new THREE.Geometry();

        var size=50, step = 5;
        for (var i=-size;i<=size;i+=step){
            xyPlaneGeo.vertices.push(new THREE.Vector3(-size, i, -size));
            xyPlaneGeo.vertices.push(new THREE.Vector3(size, i, -size));
            xyPlaneGeo.vertices.push(new THREE.Vector3(i, -size, -size));
            xyPlaneGeo.vertices.push(new THREE.Vector3(i, size, -size));

            xzPlaneGeo.vertices.push(new THREE.Vector3(-size, i, -size));
            xzPlaneGeo.vertices.push(new THREE.Vector3(-size, i, size));
            xzPlaneGeo.vertices.push(new THREE.Vector3(-size, -size, i));
            xzPlaneGeo.vertices.push(new THREE.Vector3(-size, size, i));

            yzPlaneGeo.vertices.push(new THREE.Vector3(-size, -size, i));
            yzPlaneGeo.vertices.push(new THREE.Vector3(size, -size, i));
            yzPlaneGeo.vertices.push(new THREE.Vector3(i, -size, -size));
            yzPlaneGeo.vertices.push(new THREE.Vector3(i, -size, size));
        }

        this.addPlane(xyPlaneGeo);
//        this.addPlane(yzPlaneGeo);
//        this.addPlane(xzPlaneGeo);

    },

    addPlane: function(planeGeo){
        var plane = new THREE.Line(planeGeo, new THREE.LineBasicMaterial({color:0x000000, opacity:0.3}), THREE.LinePieces);
        this.three.sceneAdd(plane);
    },

    render: function(){
        this.three.render();
    }
});