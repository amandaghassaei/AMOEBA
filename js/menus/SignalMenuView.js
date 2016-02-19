/**
 * Created by ghassaei on 2/18/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSimLattice', 'emSim', 'text!menus/templates/SignalMenuView.html'],
    function($, _, MenuParentView, emPlist, emSimLattice, emSim, template){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(options){
            this.signal = options.myObject;
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('signal')) return this.signal;
            return null;
        },

        _makeTemplateJSON: function(){
            return _.extend(this.signal.toJSON(), emPlist);
        },

        template: _.template(template)
    });
});