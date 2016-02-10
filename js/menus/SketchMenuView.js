/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'text!menus/templates/SketchMenuView.html', 'globals'],
    function($, _, MenuParentView, plist, template, globals){

    return MenuParentView.extend({

        events: {
            "click #fillRectWithCells":                    "_fillSketch",
            "click #cutCellsWithRect":                     "_cutSketch",
            "click #deleteFillRect":                       "_deleteSketch"
        },

        _initialize: function(){
            this.listenTo(globals.baseplane, "change", this.render);
            this.listenTo(globals.highlighter, "change:fillRect", this._fillRectChanged);
            if (globals.highlighter.get("fillRect")) this.listenTo(globals.highlighter.get("fillRect"), "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass('baseplane')) return globals.baseplane;
            if ($target.hasClass('fillRect')) return globals.highlighter.get("fillRect");
            return null;
        },

        _makeTemplateJSON: function(){
            var json = _.extend(this.model.toJSON(), plist, globals.baseplane.toJSON(), {fillRect:null});
            if (globals.highlighter.get("fillRect")) _.extend(json, {fillRect: globals.highlighter.get("fillRect").toJSON()});
            return json;
        },
        
        _fillRectChanged: function(){
            if (globals.highlighter.get("fillRect")) this.listenTo(globals.highlighter.get("fillRect"), "change", this.render);
            this.render();
        },

        _fillSketch: function(e){
            e.preventDefault();
            var fillRect = globals.highlighter.get("fillRect");
            fillRect.fill();
        },

        _cutSketch: function(e){
            e.preventDefault();
            var fillRect = globals.highlighter.get("fillRect");
            fillRect.cut();
        },

        _deleteSketch: function(e){
            e.preventDefault();
            var fillRect = globals.highlighter.get("fillRect");
            globals.highlighter.destroyFillRect();
        },

        _render: function(){
        },

        template: _.template(template)
    });
});