/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'materialsPlist', 'text!eSetupMenuTemplate', 'latticeESim', 'eSim'],
    function($, _, MenuParentView, plist, materialsPlist, template, lattice, eSim){

    return MenuParentView.extend({

        events: {
            "click #calcConnectivity":                              "_calcConnectivity",
            "click #showOverlappingCells":                          "_showOverlappingCells"
        },

        _initialize: function(){
            this.listenTo(eSim, "change", this.render);
            this.listenTo(this.model, "change:materialClass", this._changeSimNav);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("eSim")) return eSim;
            return null;
        },

        _changeSimNav: function(){
            var materialClass = this.model.get("materialClass");
            this.model.set("currentNav", materialClass + "NavSim");
        },

        _calcConnectivity: function(e){
            e.preventDefault();
            lattice.calculateConductorConnectivity();
        },

        _showOverlappingCells: function(e){
            e.preventDefault();
            lattice.highlightOverlappingCells();
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), eSim.toJSON(), plist, materialsPlist, lattice.toJSON());
        },

        template: _.template(template)
    });
});