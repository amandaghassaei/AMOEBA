/**
 * Created by aghassaei on 6/29/15.
 */


define(['underscore', 'backbone'], function(_, Backbone){

    var eSim = Backbone.Model.extend({

        defaults:{
            conductorGroups: null,
            visibleConductorGroup: -1
        }


    });

    return new eSim();
});