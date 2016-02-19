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

    EMWire.prototype.getSignal = function(){
        return this.signals[0];
    };

    EMWire.prototype.calcVotage = function(time){
        var signal = this.getSignal();
        if (!signal) return 0;
        var frequency = signal.frequency;
        var period = 1/frequency;
        var waveform = signal.waveformType;
        var currentPhase = (time%period)/period;
        if (waveform == "sine"){
            return 0.5*Math.sin(2*Math.PI*currentPhase) + 0.5;
        }
        if (waveform == "square"){
            var pwm = signal.pwm;
            if (currentPhase < pwm/100) return 1;
            return 0;
        }
        if (waveform == "saw"){
            return currentPhase;
        }
        if (waveform == "triangle"){
            if (currentPhase < 0.5) return currentPhase*2;
            return 1-(currentPhase-0.5)*2;
        }
        return 0;
    };

    EMWire.prototype.setVoltage = function(voltage){
        _.each(this.cells, function(cell){
            cell.setVoltage(voltage);
        });
        if (this.getSignal()) this.getSignal().setVoltage(voltage);
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