/**
 * Created by aghassaei on 6/30/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'text!eStaticMenuTemplate', 'eSim', 'latticeESim'],
    function($, _, MenuParentView, plist, template, eSim, lattice){

    return MenuParentView.extend({

        events: {
            "click #calcCapacitance":                               "_calcCapacitance",
            "click #calcInductance":                                "_calcInductance"
        },

        _initialize: function(){
            this.listenTo(eSim, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("eSim")) return eSim;
            if ($target.hasClass("eSimGroup")) return eSim.get("conductorGroups")[$target.data("index")];
            return null;
        },

        _calcCapacitance: function(e){
            e.preventDefault();
            if (this._checkGroupData("voltage")) lattice.calcCapacitance();
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
            return _.extend(this.model.toJSON(), eSim.toJSON());
        },

        template: _.template(template)
    });
});