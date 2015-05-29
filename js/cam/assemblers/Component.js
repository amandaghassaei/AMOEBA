/**
 * Created by aghassaei on 5/28/15.
 */


function Component(geometry, material){
    this.object3D = new THREE.Mesh(geometry, material);
}

Component.prototype.getPosition = function(){
    return this.object3D.position.clone();
};

Component.prototype.getObject3D = function(){
    return this.object3D;
};

Component.prototype.addChild = function(child){
    this.object3D.add(child.getObject3D());
};

Component.prototype.moveTo = function(target, speed, callback){
    var currentPosition = this.getPosition();
    var diff = _.clone(target);
    _.each(_.keys(target), function(key){
        diff[key] -= currentPosition[key];
    });

    var diffLength = this._getLength(diff);
    var increment = speed/25*globals.cam.get("simSpeed");

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

        console.log(nextPos);
        self.object3D.position.set(nextPos.x, nextPos.y, nextPos.z);
        self._incrementalMove(increment, target, callback);
    }, 10);
};

Component.prototype.destroy = function(){
    if (this.object3D && this.object3D.parent) this.object3D.parent.remove(this.object3D);
    this.object3D = null;
};