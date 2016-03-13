/**
 * Created by aghassaei on 1/11/16.
 */


define(["underscore", "cell", "lattice", "plist", "three"],
    function(_, DMACell, lattice, plist, THREE){

    function EMSimCell(cell){

        this.origPosition = cell.getAbsolutePosition();
//        this.rotation = cell.getAbsoluteOrientation();

        this.cell = cell;

        var material = cell.getMaterial();
        var cellSize = lattice.getPitch();
        var cellVolume = cellSize.x * cellSize.y * cellSize.z;
        this.nominalSize = cellSize;
        this.mass = material.getDensity()*cellVolume;//kg
        this.I = 2/5*this.mass*Math.pow(cellSize.x/2, 2);

        this.velocity = null;
        this.nextVelocity = null;
        this.translation = null;
        this.nextTranslation = null;
        this.quaternion = null;
        this.rotation = null;
        this.nextRotation = null;
        this.w = null;
        this.nextW = null;

        this._reset();

        this.float();

        this.neighbors = [];

        if (this.isSignalGenerator()) this.setAsSignalGenerator();

    }

    EMSimCell.prototype.getAbsoluteIndex = function(){
        return this.cell.getAbsoluteIndex();
    };

    EMSimCell.prototype.setNeighbors = function(neighbors){//precompute neighbors
        this.neighbors = neighbors;
    };

    EMSimCell.prototype.getNeighbors = function(){
        return this.neighbors;
    };

    EMSimCell.prototype.getMomentOfInertia = function(){
        return this.I;
    };

    EMSimCell.prototype.getMass = function(){
        return this.mass;//kg
    };

    EMSimCell.prototype.applyForce = function(force, dt){
        if (this._isFixed) return;
        var accel = force.multiplyScalar(1/this.mass);
        this.nextVelocity = this.getVelocity().add(accel.multiplyScalar(dt));
        this.nextTranslation = this.getTranslation().add(this.nextVelocity.clone().multiplyScalar(dt));
    };

    EMSimCell.prototype.applyTorque = function(torque, dt){
        if (this._isFixed) return;
        var accel = torque.multiplyScalar(1/this.I);
        this.nextW = this.getAngularVelocity().add(accel.multiplyScalar(dt));
        this.nextRotation = this.getRotation().add(this.nextW.clone().multiplyScalar(dt));
    };


    EMSimCell.prototype.setQuaternion = function(quaternion){
        if (this._isFixed) return;
        this.quaternion = quaternion;
        this.nextRotation = new THREE.Euler().setFromQuaternion(quaternion);
    };

    EMSimCell.prototype.setRotation = function(rotation, dt){
        if (this._isFixed) return;
        this.nextW = this.getRotation().sub(rotation).multiplyScalar(1/dt);
        this.nextRotation = rotation;
    };



    
    EMSimCell.prototype.getAbsoluteVelocity = function(){
        return this.applyRotation(this.getVelocity());
    };

    EMSimCell.prototype.getVelocity = function(){
        return this.velocity.clone();
    };

    EMSimCell.prototype.getAngularVelocity = function(){
        return this.w.clone();
    };

    EMSimCell.prototype.setTranslation = function(translation){
        this.translation = translation;
        var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);
        this._setPosition(this.origPosition.clone().add(this.translation.clone().multiplyScalar(multiplier)));
    };

    EMSimCell.prototype.getAbsolutePosition = function(){
        var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);
        return this.origPosition.clone().add(this.translation.clone().multiplyScalar(multiplier))
    };

    EMSimCell.prototype.getTranslation = function(){
        return this.translation.clone();
    };

    EMSimCell.prototype.getAbsoluteTranslation = function(){
        return this.applyRotation(this.getTranslation());
    };

    EMSimCell.prototype.getRotation = function(){
        return this.rotation.clone();
    };

    EMSimCell.prototype._setPosition = function(position){
        this.cell.object3D.position.set(position.x, position.y, position.z);
    };

    EMSimCell.prototype._setRotation = function(rotation){
        this.cell.object3D.rotation.set(rotation.x, rotation.y, rotation.z);
        this.quaternion.setFromEuler(this.cell.object3D.rotation);
    };

    EMSimCell.prototype.getQuaternion = function(){
        return this.quaternion.clone();
    };

    EMSimCell.prototype.applyRotation = function(vector){
        vector.applyQuaternion(this.getQuaternion());
        return vector;
    };
    
    
    

    EMSimCell.prototype.show = function(){
        this.cell.show();//todo pass mode
    };

    EMSimCell.prototype.showDefaultColor = function(){
        this.cell.setMaterial(this.getMaterial(true));
    };

    EMSimCell.prototype.showTranslation = function(material){
        this.cell._setTHREEMaterial(material);
    };

    DMACell.prototype.isAcutator = function(){
        return this.getMaterialID() == "piezo";
    };

    DMACell.prototype.isSignalGenerator = function(){
        return this.getMaterialID() == "signal";
    };

    DMACell.prototype.setAsSignalGenerator = function(json){
        if (json){
            this.pwm = json.pwm;
            this.frequency = json.frequency;
            this.phase = json.phase;
            this.waveformType = json.waveformType;
            this.invertSignal = json.invertSignal;
        } else {
            json = {
                pwm: 0.5,
                frequency: 10,
                phase: 0,
                waveformType: "sine",
                invertSignal: false
            };
            var self = this;
            _.each(json, function(val, key){
                if (self[key] === undefined) self[key] = val;
            });
        }
    };

    DMACell.prototype.getSignalJSON = function(){
        return {
            pwm: this.pwm,
            phase: this.phase,
            frequency: this.frequency,
            waveformType: this.waveformType,
            invertSignal: this.invertSignal
        }
    };

    DMACell.prototype.isConductive = function(){
        return this.getMaterial().isConductive();
    };

    EMSimCell.prototype.isPiezo = function(){
        return this.cell.getMaterialID() == "piezo";
    };

    EMSimCell.prototype.setNominalSize = function(size){
        this.nominalSize = size;
    };

    EMSimCell.prototype.getNominalSize = function(){
        return this.nominalSize;
    };

    DMACell.prototype.setWireGroup = function(num, force){
        if (force) this._wireGroup = num;
        else if (this._wireGroup>num){
            this._wireGroup = num;
            this.propagateWireGroup(this.calcNeighbors(this.getIndex()), num);
        }
    };

    DMACell.prototype.calcNeighbors = function(index){
        var cells = lattice.getCells();
        var sizeX = cells.length;
        var sizeY = cells[0].length;
        var sizeZ = cells[0][0].length;
        var offset = lattice.get("cellsMin");
        var x = index.x-offset.x;
        var y = index.y-offset.y;
        var z = index.z-offset.z;
        var neighbors = [];
        if (x == 0) neighbors.push(null);
        else neighbors.push(cells[x-1][y][z]);
        if (x == sizeX-1) neighbors.push(null);
        else neighbors.push(cells[x+1][y][z]);

        if (y == 0) neighbors.push(null);
        else neighbors.push(cells[x][y-1][z]);
        if (y == sizeY-1) neighbors.push(null);
        else neighbors.push(cells[x][y+1][z]);

        if (z == 0) neighbors.push(null);
        else neighbors.push(cells[x][y][z-1]);
        if (z == sizeZ-1) neighbors.push(null);
        else neighbors.push(cells[x][y][z+1]);

        return neighbors;
    };

    DMACell.prototype.getWireGroup = function(){
        return this._wireGroup;
    };

    DMACell.prototype.getNeighbors = function(){

    };

    EMSimCell.prototype.setVoltage = function(voltage){
        this.voltage = voltage;
    };

    EMSimCell.prototype.getVoltage = function(){
        return this.voltage;
    };

    DMACell.prototype.propagateWireGroup = function(neighbors, num){
        if (!this.isConductive()) return;
        if (num === undefined) num = this._wireGroup;
        _.each(neighbors, function(neighbor){
            if(neighbor) neighbor.setWireGroup(num);
        });
    };

    DMACell.prototype.conductiveGroupVisible = function(allVisible, groupNum){
        return this.isConductive() && (allVisible || groupNum == this._wireGroup);
    };



    EMSimCell.prototype.setTransparent = function(transparent){
        this.cell.setTransparent(transparent);
    };

    EMSimCell.prototype.hide = function(){
        this.cell.hide();
    };

    EMSimCell.prototype.fix = function(){
        this._isFixed = true;
        this.reset();
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

    EMSimCell.prototype.makeCompositeParam = function(param, paramNeighbor){
        if (param == paramNeighbor) return param;
        if (paramNeighbor === Infinity) return param*2;
        return 2*param*paramNeighbor/(param+paramNeighbor);
    };

    EMSimCell.prototype.getK = function(){
        return this.cell.material.getK();
    };

    EMSimCell.prototype.update = function(shouldRender){
        if (this._isFixed) return;
        var multiplier = 1/(plist.allUnitTypes[lattice.getUnits()].multiplier);
        this.translation = this.nextTranslation;
        this.velocity = this.nextVelocity;
        this.rotation = this.nextRotation;
        this.w = this.nextW;
        if (shouldRender) {
            this._setPosition(this.origPosition.clone().add(this.translation.clone().multiplyScalar(multiplier)));
            this._setRotation(this.rotation.clone());
        }
    };

    EMSimCell.prototype.numNeighbors = function(neighbors){
        var num = 0;
        _.each(neighbors, function(neighbor){
            if (neighbor) num++;
        });
        return num;
    };

    EMSimCell.prototype.reset = function(){
        this._reset();
        this._setPosition(this.origPosition.clone());
        this._setRotation(this.rotation.clone());
    };

    EMSimCell.prototype._reset = function(){
        this.velocity = new THREE.Vector3(0,0,0);
        this.translation = new THREE.Vector3(0,0,0);
        this.quaternion = new THREE.Quaternion(0,0,0,1);
        this.w = new THREE.Vector3(0,0,0);
        this.rotation = new THREE.Vector3(0,0,0);
    };

    EMSimCell.prototype.destroy = function(){
        this.cell = null;
        this.origPosition = null;
        this.rotation = null;
        this.translation = null;
        this.quaternion = null;
        var self = this;
        _.each(this.neighbors, function(neighbor, index){
            self.neighbors[index] = null;
        });
        this.neighbors = null;
    };

    return EMSimCell;

});