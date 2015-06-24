/**
 * Created by aghassaei on 6/24/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materials', 'text!materialEditorMenuTemplate'],
    function($, _, MenuParentView, plist, materials, template){

    return MenuParentView.extend({

        events: {
            "click #cancelMaterial":                             "_exit"
        },

        _initialize: function(){
            //bind events
        },

        _exit: function(){
            this.model.set("currentNav", "navDesign");
        },

        _makeTemplateJSON: function(){
            return _.extend(plist, {name:"name", color:"#ffff00", altColor:"#00ffff"});
        },

        template: _.template(template)
    });
});