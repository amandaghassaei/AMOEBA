/**
 * Created by aghassaei on 1/11/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSim', 'text!menus/templates/EmSetupMenuView.html'],
    function($, _, MenuParentView, emPlist, emSim, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('emSim')) return emSim;
            return null;
        },

        _makeTemplateJSON: function(){
            return emSim.toJSON();
        },

        template: _.template(template)
    });
});