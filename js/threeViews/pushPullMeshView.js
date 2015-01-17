/**
 * Created by aghassaei on 1/17/15.
 */

//this is a parent class for other threeJS VCs that allows push and pull scale and orientation changes in the threeJS scene

PushPullMeshView = Backbone.View.extend({


    events: {
    },

    initialize: function(options){

        this.three = options.three;

        //bind events

    }
//
//    render: function(){
//        this.three.render();
//    }

});