/**
 * Created by ghassaei on 2/18/16.
 */

define([], function(){

    function EMWire(){
        this.cells = [];
    }

    EMWire.prototype.addCell = function(cell){
        this.cells.push(cell);
    };


    EMWire.prototype.destroy = function(){
        var self = this;
        _.each(this.cells, function(cell, index){
            self.cells[index] = null;
        });
        this.cells = null;
    };


    return EMWire;


});