/**
 * Created by ghassaei on 2/18/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSimLattice', 'emSim', 'text!menus/templates/EMElectronicsMenuView.html'],
    function($, _, MenuParentView, emPlist, emSimLattice, emSim, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            this.listenTo(emSim, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('emSim')) return emSim;
            return null;
        },

        _makeTemplateJSON: function(){
            return _.extend(emSimLattice.toJSON(), emPlist, emSim.toJSON());
        },

        template: _.template(template)
    });
});