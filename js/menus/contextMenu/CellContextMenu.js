/**
 * Created by ghassaei on 5/26/16.
 */

define(['jquery', 'underscore', 'backbone', 'text!menus/contextMenu/CellContextMenu.html', 'appState', 'threeModel', 'axesClass'],
    function($, _, Backbone, template, appState, three, AxesClass){

    var cellAxesVis = new AxesClass(0.1, 0.4);

    var $wrapper = $("#contextMenuWrapper");

    var ContextMenu = Backbone.View.extend({

        el: '#contextMenu',

        events: {
            "click .rotateCell":                      "_rotateCell",
            "click #deleteCell":                      "_deleteCell"
        },

        cell: null,

        initialize: function(){
        },

        render: function(cell){
            this.selectCell(cell);
            var templateJSON = {};
            this.$el.html(_.template(template)(templateJSON));
            this.showMenu(appState.mousePosition);
        },

        showMenu: function(position){
            var padding = parseInt($wrapper.css("padding"));
            var left = position.x-padding;
            if ($('body').width()-200 < left) left -= 200;
            $wrapper.css({left:left, top: position.y-padding});
            $wrapper.show();
        },

        hideMenu: function(){
            $wrapper.hide();
            this.deselectCell();
        },

        selectCell: function(cell){
            this.cell = cell;
            cellAxesVis.setVisibility(true);
            cellAxesVis.setPosition(this.cell.getPosition());
            cellAxesVis.setRotation(this.cell.getRotation());
            three.render();
        },

        deselectCell: function(){
            this.cell = null;
            cellAxesVis.setVisibility(false);
            three.render();
        },

        _rotateCell: function(e){
            e.preventDefault();
            var axis = $(e.target).data("axis");
            if (axis == "x") this.cell.rotateX();
            else if (axis == "y") this.cell.rotateY();
            else if (axis == "z") this.cell.rotateZ();
            else console.warn("unknown axis " + axis);
            cellAxesVis.setRotation(this.cell.getRotation());
            three.render();
        },

        _deleteCell: function(e){
            e.preventDefault();
            var cell = this.cell;
            require(["lattice"], function(lattice){
                lattice.removeCell(cell);
            });
            this.hideMenu();
        }

    });

    var contextMenu = new ContextMenu();

    $wrapper.mouseleave(function(){
        contextMenu.hideMenu();
    });

    return contextMenu;

});