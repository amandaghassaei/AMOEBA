/**
 * Created by aghassaei on 5/28/15.
 */


define(['underscore', 'cam', 'three'], function(_, cam, THREE){

    var id = 0;

    function Component(id, json){
        this.object3D = new THREE.Object3D();
        this.id = id || "id" + id++;
        this.name = json.name || "";
        this.parent = null;
        this.children = [];
    }

    //assembler setup


    Component.prototype.makeGeometry = function(geo, material){
        this.stl = new THREE.Mesh(geo, material);
        this.object3D.add(this.stl);
    };

    Component.prototype.addChild = function(child){
        if (this.checkAncestry(child)){
            console.warn("can't add parent as child");
            return;
        }
        if (this.children.indexOf(child)>-1){
            console.warn("already added as a child");
            return;
        }
        this.children.push(child);
        child.addParent(this);
        this.object3D.add(child.getObject3D());
    };

    Component.prototype.checkAncestry = function(component){//return true if this is a parent/grandparent/great-grandparent...
        if (this.parent){
            if (this.parent === component) return true;
            else return this.parent.checkAncestry(component);
        }
        return false;
    };

    Component.prototype.removeChild = function(child){
        if (this.children.indexOf(child) == -1){
            console.warn("not a child");
            return;
        }
        this.children.splice(this.children.indexOf(child),1);
        this.object3D.remove(child.getObject3D());
    };

    Component.prototype.addParent = function(parent){
        if (this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }
        this.parent = parent;
    };

    Component.prototype.getID = function(){
        return this.id;
    };

    Component.prototype.setTranslucent = function(translucent){
        if (this.stl === undefined) return;
        this.stl.material.transparent = translucent;
    };




    //simulation animation

    Component.prototype.getPosition = function(){
        return this.object3D.position.clone();
    };

    Component.prototype.getRotation = function(){
        return this.object3D.rotation.toVector3().clone();
    };

    Component.prototype.getObject3D = function(){
        return this.object3D;
    };

    Component.prototype.rotateTo = function(target, speed, callback){
        if (target === null){
            if (callback) callback();
            return;
        }
        var currentPosition = this.getRotation();
        var increment = 0.15;//speed/1500.0*cam.get("simSpeed");
        var axis = new THREE.Vector3().subVectors(target, currentPosition);

        if (increment == 0 || axis.length() == 0) {
            if (callback) callback();
            return;
        }
        increment = Math.max(increment, 0.00001);//need to put a min on the increment - otherwise this stalls out with floating pt tol

        this._incrementalRotation(increment, target, axis, callback);
    };

    Component.prototype._incrementalRotation = function(increment, target, axis, callback){
        var self = this;
        setTimeout(function(){
            var remainingDist = (target.clone().sub(self.getRotation())).length();
            if (remainingDist < 0.01) {
                if (callback) callback();
                return;
            } else if (remainingDist < Math.abs(increment)){
                self.object3D.rotation.x = target.x;
                self.object3D.rotation.y = target.y;
                self.object3D.rotation.z = target.z;
                if (callback) callback();
                return;
            }

            self.object3D.rotateOnAxis(axis.clone().normalize(), increment);
            self._incrementalRotation(increment, target, axis, callback);
        }, 10);
    };

    Component.prototype.moveTo = function(target, speed, callback){
        if (target === null){
            if (callback) callback();
            return;
        }
        var currentPosition = this.getPosition();
        var increment = speed/1500.0*cam.get("simSpeed");
        var incrVector = target.clone().sub(currentPosition);

        if (increment == 0 || incrVector.length() == 0) {
            if (callback) callback();
            return;
        }
        increment = Math.max(increment, 0.00001);//need to put a min on the increment - otherwise this stalls out with floating pt tol

        incrVector.normalize().multiplyScalar(increment);
        this._incrementalMove(incrVector, target, callback);
    };

    Component.prototype._incrementalMove = function(increment, target, callback){
        var self = this;
        setTimeout(function(){
            var remainingDist = (target.clone().sub(self.getPosition())).length();
            var nextPos;
            if (remainingDist == 0) {
                if (callback) callback();
                return;
            } else if (remainingDist < increment.length()){
                nextPos = target;//don't overshoot
            } else {
                nextPos = self.getPosition();
                _.each(_.keys(nextPos), function(key){
                    nextPos[key] += increment[key];
                });
            }

            self.object3D.position.set(nextPos.x, nextPos.y, nextPos.z);
            self._incrementalMove(increment, target, callback);
        }, 10);
    };





    //helper

    Component.prototype.destroy = function(){
        if (this.parent) this.parent.removeChild(this);
        this.parent = null;
        var self = this;
        _.each(this.children, function(child){
            self.removeChild(child);
        });
        this.children = null;
        this.name = null;
        this.object3D = null;
    };


    Component.prototype.toJSON = function(){
        var childIDs = [];
        _.each(this.children, function(child){
            childIDs.push(child.id);
        });
        var parentID = "";
        if (this.parent) parentID = this.parent.id;
        return {
            id: this.id,
            name: this.name,
            children: childIDs,
            parent: parentID,
            translation: this.object3D.position,
            scale: this.object3D.scale.x,
            rotation: this.object3D.rotation
        }
    };

    return Component;
});