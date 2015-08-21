/**
 * Created by aghassaei on 5/28/15.
 */


define(['underscore', 'cam', 'three'], function(_, cam, THREE){

    var idNum = 0;

    function Component(id, json){
        this.object3D = new THREE.Object3D();
        this.id = id || ("id" + ++idNum);
        this.name = json.name || "Component" + idNum;
        this.parent = null;
        if (json.parent) this.parent = json.parent;
        this.parentObject = null;
        this.children = [];
        this.isStatic = json.isStatic;
        this.rotary = json.rotary;
        this.motionVector = new THREE.Vector3();
        if (json.centerOfRotation) this.centerOfRotation = new THREE.Vector3(json.centerOfRotation.x, json.centerOfRotation.y, json.centerOfRotation.z);
        if (json.motionVector) this.motionVector.set(json.motionVector.x, json.motionVector.y, json.motionVector.z);
        this.stlJSON = json.stl;

        this.postReset();
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
        child._addParent(this, this.id);
        this.object3D.add(child.getObject3D());
    };

    Component.prototype.checkAncestry = function(component){//return true if this is a parent/grandparent/great-grandparent...
        if (this.parentObject){
            if (this.parentObject === component) return true;
            else return this.parentObject.checkAncestry(component);
        }
        return false;
    };

    Component.prototype.getAncestry = function(ancestors){
        if (this.parent === null) return ancestors;
        ancestors.push(this.parent);
        return this.parentObject.getAncestry(ancestors);
    };

    Component.prototype._removeChild = function(child){
        if (this.children.indexOf(child) == -1){
            console.warn("not a child");
            return;
        }
        this.children.splice(this.children.indexOf(child),1);
        this.object3D.remove(child.getObject3D());
    };

    Component.prototype._addParent = function(parent, id){
        if (this.parentObject) {
            this.parentObject._removeChild(this);
            this.parentObject = null;
        }
        this.parentObject = parent;
        this.parent = id;
    };

    Component.prototype.getID = function(){
        return this.id;
    };







    //position/rotation/etc

    Component.prototype.getPosition = function(){
        return this.object3D.position.clone();
    };

    Component.prototype.getAbsolutePosition = function(){
        if (!this.parent) return this.getPosition();
        return this.parentObject.getAbsolutePosition().add(this.parentObject.applyRotation(this.getPosition()));
    };

    Component.prototype.getMotionVector = function(){
        return this.motionVector.clone();
    };

    Component.prototype.getAbsoluteMotionVector = function(){
        if (!this.parent) return this.getMotionVector();
        return this.applyAbsoluteRotation(this.getMotionVector());
    };

    Component.prototype.getRotation = function(){//for rotary axes
        return this.object3D.rotation.toVector3().clone();
    };

    Component.prototype.getOrientation = function(){
        return this.object3D.quaternion.clone();
    };

    Component.prototype.getAbsoluteOrientation = function(){
        if (!this.parent) return this.getOrientation();
        return this.getOrientation().multiply(this.parentObject.getAbsoluteOrientation());//order matters!
    };

    Component.prototype.applyRotation = function(vector){//todo local rotation?
        vector.applyQuaternion(this.getAbsoluteOrientation());
        return vector;
    };

    Component.prototype.applyAbsoluteRotation = function(vector){
        vector.applyQuaternion(this.getAbsoluteOrientation());
        return vector;
    };

    Component.prototype.setTranslucent = function(translucent){
        if (this.stl === undefined) return;
        this.stl.material.transparent = translucent;
    };




    //post processing

    Component.prototype.postReset = function(){
        this._postAngle = 0;
        this._postPosition = 0;
    };

    Component.prototype.postRotateTo = function(newAngle){
        this._postAngle = newAngle;
    };


    Component.prototype.postMoveTo = function(newPosition){
        this._postPosition = newPosition;
    };




    //simulation animation

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

    Component.prototype.moveTo = function(target, speed, callback){//all local in sim bc gcode is in local coordinate systems
        var target = this._multiplyVectors(target, this.getMotionVector());//this.getAbsoluteMotionVector()
        if (target === null){
            if (callback) callback();
            return;
        }
        target = this.applyAbsoluteRotation(target);//absolute?

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

    Component.prototype._multiplyVectors = function(target, motion){
        if (target.x === null && motion.x > 0.001) return null;
        if (target.y === null && motion.y > 0.001) return null;
        if (target.z === null && motion.z > 0.001) return null;
        var target = new THREE.Vector3(target.x, target.y, target.z);
        return target.multiply(motion);
    };

//    Component.prototype.getThisDistanceToTarget = function(target){
//        return target.clone().multiply(this.getAbsoluteMotionVector());
//    };

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
        if (this.parentObject) this.parentObject._removeChild(this);
        this.parentObject = null;
        this.parent = null;
        var self = this;
        _.each(this.children, function(child){
            self._removeChild(child);
        });
        this.children = null;
        this.name = null;
        this.object3D = null;
    };


    Component.prototype.saveJSON = function(){

    };


    Component.prototype.toJSON = function(){
        var childIDs = [];
        _.each(this.children, function(child){
            childIDs.push(child.id);
        });
        return {
            id: this.id,
            name: this.name,
            children: childIDs,
            parent: this.parent || "",
            translation: this.object3D.position,
            scale: this.object3D.scale.x,
            rotation: this.object3D.rotation.toVector3(),
            isStatic: this.isStatic,
            rotary: this.rotary,
            motionVector: this.motionVector,
            centerOfRotation: this.centerOfRotation,
            stl:this.stlJSON
        }
    };

    return Component;
});