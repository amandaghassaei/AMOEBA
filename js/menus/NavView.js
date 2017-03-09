/**
 * Created by amandaghassaei on 3/8/17.
 */


define(['jquery', 'underscore', 'backbone', 'fileSaver', 'menus/NavViewMenuView'],
    function($, _, Backbone, fileSaver, ViewMenuView){

        var viewMenu = new ViewMenuView();

        var lastSaveName = "";
        var $saveAsModal = $("#saveAsModel");
        var $saveAsFilename = $("#saveAsFileName");

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

                var self = this;
                $("#saveAsJSONModal").click(function(e){
                    e.preventDefault();
                    self._saveAsJSON($("#saveAsFileName").val());
                    $saveAsModal.modal("hide");
                });

                $saveAsFilename.on('keyup', function (e) {
                    if (e.keyCode == 13) {
                        self._saveAsJSON($("#saveAsFileName").val());
                        $saveAsModal.modal("hide");
                    }
                });
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
                this._saveAsJSON();
            },

            saveAsJSON: function(e){
                e.preventDefault();
                $saveAsModal.modal("show");
                $saveAsModal.on('shown.bs.modal', function() {
                    $saveAsFilename.focus();
                    $saveAsFilename.select();
                });
            },

            _saveAsJSON: function(filename){
                if (filename === undefined || filename == ""){
                    filename = lastSaveName;
                }
                fileSaver.save(filename);
                lastSaveName = filename;
            },

            navModeChanged: function(e){
                e.preventDefault();
                var mode = $(e.target).data("menu-id");
                console.log(mode);
            }

        });

        return new Nav();
});