/**
 * Created by aghassaei on 10/23/15.
 */


define(['jquery', 'underscore', 'backbone', 'text!menus/contextMenu/MaterialsContextMenu.html'],
    function($, _, Backbone, template){

    if (document.addEventListener) {
        document.addEventListener('contextmenu', function(e) {
            var type = getContextMenuType(e);
            if (type) {
                e.preventDefault();
                handleContextMenuEvent(e, type);
            }
        }, false);
    } else {
        document.attachEvent('oncontextmenu', function() {
            var type = getContextMenuType(window.event);
            if (type) {
                window.event.returnValue = false;
                handleContextMenuEvent(e, type);
            }
        });
    }

    var $wrapper = $("#contextMenuWrapper");

    var ContextMenu = Backbone.View.extend({

        el: '#contextMenu',

        object: null,

        initialize: function(){
        },

        renderMaterialsMenu: function(e){
            this.object = $(e.target).parents("label.colorSwatches").children("input").val();
            var templateJSON = {};
            this.$el.html(_.template(template)(templateJSON));
            this.showMenu(e);
        },

        showMenu: function(e){
            var padding = parseInt($wrapper.css("padding"));
            var left = e.pageX-padding;
            if ($('body').width()-200 < left) left -= 200;
            $wrapper.css({left:left, top: e.pageY-padding});
            $wrapper.show();
        },

        hideMenu: function(){
            $wrapper.hide();
        }

    });

    var contextMenu = new ContextMenu();

    $wrapper.mouseleave(function(){
        contextMenu.hideMenu();
    });

    function getContextMenuType(e){
        var $target = $(e.target);
        var elem = $target.get(0);
        if ($target.parents("label.colorSwatches").length == 1){
            return "materials";
        }
        return null;
    }

    function handleContextMenuEvent(e, type){
        if (type == "materials") contextMenu.renderMaterialsMenu(e);
    }

});