/**
 * Created by aghassaei on 9/11/15.
 */


define(['underscore', 'backbone'], function(_, Backbone){

    var MachineState = Backbone.Model.extend({

        defaults:{
            x: null,
            y: null,
            z: null,
            a: null,
            b: null,
            c: null,
            status: 0
        },

        setPosition: function(data){
            var self = this;
            _.each(this.attributes, function(attribute, key){
                var val = data["pos" + key];
                if (val !== null && val !== undefined) self.set(key, val);
            });
            if (data.stat !== null && data.stat !== undefined) {
                this.set("status", data.stat);
                if (this.isReadyStatus(data.stat)) this._triggerNextCommand();
            }
        },

        isReadyStatus: function(status){
            if (status === undefined) status = this.get("status");
            return status == 1 || status == 3 || status == 4;
        },

        _triggerNextCommand: function(){
            this.trigger("readyForNextCommand");
        },

        refresh: function(){
            this.set(this.defaults);
        }


    });

    return new MachineState();

});