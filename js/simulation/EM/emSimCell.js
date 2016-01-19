/**
 * Created by aghassaei on 1/11/16.
 */


define(["cell", "lattice", "plist"], function(DMACell, lattice, plist){


    function EMSimCell(cell){

        this.position = cell.getAbsolutePosition();
        this.rotation = cell.getAbsoluteOrientation();

        this.cell = cell;

        var material = cell.getMaterial();
        var cellSize = lattice.getAspectRatio().multiplyScalar(plist.allUnitTypes[lattice.getUnits()].multiplier);
        var cellVolume = cellSize.x * cellSize.y * cellSize.z;
        this.mass = material.getDensity()*cellVolume;//kg

        this.velocity = null;
        this.nextVelocity = null;
        this.deltaPosition = null;
        this.nextDeltaPosition = null;
        this.deltaRotation = null;

        this._reset();

        this.float();

    }

    EMSimCell.prototype.getMass = function(){
        return this.mass;//kg
    };

    EMSimCell.prototype.applyForce = function(force, dt){
        if (this._isFixed) return;
        var accel = force.multiplyScalar(1/this.mass);
        this.nextVelocity = this.getVelocity().add(accel.multiplyScalar(dt));
        this.nextDeltaPosition = this.getDeltaPosition().add(this.nextVelocity.clone().multiplyScalar(dt));
    };

    EMSimCell.prototype._setVelocity = function(velocity){
        this.velocity = velocity;
    };

    EMSimCell.prototype.getVelocity = function(){
        return this.velocity.clone();
    };

    EMSimCell.prototype._setDeltaPosition = function(delta){
        this.deltaPosition = delta;
    };

    EMSimCell.prototype.getDeltaPosition = function(){
        return this.deltaPosition.clone();
    };

    EMSimCell.prototype._setDeltaRotation = function(delta){
        this.deltaRotation = delta;
    };

    EMSimCell.prototype._setPosition = function(position){
        this.cell.object3D.position.set(position.x, position.y, position.z);
    };

    EMSimCell.prototype.show = function(){
        this.cell.show();
    };

    EMSimCell.prototype.hide = function(){
        this.cell.hide();
    };

    EMSimCell.prototype.fix = function(){
        this._isFixed = true;
    };

    EMSimCell.prototype.float = function(){
        this._isFixed = false;
    };

    EMSimCell.prototype.isFixed = function(){
        return this._isFixed;
    };

    EMSimCell.prototype.getMaterial = function(){
        return this.cell.getMaterial();
    };

    EMSimCell.prototype.update = function(){
        if (this._isFixed) return;
        var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);
        this.deltaPosition = this.nextDeltaPosition;
        this.velocity = this.nextVelocity;
        this._setPosition(this.position.clone().add(this.deltaPosition.clone().multiplyScalar(multiplier)));
    };

    EMSimCell.prototype.reset = function(){
        this._reset();
        this._setPosition(this.position.clone());
    };

    EMSimCell.prototype._reset = function(){
        this._setVelocity(new THREE.Vector3(0,0,0));
        this._setDeltaPosition(new THREE.Vector3(0,0,0));
        this._setDeltaRotation(new THREE.Quaternion(0,0,0,1));
    };

    EMSimCell.prototype.destroy = function(){
        this.cell = null;
        this.position = null;
        this.rotation = null;
        this.deltaPosition = null;
        this.deltaRotation = null;
    };

    return EMSimCell;

});