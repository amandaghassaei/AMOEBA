/**
 * Created by aghassaei on 8/13/15.
 */


define(['underscore', 'cam', 'three', 'component', 'lattice'], function(_, cam, THREE, Component, lattice){

    function StockComponent(id, json){

        Component.call(this, id, json);
        //material

        var self = this;
        this._makeCell(json.description, function(cell){
            self.cell = cell;
            self._setPosition(cell, json.position, json.rotation);
            self.object3D.add(cell.getObject3D());
        });
    }
    StockComponent.prototype = Object.create(Component.prototype);
    //assembler setup




    StockComponent.prototype._makeCell = function(json, callback){
        lattice.makeCellForLatticeType(json, callback);
    };

    StockComponent.prototype._setPosition = function(cell, position, rotation){
        var object3D = cell.getObject3D();//todo need this?
        object3D.position.set(position.x, position.y, position.z);
        //todo rotation
    };





    //simulation animation

    StockComponent.prototype.show = function(){
        this.cell.show();
    };

    StockComponent.prototype.hide = function(){
        if (this.cell) this.cell.hide();
    };

    StockComponent.prototype.setMode = function(){
        this.cell.setMode();
    };

    StockComponent.prototype.updatePartType = function(){//message from cam
        this.cell.destroyParts();
        this.setMode();
    };


    //helper

    StockComponent.prototype.destroy = function(){
        Component.prototype.destroy.call(this);

    };


    StockComponent.prototype.toJSON = function(){
        var json  = Component.prototype.toJSON.call(this);
        return json;
    };

    return StockComponent;
});