/**
 * Created by aghassaei on 1/11/16.
 */


define(['jquery', 'underscore', 'menuParent', 'emSimPlist', 'emSim', 'text!menus/templates/EmRunMenuView.html'],
    function($, _, MenuParentView, emPlist, emSim, template){

    return MenuParentView.extend({

        events: {

            "click #runSimulation":                      "_runSimulation",
            "click #pauseSimulation":                    "_pauseSimulation",
            "click #resetSimulation":                    "_resetSimulation"
        },

        _initialize: function(){
            this.listenTo(emSim, "change", this.render);
        },

        _runSimulation: function(e){
            e.preventDefault();
            emSim.run();
        },

        _pauseSimulation: function(e){
            e.preventDefault();
            emSim.pause();
        },

        resetSimulation: function(e){
            e.preventDefault();
            emSim.reset();
        },


        _makeTemplateJSON: function(){
            return emSim.toJSON();
        },

        template: _.template(template)
    });
});