/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/SelectMenuView.html', 'globals'],
    function($, _, MenuParentView, plist, template, globals){

    return MenuParentView.extend({

        events: {
            "click .fillCutSelection":                        "_finishSelection",
            "click #exitSelection":                           "_exitSelection"
        },

        _initialize: function(){
            this.listenTo(globals, "change:selection3D", this._selection3DChanged);
            if (globals.get("selection3D")) this.listenTo(globals.get("selection3D"), "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('selection3D')) return globals.get("selection3D");
            return null;
        },

        _makeTemplateJSON: function(){
            var json = {selection3D:null};
            if (globals.get("selection3D")) _.extend(json, {selection3D: globals.get("selection3D").toJSON()});
            return json;
        },

        _selection3DChanged: function(){
            if (globals.get("selection3D")) this.listenTo(globals.get("selection3D"), "change", this.render);
            this.render();
        },

        _finishSelection: function(e){
            e.preventDefault();
            globals.get("selection3D").finish();
        },

        _exitSelection: function(e){
            e.preventDefault();
            var selection3D = globals.get("selection3D");
            globals.destroySelection3D();
        },

        _render: function(){
        },

        template: _.template(template)
    });
});