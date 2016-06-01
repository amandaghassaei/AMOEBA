/**
 * Created by ghassaei on 5/31/16.
 */

define(['jquery', 'underscore', 'menuParent', 'elementMechSim', 'text!menus/templates/ElementMechRunMenuView.html'],
    function($, _, MenuParentView, elementMechSim, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('elementMechSim')) return elementMechSim;
            return null;
        },

        _makeTemplateJSON: function(){
            return elementMechSim.toJSON();
        },

        template: _.template(template)
    });
});