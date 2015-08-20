/**
 * Created by aghassaei on 8/13/15.
 */


define(['underscore', 'cam', 'three', 'component', 'lattice', 'threeModel'],
    function(_, cam, THREE, Component, lattice, three){

    function StockComponent(id, json){

        Component.call(this, id, json);
        //material

        var self = this;
        this._makeCell(json.description, function(cell){
            self.cell = cell;
            self._setPosition(cell, json.translation, json.rotation);
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
        if (position) object3D.position.set(position.x, position.y, position.z);
        if (rotation) object3D.rotation.set(rotation.x, rotation.y, rotation.z);
    };

    StockComponent.prototype.getPosition = function(){
        return this.cell.getPosition();
    };

    StockComponent.prototype.setMaterial = function(materialName){
        this.cell.changeMaterial(materialName);
        three.render();
    };

    StockComponent.prototype.getMaterial = function(){
        return this.cell.getMaterialName();
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
        json.description = {
            materialName: this.cell.materialName,
            length: this.cell.getLength()
        };
        return json;
    };

    return StockComponent;
});