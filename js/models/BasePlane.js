/**
 * Created by aghassaei on 1/31/15.
 */


BasePlane = Backbone.Model.extend({

    defaults: {
        zIndex: 0,
        mesh: [],
        dimX: 100,
        dimY: 100,
        material: new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.2, wireframe:true})
    },

    initialize: function(){

        //bind events
        this.listenTo(this, "change:zIndex", this._renderZIndexChange);

        //draw mesh
        this.set("mesh", this._makeBasePlaneMesh());

        var self = this;
        _.each(this.get("mesh"), function(mesh){
            globals.three.sceneAdd(mesh, self._checkIsHighlightable(mesh));
        });
        globals.three.render();
    },

    updateXYSeparation: function(xySep) {},

    getOrientation: function(){
        return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI);
    },

    ///////////////////////////////////////////////////////////////////////////////////
    //////////////////////HIGHLIGHTER FUNCTIONALITY////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    _checkIsHighlightable: function(mesh){
        if (mesh.type == "Mesh") return "basePlane";//don't try to highlight wireframe parts of baseplane
        return null;
    },

    ///////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////DEALLOC////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////

    _removeMesh: function(){
        var self = this;
        _.each(this.get("mesh"), function(mesh){
            if (mesh.myParent) mesh.myParent = null;
            globals.three.sceneRemove(mesh, self._checkIsHighlightable(mesh));
        });
        globals.three.render();
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
                    faces.push(new THREE.Face3(3*currentOffset-4, 3*currentOffset-8-6*dimY, 3*currentOffset-6-6*dimY));//pt, base, base
                } else {
                    faces.push(new THREE.Face3(3*currentOffset-1, 3*currentOffset-8-6*dimY, 3*currentOffset-6-6*dimY));//pt, base, base
                }

            }

        }

        geometry.computeFaceNormals();
        var mesh = new THREE.Mesh(geometry, this.get("material"));
        mesh.myParent = this;//reference used for intersection highlighting
        return [mesh];
    },

    getType: function(){//todo hack from freeform octa, get rid of this eventually
        return "octa";
    },

    _renderZIndexChange: function(){
        var zIndex = this.get("zIndex");
        var xScale = globals.lattice.xScale();
        var yScale = globals.lattice.yScale();
        var zScale = globals.lattice.zScale();

        _.each(this.get("mesh"), function(mesh){
            mesh.position.set(xScale*(zIndex%2)/2, -yScale/3*(zIndex%2), zIndex*zScale);
            mesh.rotation.set(Math.PI*(zIndex%2),0,0)
        });
        globals.three.render();
    },

    _calcOctaFaceVertices: function(xySep){

        var vertices = [];

        var xScale = globals.lattice.xScale();
        var yScale = globals.lattice.yScale();

        var dimX = this.get("dimX");
        var dimY = this.get("dimY");

        var baseVertOffset = xySep/Math.sqrt(3);
        var pointVertOffset = 2*baseVertOffset;
        var horizontalOffset = xySep;

        for (var j=-dimX;j<=dimX;j++){
            for (var i=-dimY;i<=dimY;i++){

                var xOffset = 0;
                if (Math.abs(j)%2!=0) {
                    xOffset = 1/2*xScale;
                }

                vertices.push(new THREE.Vector3(i*xScale + xOffset - horizontalOffset, j*yScale + baseVertOffset, 0));
                vertices.push(new THREE.Vector3(i*xScale + xOffset + horizontalOffset, j*yScale + baseVertOffset, 0));
                vertices.push(new THREE.Vector3(i*xScale + xOffset, j*yScale - pointVertOffset, 0));

            }

        }
        return vertices;
    },

    updateXYSeparation: function(xySep){
        var geometry = this.get("mesh")[0].geometry;
        geometry.vertices = this._calcOctaFaceVertices(xySep);
        geometry.verticesNeedUpdate = true;
    },

    calcHighlighterPosition: function(face, position){
        var index = globals.lattice.getIndexForPosition(position);
        if (index.z%2 != 0) index.x -= 1;
        index.z = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
        var position = globals.lattice.getPositionForIndex(index);
        position.z += globals.lattice.zScale()/2;
        return {index: index, direction: new THREE.Vector3(0,0,1), position:position};
    }

});


///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CUBE GRID/////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

SquareBasePlane = BasePlane.extend({

    _makeBasePlaneMesh: function(){

        var scale = globals.lattice.xScale();
        var dimX = this.get("dimX")*scale;
        var dimY = this.get("dimY")*scale;

        var geometry = new THREE.Geometry();

        for ( var i = - dimX; i <= dimX; i += scale ) {
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

        var mesh = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.0}));
        mesh.myParent = this;//reference used for intersection highlighting
        return [mesh, new THREE.Line(geometry, new THREE.LineBasicMaterial({color:0x000000, transparent:true, linewidth:2, opacity:this.get("material").opacity}), THREE.LinePieces)];
    },

    _renderZIndexChange: function(){
        var zIndex = this.get("zIndex");
        var zScale = globals.lattice.zScale();
        _.each(this.get("mesh"), function(mesh){
            mesh.position.set(0, 0, zIndex*zScale);
        });
        globals.three.render();
    },

    calcHighlighterPosition: function(face, position){
        var index = globals.lattice.getIndexForPosition(position);
        index.z = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
        var latticePosition = globals.lattice.getPositionForIndex(index);
        latticePosition.z += globals.lattice.zScale()/2;
        return {index: index, direction: new THREE.Vector3(0,0,1), position:latticePosition};
    }

});



///////////////////////////////////////////////////////////////////////////////////
//////////////////////////OCTA EDGE ROT////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

RotEdgeOctaBasePlane = SquareBasePlane.extend({

    calcHighlighterPosition: function(face, position){
        var index = globals.lattice.getIndexForPosition(position);
        index.z = this.get("zIndex") - 1;//pretend we're on the top of the cell underneath the baseplane
        var latticePosition = globals.lattice.getPositionForIndex(index);
        latticePosition.x -= globals.lattice.xScale()/2;
        latticePosition.y -= globals.lattice.yScale()/2;
        return {index: index, direction: new THREE.Vector3(0,0,1), position:latticePosition};
    }
});