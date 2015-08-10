/**
 * Created by aghassaei on 6/29/15.
 */


define(['underscore', 'backbone'], function(_, Backbone){

    var eSim = Backbone.Model.extend({

        defaults:{
            conductorGroups: null,//[{id: xx, current:xx, voltage:xx}]
            visibleConductorGroup: -1,
            globalCapacitance: null,
            globalInductance: null
        }


    });

    return new eSim();
});