/**
 * Created by aghassaei on 1/16/15.
*/


FillGeometry = Backbone.Model.extend({

    defaults: {
        filename: "No File Loaded",
        mesh: null,
        boundingBox: null//show bounding box for mesh
    },

    initialize: function(){

        //bind events
    },

    buildNewMesh:function(geometry){
        this.removeMesh();

        //center geometry in x and y
        geometry.computeBoundingBox();
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-geometry.boundingBox.min.z));//set on top of baseplane
        geometry.computeBoundingBox();

        var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(
            {color:0xf25536,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.4,
                side:THREE.DoubleSide}));
        this.makeBoundingBox(mesh);
        this.set({mesh: mesh});
        globals.three.sceneAdd(mesh);
        globals.three.render();
    },

    makeBoundingBox: function(mesh){
        var box = new THREE.BoxHelper(mesh);
        box.material.color.setRGB(0,0,0);
        box.material.opacity = 0.4;
        box.material.transparent = true;
        this.set("boundingBox", box);
//        globals.three.sceneAdd(box);
    },

    fillGeo: function(){
        var boundingBox = this.get("boundingBox");
        boundingBox.geometry.computeBoundingBox();
        var bounds = boundingBox.geometry.boundingBox;

        var scale = globals.lattice.get("scale");

        var minIndex = globals.lattice.getIndexForPosition(bounds.min);
        var maxIndex = globals.lattice.getIndexForPosition(bounds.max);
        globals.lattice.checkForMatrixExpansion(null, maxIndex, minIndex);//expand cells matrix before

        var raycaster = new THREE.Raycaster();
        var direction = new THREE.Vector3(0,0,1);
        var mesh = this.get("mesh");
        raycaster.near = 0;
        raycaster.far = bounds.max-bounds.min+2;//add some padding just in case
        for (var x=minIndex.x;x<=maxIndex.x;x++){
            for (var y=minIndex.y;y<=maxIndex.y;y++){
                var origin = globals.lattice.getPositionForIndex({x:x, y:y, z:minIndex.z});
                origin.z = bounds.min.z-1;//more padding
                raycaster.set(origin, direction);
                var intersections = raycaster.intersectObject(mesh);
                if (intersections.length == 0) continue;
                var inside = false;
                var nextIntersectionIndex = 0;
                var nextIntersection = intersections[nextIntersectionIndex].distance;
                for (var z=minIndex.z;z<=maxIndex.z;z++){
                    var index = {x:x,y:y,z:z};
                    var position = globals.lattice.getPositionForIndex(index);
                    if (!inside){
                        if (position.z<nextIntersection) continue;
                        else {
                            inside = true;
                            globals.lattice.addCellAtIndex(index, true, true);
                        }
                    } else {
                        if (position.z<nextIntersection) {
                            globals.lattice.addCellAtIndex(index, true, true);
                            continue;
                        }
                        else inside = false;
                    }
                    var next = this._getNextIntersection(position, intersections, nextIntersectionIndex, inside);
                    if (!next) break;
                    inside = next.inside;
                    nextIntersection = next.nextIntersection;
                    nextIntersectionIndex = next.nextIntersetcionIndex;
                }
            }
        }
        globals.three.render();
    },

    _getNextIntersection: function(position, intersections, nextIntersectionIndex, inside){
        nextIntersectionIndex += 1;
        if (nextIntersectionIndex < intersections.length) {
            var nextIntersection = intersections[nextIntersectionIndex].distance;
            if (nextIntersection < position.z) return this._getNextIntersection(position, intersections, nextIntersectionIndex, !inside);
            return {nextIntersection:nextIntersection, nextIntersetcionIndex: nextIntersectionIndex, inside:inside};
        }
        else return null;
    },

    subtractGeo: function(){
        globals.lattice.subtractMesh(this.get("mesh"));
    },

    removeMesh: function(){
        if (!this.get("mesh")) return;
        globals.three.sceneRemove(this.get("mesh"));
        globals.three.sceneRemove(this.get("boundingBox"));
        this.set("mesh", null);
        this.set("boundingBox", null);
        this.set("filename", this.defaults.filename);
        globals.three.render();
    },

    scale: function(scale){
//        var currentScale = this.get("scale");
//        for (var i=0;i<currentScale.length;i++){
//            if (!scale[i]) scale[i] = currentScale[i];
//        }
//        this.get("mesh").scale.set(scale[0], scale[1], scale[2]);
//        this.set("scale", scale);
    }
});

