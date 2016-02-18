/**
 * Created by ghassaei on 2/18/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSim', 'text!menus/templates/EMElectronicsMenuView.html'],
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
            return _.extend(emSim.toJSON(), emPlist);
        },

        template: _.template(template)
    });
});