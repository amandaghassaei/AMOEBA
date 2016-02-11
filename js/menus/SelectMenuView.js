/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/SelectMenuView.html', 'globals'],
    function($, _, MenuParentView, plist, template, globals){

    return MenuParentView.extend({

        events: {
            "click #selection3DWithCells":                    "_fillSketch",
            "click #cutCellsWithRect":                     "_cutSketch",
            "click #deleteSelection3D":                       "_deleteSketch"
        },

        _initialize: function(){
            this.listenTo(globals.get("highlighter"), "change:selection3D", this._selection3DChanged);
            if (globals.get("highlighter").get("selection3D")) this.listenTo(globals.get("highlighter").get("selection3D"), "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('selection3D')) return globals.get("highlighter").get("selection3D");
            return null;
        },

        _makeTemplateJSON: function(){
            var json = {selection3D:null};
            if (globals.get("highlighter").get("selection3D")) _.extend(json, {selection3D: globals.get("highlighter").get("selection3D").toJSON()});
            return json;
        },

        _selection3DChanged: function(){
            if (globals.get("highlighter").get("selection3D")) this.listenTo(globals.get("highlighter").get("selection3D"), "change", this.render);
            this.render();
        },

        _fillSketch: function(e){
            e.preventDefault();
            var selection3D = globals.get("highlighter").get("selection3D");
            selection3D.fill();
        },

        _cutSketch: function(e){
            e.preventDefault();
            var selection3D = globals.get("highlighter").get("selection3D");
            selection3D.cut();
        },

        _deleteSketch: function(e){
            e.preventDefault();
            var selection3D = globals.get("highlighter").get("selection3D");
            globals.get("highlighter").destroySelection3D();
        },

        _render: function(){
        },

        template: _.template(template)
    });
});