/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/SketchMenuView.html', 'globals', 'materialsPlist', "materials"],
    function($, _, MenuParentView, plist, template, globals, materialsPlist, materials){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            this.listenTo(globals.get("baseplane"), "change", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('baseplane')) return globals.get("baseplane");
            if ($target.hasClass('material')) return materials.getMaterialForId($target.data("id"));
            return null;
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), plist, globals.get("baseplane").toJSON(), materials.toJSON(), materialsPlist);
        },

        _render: function(){
        },

        template: _.template(template)
    });
});