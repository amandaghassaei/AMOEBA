/**
 * Created by aghassaei on 1/16/15.
*/

define(['three', 'underscore', 'backbone', 'lattice', 'threeModel'],
    function(THREE, _, Backbone, lattice, three){

    return Backbone.Model.extend({
    
        defaults: {
            filename: "No File Loaded",
            mesh: null,
            boundingBox: null,//show bounding box for mesh
            scale: 1
        },
    
        initialize: function(){
    
            //bind events
            this.listenTo(this, "change:scale", this._changeScale);
        },
    
        buildNewMesh:function(geometry){
            this.removeMesh();
    
            //center geometry in x and y
            geometry.computeBoundingBox();
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-geometry.boundingBox.min.z));//set on top of baseplane
            geometry.computeBoundingBox();
    
            var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
                color:0xf25536,
                shading: THREE.FlatShading,
                transparent:true,
                opacity:0.4,
                side:THREE.DoubleSide
            }));
            this.set({mesh: mesh});
            three.sceneAdd(mesh);
            three.render();
        },
    
        fillGeo: function(){
            var boundingBox = this.get("mesh").geometry.boundingBox;
    
            var scale = this.get("scale");
            var scaledMin = boundingBox.min.clone().multiplyScalar(scale);
            var scaledMax = boundingBox.max.clone().multiplyScalar(scale);
            console.log(scaledMin);
            console.log(scaledMax);
    
            var minIndex = lattice.getIndexForPosition(scaledMin);
            var maxIndex = lattice.getIndexForPosition(scaledMax);
            console.log(minIndex);
            console.log(maxIndex);
            lattice.checkForMatrixExpansion(null, maxIndex, minIndex);//expand cells matrix before
    
            var raycaster = new THREE.Raycaster();
            var direction = new THREE.Vector3(0,0,1);
            var mesh = this.get("mesh");
            raycaster.near = 0;
            raycaster.far = scaledMax.z-scaledMin.z+2;//add some padding just in case
            for (var x=minIndex.x;x<=maxIndex.x;x++){
                for (var y=minIndex.y;y<=maxIndex.y;y++){
                    var origin = lattice.getPositionForIndex(new THREE.Vector3(x, y, minIndex.z));
                    origin.z = scaledMin.z-1;//more padding
                    raycaster.set(origin, direction);
                    var intersections = raycaster.intersectObject(mesh);
                    if (intersections.length == 0) continue;
                    var inside = false;
                    var nextIntersectionIndex = 0;
                    var nextIntersection = intersections[nextIntersectionIndex].distance;
                    for (var z=minIndex.z;z<=maxIndex.z;z++){
                        var index = new THREE.Vector3(x, y, z);
                        var position = lattice.getPositionForIndex(index);
                        if (!inside){
                            if (position.z<nextIntersection) continue;
                            else {
                                inside = true;
                                lattice.getUItarget().addCellAtIndex(index, true, true);
                            }
                        } else {
                            if (position.z<nextIntersection) {
                                lattice.getUItarget().addCellAtIndex(index, true, true);
                                continue;
                            }
                            else inside = false;
                        }
                        var next = this._getNextIntersection(position, intersections, nextIntersectionIndex, inside);
                        if (!next) break;
                        inside = next.inside;
                        nextIntersection = next.nextIntersection;
                        nextIntersectionIndex = next.nextIntersectionIndex;
                    }
                }
            }
            three.render();
        },
    
        _getNextIntersection: function(position, intersections, nextIntersectionIndex, inside){
            nextIntersectionIndex += 1;
            if (nextIntersectionIndex < intersections.length) {
                var nextIntersection = intersections[nextIntersectionIndex].distance;
                if (nextIntersection < position.z) return this._getNextIntersection(position, intersections, nextIntersectionIndex, !inside);
                return {nextIntersection:nextIntersection, nextIntersectionIndex: nextIntersectionIndex, inside:inside};
            }
            else return null;
        },
    
        subtractGeo: function(){
            lattice.subtractMesh(this.get("mesh"));
        },
    
        removeMesh: function(){
            if (!this.get("mesh")) return;
            three.sceneRemove(this.get("mesh"));
            three.sceneRemove(this.get("boundingBox"));
            this.set("mesh", null);
            this.set("boundingBox", null);
            this.set("filename", this.defaults.filename);
            three.render();
        },
    
        _changeScale: function(){
            var scale = this.get("scale");
            this.get("mesh").scale.set(scale, scale, scale);
            three.render();
        }
    });
});

