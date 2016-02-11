/**
 * Created by aghassaei on 6/2/15.
 */

//globals namespace, not sure if there's a way to get around this

define(['backbone'], function(Backbone){

    var Globals = Backbone.Model.extend({
        defaults:{
            baseplane: null,
            highlighter: null,
            selection3D: null
        },

        destroySelection3D: function(){
            if (this.get("selection3D")) this.get("selection3D").destroy();
            this.set("selection3D", null);
        }


    });
    return new Globals();
});