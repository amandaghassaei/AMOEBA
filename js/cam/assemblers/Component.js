/**
 * Created by aghassaei on 5/28/15.
 */


define(['underscore', 'cam', 'three'], function(_, cam, THREE){

    var id = 0;

    function Component(geometry, material, name){
        this.object3D = new THREE.Object3D();
        this.id = "id" + id++;
        this.name = name || "";
        this.parent = null;
        this.children = [];
    }

    //assembler setup


    Component.prototype.makeGeometry = function(geo, material){
        this.object3D.add(new THREE.Mesh(geo, material));
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
        if (child.addParent){//todo stock has no "addParent" or id
            this.children.push(child);
            child.addParent(this);
        }
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



    //simulation animation

    Component.prototype.getPosition = function(){
        return this.object3D.position.clone();
    };

    Component.prototype.getObject3D = function(){
        return this.object3D;
    };

    Component.prototype.moveTo = function(target, speed, callback){
        var currentPosition = this.getPosition();
        var diff = _.clone(target);
        _.each(_.keys(target), function(key){
            diff[key] -= currentPosition[key];
        });

        var diffLength = this._getLength(diff);
        var increment = speed/25*cam.get("simSpeed");

        if (increment == 0 || diffLength == 0) {
            if (callback) callback();
            return;
        }
        increment = Math.max(increment, 0.00001);//need to put a min on the increment - otherwise this stalls out with floating pt tol

        var incrementVector = diff;
        _.each(_.keys(incrementVector), function(key){
            incrementVector[key] *= increment/diffLength;
        });

        this._incrementalMove(incrementVector, target, callback);
    };

    Component.prototype._remainingDistanceToTarget = function(target){
        var position = this.getPosition();
        var dist = 0;
        _.each(_.keys(target), function(key){
            dist += Math.pow(target[key] - position[key], 2);
        });
        return dist;
    };

    Component.prototype._getLength = function(vector){
        var length = 0;
        _.each(_.keys(vector), function(key){
            length += Math.pow(vector[key], 2);
        });
        return length;
    };

    Component.prototype._incrementalMove = function(increment, target, callback){
        var self = this;
        setTimeout(function(){
            var remainingDist = Math.abs(self._remainingDistanceToTarget(target));
            var nextPos;
            if (remainingDist == 0) {
                if (callback) callback();
                return;
            } else if (remainingDist < self._getLength(increment)){
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