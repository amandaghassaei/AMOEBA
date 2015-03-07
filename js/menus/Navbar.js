/**
 * Created by aghassaei on 1/7/15.
 */


//model is appState
//not templating this view yet

NavBar = Backbone.View.extend({

    el: "body",

    events: {
        "click #showHideMenu":                          "_setMenuVis",
        "click .menuHoverControls":                     "_setNavSelection",
        "click #saveJSON":                              "_save",
        "click #saveAsJSON":                            "_saveAs",
        "shown.bs.modal #saveAsModel":                  "_showSaveAsModal",
        "hide.bs.modal #saveAsModel":                   "_hideSaveAsModal",
        "change #saveAsModel":                          "_saveAs",
        "click #importJSON":                            "_importJSON",
        "change #jsonInput":                            "_selectJSONFiles"
    },

    initialize: function(){

        _.bindAll(this, "_setMenuVis", "_setNavSelection");

        this.listenTo(this.model, "change:menuIsVisible", this._updateShowHideButton);
        this.listenTo(this.model, "change:currentNav", this._updateNavSelectionUI);

        this._uiStuff();
        this._updateNavSelectionUI();
    },

    _setMenuVis: function(e){
        e.preventDefault();
        var state = this.model.get("menuIsVisible");
        this.model.set("menuIsVisible", !state);
        $(e.target).blur();
    },

    _updateShowHideButton: function(){
        var $button = $("#showHideMenu");
        var state = this.model.get("menuIsVisible");
        if(state){
            $button.html("Hide Menu >>");
        } else {
            $button.html("<< Show Menu");
        }
    },

    _setNavSelection: function(e){
        e.preventDefault();
        var navSelection = $(e.target).data("menuId");
        if (navSelection == "about") {
            $(e.target).blur();
            return;
        }
        if (navSelection) this.model.set("currentNav", navSelection);
    },

    _updateNavSelectionUI: function(){
        this._deselectAllNavItems();
        var navSelection = this.model.get("currentNav");
        _.each($(".menuHoverControls"), function(link){
            var $link = $(link);
            if ($link.data("menuId") == navSelection) $link.parent().addClass("open");//highlight
        });
    },

    _importJSON: function(e){
        e.preventDefault();
        $("#jsonInput").click();
    },

    _selectJSONFiles: function(e){
        e.preventDefault();
        var input = $(e.target),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        this._readDataURL(numFiles, label, input.get(0).files);
        input.val("");
    },

    _readDataURL: function(numFiles, filename, files){
        if (numFiles>1) console.warn("too many files selected");
        var reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = (function() {
            return function(e) {
                dmaGlobals.lattice.loadFromJSON(e.target.result);
            }
        })();
    },

    _save: function(e){
        e.preventDefault();
        dmaGlobals.lattice.saveJSON();
    },

    _saveAs: function(e){
        e.preventDefault();
        var fileName = $("#saveAsFileName").val();
        dmaGlobals.lattice.saveJSON(fileName);
        $('#saveAsModel').modal('hide');
    },

    _showSaveAsModal: function(){
        var input = $("#saveAsFileName");
        input.focus();
        input.select();
    },

    _hideSaveAsModal: function(){
        $("#saveAsFileName").blur();
    },

    _uiStuff: function(){
        var $logo = $("#logo");
        $logo.mouseover(function(){
            $logo.attr("src","assets/logo-active.png");
        });
        $logo.mouseout(function(){
            $logo.attr("src","assets/logo.png");
        });
    },

    _deselectAllNavItems: function(){
        $(".menuHoverControls").parent().removeClass("open");//no highlight
    }

});