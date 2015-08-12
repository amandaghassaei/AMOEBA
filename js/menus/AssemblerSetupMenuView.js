/**
 * Created by aghassaei on 8/11/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'cam', 'text!assemblerSetupMenuTemplate'],
    function($, _, MenuParentView, plist, cam, template){

    return MenuParentView.extend({

        events: {
            "click .editMachineComponent":                          "_editMachineComponent",
            "click .editMachineCode":                               "_editMachineCode"
        },

        _initialize: function(){

        },

        _editMachineComponent: function(e){
            e.preventDefault();
            this.model.set("currentNav", "navMachineComponent");
        },

        _editMachineCode: function(e){
            e.preventDefault();
            console.log("edit code");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON());
        },

        template: _.template(template)
    });
});
