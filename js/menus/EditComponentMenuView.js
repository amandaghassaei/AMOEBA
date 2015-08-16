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
            "click .removeChild":                                     "_removeChild"
        },

        _initialize: function(){
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("component")) return cam.get("assembler").getComponent(cam.get("editingComponent"));
            return null;
        },

        _save: function(e){
            e.preventDefault();
            console.log("save component");
            this._stopEditing();
        },

        _cancel: function(e){
            e.preventDefault();
            this._stopEditing();
        },

        _delete: function(e){
            e.preventDefault();
            console.log("delete component");
            this._stopEditing();
        },

        _stopEditing: function(){
            cam.set("editingComponent", null);
            this.model.set("currentNav", "navAssemble");
        },

        _removeChild: function(e){
            e.preventDefault();
            var id = $(e.target).data("id");
            var assembler = cam.get("assembler");
            assembler.addChild(assembler.getComponent(id));//add subtree to root
            assembler.buildComponentTree();
            this.render();
        },

        _makeTemplateJSON: function(){
            var assembler = cam.get("assembler");
            var component = assembler.getComponent(cam.get("editingComponent"));
            return _.extend(this.model.toJSON(), cam.toJSON(), assembler.toJSON(), {thisComponent: component.toJSON()});
        },

        template: _.template(template)

    });
});