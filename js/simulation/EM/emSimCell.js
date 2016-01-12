/**
 * Created by aghassaei on 1/11/16.
 */


define(["cell"], function(DMACell){


    function EMSimCell(cell){

        this.position = cell.getAbsolutePosition();
        this.rotation = cell.getAbsoluteOrientation();

        this.deltaPosition = new THREE.Vector3(0,0,0);
        this.deltaRotation = new THREE.Quaternion(0,0,0,1);

        this.cell = cell;


    }

    EMSimCell.prototype._setPosition = function(position){
        this.cell.object3D.position.set(position);
    };

    EMSimCell.prototype.update = function(){
        this._setPosition(this.position.clone().add(this.deltaPosition));
    };

    EMSimCell.prototype.reset = function(){
        this._setPosition(this.position.clone());
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