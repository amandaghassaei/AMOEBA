/**
 * Created by aghassaei on 1/31/15.
 */


BasePlane = Backbone.Model.extend({

    defaults: {
        zIndex: 0,
        mesh: [],
        dimX: 100,
        dimY: 100,
        material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true, side:THREE.DoubleSide}),
//        currentScene: "default",
//        allScenes: {default:"Default", "mars":"Mars"}
    },

    initialize: function(options){

        //bind events
//        this.listenTo(this, "change:currentScene", this._renderForCurrentScene);
        this.listenTo(this, "change:zIndex", this._renderZIndexChange);

        //draw mesh
        this.set("mesh", this._makeBasePlaneMesh());
        this.updateScale(options.scale);
        this._showMesh();//do this once

    },

    updateScale: function(scale){
        _.each(this.get("mesh"), function(mesh){
            mesh.scale.set(scale, scale, scale);
        });
    },

    _showMesh: function(){
        var self = this;
        _.each(this.get("mesh"), function(mesh){
            window.three.sceneAdd(mesh, self._checkIsHighlightable(mesh));
        });
        window.three.render();
    },

//    _renderForCurrentScene: function(){
//    },

    ///////////////////////////////////////////////////////////////////////////////////
    //////////////////////HIGHLIGHTER FUNCTIONALITY////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    _checkIsHighlightable: function(mesh){
        if (mesh.type == "Mesh") return "basePlane";
        return null;
    },

    getIndex: function(face){
        return window.lattice.getIndexForPosition(face.geometry.vertices[0]);
    },

    canRemove: function(){
        return false;//tells highlighter that the baseplane is not something to be deleted
    },

    //subclasses handle getHighlighterVertices

    ///////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////DEALLOC////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    _removeMesh: function(){
        var self = this;
        _.each(this.get("mesh"), function(mesh){
            if (mesh.myParent) mesh.myParent = null;
            window.three.sceneRemove(mesh, self._checkIsHighlightable(mesh));
        });
        window.three.render();
    },

    destroy: function(){
        this.stopListening();
        this.set("zIndex", null, {silent:true});
        this._removeMesh();
        this.set("mesh", null, {silent:true});
        this.set("material", null, {silent:true});
        this.set("unitGeometry", null, {silent:true});
        this.set("dimX", null, {silent:true});
        this.set("dimY", null, {silent:true});
    }

});



///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////OCTA FACE/////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

OctaBasePlane = BasePlane.extend({

    _makeBasePlaneMesh: function(){

        var geometry = new THREE.Geometry();
        geometry.dynamic = true;
        geometry.vertices = this._calcOctaFaceVertices(0.0);
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
        var mesh = new THREE.Mesh(geometry, this.get("material"));
        mesh.myParent = this;//reference used for intersection highlighting
        return [mesh];
    },

    _renderZIndexChange: function(){
        var zIndex = this.get("zIndex");
        var scale = this.get("mesh")[0].scale.z;
        _.each(this.get("mesh"), function(mesh){
            mesh.position.set(0, 0, zIndex*scale*2/Math.sqrt(6));
        });
        window.three.render();
    },

    _calcOctaFaceVertices: function(colSep){

        var vertices = [];
        var latticeScale = 1+2*colSep;
        var triangleHeight = latticeScale/2*Math.sqrt(3);
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
                    xOffset = 1/2*latticeScale;
                }

                vertices.push(new THREE.Vector3(i*latticeScale + xOffset - horizontalOffset, j*triangleHeight + baseVertOffset, 0));
                vertices.push(new THREE.Vector3(i*latticeScale + xOffset + horizontalOffset, j*triangleHeight + baseVertOffset, 0));
                vertices.push(new THREE.Vector3(i*latticeScale + xOffset, j*triangleHeight - pointVertOffset, 0));

            }

        }
        return vertices;
    },

    updateColSeparation: function(colSep){
        var geometry = this.get("mesh")[0].geometry;
        geometry.vertices = this._calcOctaFaceVertices(colSep);
        geometry.verticesNeedUpdate = true;
    },

    getHighlighterVertices: function(face){
        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var mesh = this.get("mesh")[0];
        var vertices = mesh.geometry.vertices;
        var newVertices = [vertices[face.a].clone(), vertices[face.b].clone(), vertices[face.c].clone()];
        var scale = mesh.scale.x;
        var position = (new THREE.Vector3()).setFromMatrixPosition(mesh.matrixWorld);
        _.each(newVertices, function(vertex){//apply scale
            vertex.multiplyScalar(scale);
            vertex.add(position);
        });
        return newVertices;
    },

    highlighterFaces: function(){
        return [new THREE.Face3(0,1,2), new THREE.Face3(0,0,0)];
    }

});

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CUBE GRID/////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

SquareBasePlane = BasePlane.extend({

    _makeBasePlaneMesh: function(){

        var dimX = this.get("dimX");
        var dimY = this.get("dimY");

        var geometry = new THREE.Geometry();

        for ( var i = - dimX; i <= dimX; i += 1 ) {
            geometry.vertices.push( new THREE.Vector3(-dimX, i, 0));
            geometry.vertices.push( new THREE.Vector3(dimX, i, 0));
            geometry.vertices.push( new THREE.Vector3(i, -dimX, 0));
            geometry.vertices.push( new THREE.Vector3(i, dimX, 0));

        }

        var planeGeometry = new THREE.Geometry();
        planeGeometry.vertices.push( new THREE.Vector3(-dimX, -dimX, 0));
        planeGeometry.vertices.push( new THREE.Vector3(dimX, -dimX, 0));
        planeGeometry.vertices.push( new THREE.Vector3(-dimX, dimX, 0));
        planeGeometry.vertices.push( new THREE.Vector3(dimX, dimX, 0));
        planeGeometry.faces.push(new THREE.Face3(0, 1, 3));
        planeGeometry.faces.push(new THREE.Face3(0, 3, 2));
        planeGeometry.computeFaceNormals();

        var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.0, side:THREE.DoubleSide}));
        mesh.myParent = this;//reference used for intersection highlighting
        return [mesh, new THREE.Line(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}), THREE.LinePieces)];
    },

    _renderZIndexChange: function(){
        var zIndex = this.get("zIndex");
        var scale = this.get("mesh")[0].scale.z;
        _.each(this.get("mesh"), function(mesh){
            mesh.position.set(0, 0, zIndex*scale);
        });
        window.three.render();
    },

    getHighlighterVertices: function(face, position){
        //the vertices don't include the position transformation applied to cell.  Add these to create highlighter vertices
        var index = window.lattice.getIndexForPosition(position);
        index.z += 1;
        var scale = this.get("mesh")[0].scale.x;
        var vertices = [];
        vertices.push(new THREE.Vector3(index.x*scale, index.y*scale, index.z*scale));
        vertices.push(new THREE.Vector3((index.x+1)*scale, index.y*scale, index.z*scale));
        vertices.push(new THREE.Vector3((index.x+1)*scale, (index.y+1)*scale, index.z*scale));
        vertices.push(new THREE.Vector3(index.x*scale, (index.y+1)*scale, index.z*scale));

        return vertices;
    },

    highlighterFaces: function(){
        return [new THREE.Face3(0,1,2), new THREE.Face3(0,2,3)];
    }


});