/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!eSetupMenuTemplate', 'latticeESim', 'eSim'],
    function($, _, MenuParentView, plist, template, lattice, eSim){

    return MenuParentView.extend({

        events: {
            "click #calcConnectivity":                              "_calcConnectivity"
        },

        _initialize: function(){
            this.listenTo(eSim, "change", this.render);
            this.listenTo(this.model, "change:materialClass", this._changeSimNav);
        },

        _changeSimNav: function(){
            var materialClass = this.model.get("materialClass");
            this.model.set("currentNav", materialClass + "NavSim");
        },

        _calcConnectivity: function(e){
            e.preventDefault();
            lattice.calculateConnectivity();
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), eSim.toJSON(), plist);
        },

        template: _.template(template)
    });
});