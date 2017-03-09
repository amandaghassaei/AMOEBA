/**
 * Created by amandaghassaei on 3/8/17.
 */


define(['jquery', 'underscore', 'backbone', 'menus/NavViewMenuView'],
    function($, _, Backbone, ViewMenuView){

        var viewMenu = new ViewMenuView();

        var Nav =  Backbone.View.extend({

            el: "#globalNav",

            events: {
                "click .menuHoverControls":  "navModeChanged",
                "click #viewMenuDropdown":  "openViewMenu",
                "mouseenter #logo": "activateLogo",
                "mouseleave #logo": "inactivateLogo",
                "click #saveJSON":  "saveJSON",
                "click #saveAsJSON":  "saveAsJSON"
            },

            initialize: function(){

            },

            activateLogo: function(){
                $("#activeLogo").show();
                $("#inactiveLogo").hide();
            },

            inactivateLogo: function(){
                $("#activeLogo").hide();
                $("#inactiveLogo").show();
            },

            openViewMenu: function(e){
                e.preventDefault();
                viewMenu.render();
            },

            saveJSON: function(e){
                e.preventDefault();
                console.log("save");
            },

            saveAsJSON: function(e){
                e.preventDefault();
                var $modal = $("#saveAsModel");
                $modal.modal("show");
                $modal.on('shown.bs.modal', function() {
                    $("#saveAsFileName").focus();
                });

            },

            navModeChanged: function(e){
                e.preventDefault();
                var mode = $(e.target).data("menu-id");
                console.log(mode);
            }

        });

        return new Nav();
});