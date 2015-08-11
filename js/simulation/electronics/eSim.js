/**
 * Created by aghassaei on 6/29/15.
 */


define(['underscore', 'backbone', 'threeModel'], function(_, Backbone, three){

    var eSim = Backbone.Model.extend({

        defaults:{
            conductorGroups: null,//{{current:xx, voltage:xx}, ...}
            visibleConductorGroup: -1,//-2 = show everything, -1 = show all conductors
            globalInductance: null,
            voltageUnits: "1",
            currentUnits: "0.001",
            dielectricPerm: 1.00,

            simulationRes: 3,
            simZHeight: 1,

            //statics
            potentialField: null,
            electricField: null,
            chargeField: null,
            capacitanceField: null,
            globalCapacitance: null,
            numRelaxationSteps: 5,
            visibleStaticSim: "none"//eField, charge, capacitance
        },

        initialize: function(){

            this.listenTo(this, "change:simZHeight", this._refreshVisibleField);
            this.listenTo(this, "change:visibleStaticSim", this._refreshVisibleField);

        },

        _hideAllFields: function(){
            if (this.get("electricField")) this.get("electricField").hide(true);
            if (this.get("chargeField")) this.get("chargeField").hide(true);
            if (this.get("capacitanceField")) this.get("capacitanceField").hide(true);
        },

        _refreshVisibleField: function(){
            this._hideAllFields();
            var height = this.get("simZHeight");
            var visibleSim = this.get("visibleStaticSim");
            if (visibleSim == "none") {
                three.render();
                console.warn("no visible simulation selected");
                return;
            }
            if (this.get(visibleSim)) this.get(visibleSim).show(height);
            three.render();
        }


    });

    return new eSim();
});