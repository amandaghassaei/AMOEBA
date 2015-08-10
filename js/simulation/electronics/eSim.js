/**
 * Created by aghassaei on 6/29/15.
 */


define(['underscore', 'backbone'], function(_, Backbone){

    var eSim = Backbone.Model.extend({

        defaults:{
            conductorGroups: null,//[{id: xx, current:xx, voltage:xx}]
            visibleConductorGroup: -1,//-2 = show everything, -1 = show all conductors
            globalInductance: null,
            voltageUnits: "1",
            currentUnits: "0.001",
            dielectricPerm: 1.00,

            simulationRes: 3,
            simZHeight: 1,

            //statics
            electricField: null,
            chargeField: null,
            capacitanceField: null,
            globalCapacitance: null,
            numRelaxationSteps: 5,
            visibleStaticSim: "none"//eField, charge, capacitance
        }


    });

    return new eSim();
});