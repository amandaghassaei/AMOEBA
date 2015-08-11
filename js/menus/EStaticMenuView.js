/**
 * Created by aghassaei on 6/30/15.
 */


define(['jquery', 'underscore', 'menuParent', 'eSimPlist', 'text!eStaticMenuTemplate', 'eSim', 'latticeESim'],
    function($, _, MenuParentView, eSimPlist, template, eSim, lattice){

    return MenuParentView.extend({

        events: {
            "click #calcCapacitance":                               "_calcCapacitance",
            "click #calcInductance":                                "_calcInductance",
            "click #calcEField":                                    "_calcEField"
        },

        _initialize: function(){
            this.listenTo(eSim, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("eSim")) return eSim;
            if ($target.hasClass("eSimGroup")) return eSim.get("conductorGroups")[$target.data("id")];
            return null;
        },

        _calcEField: function(e){
            e.preventDefault();
            lattice.calcEField(eSim.get("conductorGroups"), eSim.get("simulationRes"));
        },

        _calcCapacitance: function(e){
            e.preventDefault();
            if (this._checkGroupData("voltage") && !isNaN(parseFloat(eSim.get("dielectricConst")))) lattice.calcCapacitance();
            else console.warn("voltage data missing");
        },

        _calcInductance: function(e){
            e.preventDefault();
            if (this._checkGroupData("current")) lattice.calcInductance();
            else console.warn("current data missing");
        },

        _checkGroupData: function(property){
            var missingGroups = _.filter(eSim.get("conductorGroups"), function(group){
                return group[property] === null;
            });
            return missingGroups.length == 0;
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), eSim.toJSON(), eSimPlist);
        },

        template: _.template(template)
    });
});