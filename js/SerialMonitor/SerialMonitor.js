/**
 * Created by aghassaei on 9/9/15.
 */


define(['backbone'], function(Backbone){

    var SerialMonitor = Backbone.Model.extend({

        defaults: {
            autoscroll: true
        }

    });

    return new SerialMonitor();
});