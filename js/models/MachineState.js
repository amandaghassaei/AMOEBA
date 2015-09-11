/**
 * Created by aghassaei on 9/11/15.
 */


define(['backbone'], function(Backbone){

    var MachineState = Backbone.Model.extend({

        defaults:{
            xAxis: null,
            yAxis: null,
            zAxis: null,
            aAxis: null,
            bAxis: null,
            cAxis: null
        },

        destroy: function(){
            this.set("xAxis", null, {silent:true});
            this.set("yAxis", null, {silent:true});
            this.set("zAxis", null, {silent:true});
            this.set("aAxis", null, {silent:true});
            this.set("bAxis", null, {silent:true});
            this.set("cAxis", null, {silent:true});
        }


    });

    return MachineState;

});