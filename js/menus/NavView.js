/**
 * Created by amandaghassaei on 3/8/17.
 */


define(['jquery', 'underscore', 'backbone', 'fileSaver', 'menus/NavViewMenuView', "appState"],
    function($, _, Backbone, fileSaver, ViewMenuView, appState){

        var viewMenu = new ViewMenuView();

        var lastSaveName = "";
        var $saveAsModal = $("#saveAsModel");
        var $saveAsFilename = $("#saveAsFileName");

        var Nav =  Backbone.View.extend({

            el: "#globalNav",

            events: {
                "click .navItems":  "_updateNavMode",
                "click #viewMenuDropdown":  "openViewMenu",
                "mouseenter #logo": "activateLogo",
                "mouseleave #logo": "inactivateLogo",
                "click #saveJSON":  "saveJSON",
                "click #saveAsJSON":  "saveAsJSON",
                "click #about": "showAboutModal"
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

                this.listenTo(appState, "change:currentNav", this._navModeChanged);
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

            _updateNavMode: function(e){
                e.preventDefault();
                appState.set("currentNav", $(e.target).data("menu-id"));
            },

            _navModeChanged: function(){
                var $tabs = $(".navbar-nav .navItems");
                var $lastTab = $tabs.filter("[data-menu-id='" + appState.previous("currentNav") + "']");
                $lastTab.parent().removeClass("selectedNav");
                var $selectedTab = $tabs.filter("[data-menu-id='" + appState.get("currentNav") + "']");
                $selectedTab.parent().addClass("selectedNav");
            },

            showAboutModal: function(e){
                e.preventDefault();
                $("#aboutModal").modal("show");
            }

        });

        return new Nav();
});