/**
 * Created by ghassaei on 2/18/16.
 */

define(['underscore'], function(_){

    function EMWire(){
        this.cells = [];
        this.signals = [];
    }

    EMWire.prototype.addCell = function(cell){
        this.cells.push(cell);
    };

    EMWire.prototype.addSignal = function(signal){
        this.signals.push(signal);
        return this.signals.length > 1;
    };


    EMWire.prototype.destroy = function(){
        var self = this;
        _.each(this.cells, function(cell, index){
            self.cells[index] = null;
        });
        _.each(this.signals, function(signal, index){
            self.signals[index] = null;
        });
        this.cells = null;
    };


    return EMWire;


});