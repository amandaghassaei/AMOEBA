/**
 * Created by aghassaei on 1/31/15.
 */


BasePlane = Backbone.Model.extend({

    defaults: {
        zIndex: 0,
        mesh: null,
        dimX: 100,
        dimY: 100,
        material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true, side:THREE.DoubleSide}),
        currentScene: "default",
        allScenes: {default:"Default", "mars":"Mars"}
    },

    initialize: function(options){

        //bind events
        this.listenTo(this, "change:currentScene", this._renderForCurrentScene);

        //draw mesh
        this.set("mesh", this._makeBasePlaneMesh(options.cellType, options.connectionType));
        this.updateScale(options.scale);
        this._showMesh();

    },

    _renderForCurrentScene: function(){
        console.log("amanda");
    },

    updateGeometry: function(cellType, connectionType, scale){
        this._removeMesh();
        this.set("mesh", this._makeBasePlaneMesh(cellType, connectionType));
        this.updateScale(scale);
        this._showMesh();
    },

    updateScale: function(scale){
        this.get("mesh").scale.set(scale, scale, scale);
    },

    _makeBasePlaneMesh: function(cellType, connectionType){
        if (cellType == "cube"){
            return this._createGridMesh();
        } else if (cellType == "octa"){
            if (connectionType == "face"){
                return this._createOctaFaceMesh();
            } else if (connectionType == "edge"){
                return this._createOctaFaceMesh();
            } else if (connectionType == "vertex"){
                return this._createOctaFaceMesh();
            }
        }
    },

    _createOctaFaceMesh: function(){

        var geometry = new THREE.Geometry();
        var vertices = geometry.vertices;
        var faces = geometry.faces;

        var triangleHeight = 1/2*Math.sqrt(3);
        var dimX = this.get("dimX");
        var dimY = this.get("dimY");

        for (var j=-dimX;j<=dimX;j++){
            for (var i=-dimY;i<=dimY;i++){

                var xOffset = 0;
                if (Math.abs(j)%2==1) xOffset = 1/2;
                vertices.push(new THREE.Vector3(i + xOffset, j*triangleHeight, 0));

                if (j == -dimX || i == -dimY) continue;

                var currentOffset = vertices.length;

                if (Math.abs(j)%2==1){
//                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-2-2*baseDim));
                    faces.push(new THREE.Face3(currentOffset-2, currentOffset-3-2*dimX, currentOffset-2-2*dimY));
                } else {
                    faces.push(new THREE.Face3(currentOffset-1, currentOffset-3-2*dimX, currentOffset-2-2*dimY));
//                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-3-2*baseDim));
                }

            }

        }
        geometry.computeFaceNormals();
        return new THREE.Mesh(geometry, this.get("material"));
    },

    _createGridMesh: function(){
        return this._createOctaFaceMesh();
    },

    _showMesh: function(){
        window.three.sceneAdd(this.get("mesh"), "basePlane");
        window.three.render();
    },

    _removeMesh: function(){
        window.three.sceneRemove(this.get("mesh"), "basePlane");
    },

    destroy: function(){
        this.set("zIndex", null);
        this.set("mesh", null);
        this.set("material", null);
        this.set("unitGeometry", null);
        this.set("dimX", null);
        this.set("dimY", null);
    }

});