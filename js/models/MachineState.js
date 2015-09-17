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
                if (data.stat == 1 || data.stat == 3 || data.stat == 4) this._triggerNextCommand();
            }
        },

        setFooterStatus: function(data){
            if (data[1] == 0){//ok status
                this.set("status", 3);
                this._triggerNextCommand();
            } else this.set("status", 10);
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