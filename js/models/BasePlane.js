/**
 * Created by aghassaei on 1/31/15.
 */


BasePlane = Backbone.Model.extend({

    defaults: {
        zIndex: 0,
        mesh: null,
        dimX: 10,
        dimY: 10,
        material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true, side:THREE.DoubleSide}),
        currentScene: "default",
        allScenes: {default:"Default", "mars":"Mars"}
    },

    initialize: function(options){

        //bind events
        this.listenTo(this, "change:currentScene", this._renderForCurrentScene);
        this.listenTo(this, "change:zIndex", this._renderZIndexChange);

        //draw mesh
        this.set("mesh", this._makeBasePlaneMesh(options.cellType, options.connectionType));
        this.updateScale(options.scale);
        this._showMesh();

    },

    updateColSeparation: function(colSep){
        var geometry = this.get("mesh").geometry;
        geometry.vertices = this._calcOctaFaceVertices();
        geometry.verticesNeedUpdate = true;
    },

    _renderZIndexChange: function(){
        var zIndex = this.get("zIndex");
        var scale = this.get("mesh").scale.z;
        this.get("mesh").position.set(0, 0, zIndex*scale*2/Math.sqrt(6));
        window.three.render();
    },

    _renderForCurrentScene: function(){
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
        geometry.dynamic = true;
        geometry.vertices = this._calcOctaFaceVertices(0.2);
        var faces = geometry.faces;

        var dimX = this.get("dimX");
        var dimY = this.get("dimY");

        var currentOffset = 0;
        for (var j=-dimX;j<=dimX;j++){
            for (var i=-dimY;i<=dimY;i++){

                currentOffset++;
                if (j == -dimX || i == -dimY) continue;

                if (Math.abs(j)%2==1){
//                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-2-2*baseDim));
                    faces.push(new THREE.Face3(3*currentOffset-4, 3*currentOffset-8-6*dimY, 3*currentOffset-6-6*dimY));//pt, base, base
                } else {
                    faces.push(new THREE.Face3(3*currentOffset-1, 3*currentOffset-8-6*dimY, 3*currentOffset-6-6*dimY));//pt, base, base
//                        faces.push(new THREE.Face3(currentOffset-1, currentOffset-2, currentOffset-3-2*baseDim));
                }

            }

        }

        geometry.computeFaceNormals();
        return new THREE.Mesh(geometry, this.get("material"));
    },

    _calcOctaFaceVertices: function(colSep){

        var vertices = [];
        var triangleHeight = 1/2*Math.sqrt(3);
        var dimX = this.get("dimX");
        var dimY = this.get("dimY");

        var baseVertOffset = colSep/Math.sqrt(3);
        var pointVertOffset = 2*baseVertOffset;
        var horizontalOffset = colSep;

        for (var j=-dimX;j<=dimX;j++){
            for (var i=-dimY;i<=dimY;i++){

                var xOffset = 0;
                if (Math.abs(j)%2==0) {
                } else {
                    xOffset = 1/2;

                }

                vertices.push(new THREE.Vector3(i + xOffset - horizontalOffset, j*triangleHeight + baseVertOffset, 0));
                vertices.push(new THREE.Vector3(i + xOffset + horizontalOffset, j*triangleHeight + baseVertOffset, 0));
                vertices.push(new THREE.Vector3(i + xOffset, j*triangleHeight - pointVertOffset, 0));
//                vertices.push(new THREE.Vector3(i + xOffset, j*triangleHeight - pointVertOffset, 0));


            }

        }
        return vertices;
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