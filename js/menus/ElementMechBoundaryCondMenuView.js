/**
 * Created by ghassaei on 5/31/16.
 */

define(['jquery', 'underscore', 'menuParent', 'elementMechSimPlist', 'elementMechSim', 'text!menus/templates/ElementMechBoundaryCondMenuView.html'],
    function($, _, MenuParentView, elementMechSimPlist, elementMechSim, template){

    return MenuParentView.extend({

        events: {
            "click #manualSelectFixed":                         "_manualFixedSelection",
            "click #toggleFixedVis":                            "_toggleFixedVis"
        },

        _initialize: function(){
            this.listenTo(elementMechSim, "change", this.render);
        },

        _manualFixedSelection: function(e){
            e.preventDefault();
            elementMechSim.set("manualSelectFixed", !elementMechSim.get("manualSelectFixed"));
        },

        _toggleFixedVis: function(e){
            e.preventDefault();
            elementMechSim.set("showFixed", !elementMechSim.get("showFixed"));
        },

        _makeTemplateJSON: function(){
            return elementMechSim.toJSON();
        },

        template: _.template(template)
    });
});