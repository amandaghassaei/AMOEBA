/**
 * Created by aghassaei on 1/11/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSim', 'emSimLattice', 'text!menus/templates/EmRunMenuView.html'],
    function($, _, MenuParentView, emPlist, emSim, emSimLattice, template){

    return MenuParentView.extend({

        events: {

            "click #runSimulation":                      "_runSimulation",
            "click #pauseSimulation":                    "_pauseSimulation",
            "click #resetSimulation":                    "_resetSimulation",
            "click #stepSimulation":                     "_stepSimulation"
        },

        _initialize: function(){
            this.listenTo(emSim, "change", this.render);

        },

        getPropertyOwner: function($target){
            if ($target.hasClass('emSim')) return emSim;
            return null;
        },

        _runSimulation: function(e){
            e.preventDefault();
            emSim.run(false);
        },

        _pauseSimulation: function(e){
            e.preventDefault();
            emSim.pause();
        },

        _resetSimulation: function(e){
            e.preventDefault();
            emSim.reset();
        },

        _stepSimulation: function(e){
            e.preventDefault();
            emSim.run(true);
        },


        _makeTemplateJSON: function(){
            return _.extend(emSim.toJSON(), emSim.simLattice.toJSON(), emPlist);
        },

        template: _.template(template)
    });
});