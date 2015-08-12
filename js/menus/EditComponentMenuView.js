/**
 * Created by aghassaei on 8/12/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'cam', 'text!editComponentMenuTemplate'],
    function($, _, MenuParentView, plist, cam, template){

    return MenuParentView.extend({

        events: {
            "click #finishComponent":                                 "_save",
            "click #cancelComponent":                                 "_cancel",
            "click #deleteComponent":                                 "_delete",
            "click #saveComponent":                                   "_saveToFile",
            "click .removeChild":                                     "_removeChild"
        },

        _initialize: function(){

        },

        _save: function(e){
            e.preventDefault();
            console.log("save component");
        },

        _cancel: function(e){
            e.preventDefault();
            this.model.set("currentNav", "navAssemble");
        },

        _delete: function(e){
            e.preventDefault();
            console.log("delete component");
        },

        _saveToFile: function(e){
            e.preventDefault();
            console.log("save component to file");
        },

        _removeChild: function(e){
            e.preventDefault();
            console.log("remove child");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON(), {translation:{x:1, y:2, z:3}, scale:2, rotation:{x:0,y:90,z:127}});
        },

        template: _.template(template)
    });
});