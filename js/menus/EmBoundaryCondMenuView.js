/**
 * Created by aghassaei on 1/15/16.
 */



define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSim', 'text!menus/templates/EmBoundaryCondMenuView.html'],
    function($, _, MenuParentView, emPlist, emSim, template){

    return MenuParentView.extend({

        events: {
            "click #manualSelectFixed":                         "_manualFixedSelection",
            "click #toggleFixedVis":                            "_toggleFixedVis"
        },

        _initialize: function(){
            this.listenTo(emSim, "change", this.render);
        },

        _manualFixedSelection: function(e){
            e.preventDefault();
            emSim.set("manualSelectFixed", !emSim.get("manualSelectFixed"));
        },

        _toggleFixedVis: function(e){
            e.preventDefault();
            emSim.set("showFixed", !emSim.get("showFixed"));
        },

        _makeTemplateJSON: function(){
            return emSim.toJSON();
        },

        template: _.template(template)
    });
});