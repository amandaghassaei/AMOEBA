/**
 * Created by ghassaei on 2/18/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSimLattice', 'emSim', 'text!menus/templates/EmElectronicsMenuView.html'],
    function($, _, MenuParentView, emPlist, emSimLattice, emSim, template){

    return MenuParentView.extend({

        events: {
            "click .editSignal":                                  "_openSignalEditor",
            "click input[name='visibleActuator']":                 "_showActuator"
        },

        _initialize: function(){
            this.listenTo(emSim, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('emSim')) return emSim;
            return null;
        },

        _showActuator: function(){
            emSim.set("visibleWire", -3, {silent:true});
        },

        _openSignalEditor: function(e){
            e.stopPropagation();
            e.preventDefault();
            var wireId = $(e.target).data("id");
            var signalCell = emSim.simLattice.get("wires")[wireId].getSignal();
            require(['menuWrapper'], function(menuWrapper){
                menuWrapper.initTabWithObject(signalCell, "signal", "emNavSignal")
            });
        },

        _makeTemplateJSON: function(){
            return _.extend(emSim.simLattice.toJSON(), emPlist, emSim.toJSON());
        },

        template: _.template(template)
    });
});