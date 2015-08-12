/**
 * Created by aghassaei on 8/12/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'cam', 'text!editComponentMenuTemplate'],
    function($, _, MenuParentView, plist, cam, template){

    return MenuParentView.extend({

        events: {
            "click #exitComponentEdit":                                 "_exit"
        },

        _initialize: function(){

        },

        _exit: function(e){
            e.preventDefault();
            this.model.set("currentNav", "navAssemble");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON());
        },

        template: _.template(template)
    });
});