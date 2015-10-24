/**
 * Created by aghassaei on 6/29/15.
 */


define(['underscore', 'backbone', 'threeModel', 'appState'], function(_, Backbone, three, appState){

    var eSim = Backbone.Model.extend({

        defaults:{

            //electrical connections
            conductorGroups: null,//{{current:xx, voltage:xx}, ...}
            visibleConductorGroup: -1,//-2 = show everything, -1 = show all conductors

            //structural connections
            structuralGroups: null,
            visibleStructuralGroup: -1,//-1 = show everything

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
            numRelaxationSteps: 10,
            visibleStaticSim: "none"//eField, charge, capacitance
        },

        initialize: function(){

            this.listenTo(this, "change:simZHeight", this._refreshVisibleField);
            this.listenTo(this, "change:visibleStaticSim", this._refreshVisibleField);
            this.listenTo(appState, "change:currentNav", this._navChanged);

        },

        setZSimHeight: function(height){
            if (height < 0) return;
            var field = this.get(this.get("visibleStaticSim"));
            if (field && height<field.getMaxHeight()) this.set("simZHeight", height);
        },

        _navChanged: function(){
            if (appState.get("currentNav") != "electronicNavSim") this._hideAllFields();
            else this._refreshVisibleField();
        },

        _hideAllFields: function(){
            if (this.get("rawPotentialField")) this.get("rawPotentialField").hide();
            if (this.get("potentialField")) this.get("potentialField").hide();
            if (this.get("electricField")) this.get("electricField").hide();
            if (this.get("chargeField")) this.get("chargeField").hide();
            if (this.get("capacitanceField")) this.get("capacitanceField").hide();
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