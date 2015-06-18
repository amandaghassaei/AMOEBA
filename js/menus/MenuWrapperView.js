/**
 * Created by aghassaei on 1/26/15.
 */


define(['jquery', 'underscore', 'plist', 'backbone', 'lattice'], function($, _, plist, Backbone, lattice){

    return Backbone.View.extend({

        el: "#menuWrapper",

        events: {
            "click .menuWrapperTab>a":                     "_tabWasSelected",
            "click .dropdownSelector":                     "_makeDropdownSelection",
            "click .clearCells":                           "_clearCells",
            "focusout .floatInput":                        "_renderTab",//force rounding if needed
            "focusout .intInput":                          "_renderTab",
            "change input:checkbox":                       "_clickCheckbox",
            "click input:radio":                           "_radioSelection"
        },

        initialize: function(){

            _.bindAll(this, "render", "_updateCurrentTab", "_setVisibility", "_hide", "_show", "_onKeyUp");
            $(document).bind('keyup', {}, this._onKeyUp);

            //bind events
            this.listenTo(this.model, "change:currentNav", this.render);
            this.listenTo(lattice, "change:cellType change:connectionType", this._populateAndShow);
            this.listenTo(this.model, "change:currentTab", function(){
                if (!this.model.changedAttributes() || this.model.changedAttributes()["currentNav"]) return;
                this._updateCurrentTab();
            });
            this.listenTo(this.model, "change:menuIsVisible", this._setVisibility);

            if (this.model.get("menuIsVisible")) this._populateAndShow();
        },

        _onKeyUp: function(e){
            if ($(".unresponsiveInput").is(":focus")) return;
            if ($("input").is(":focus") && e.keyCode == 13) {//enter key
                $(e.target).blur();
                this._renderTab();
                return;
            }
            if ($(".floatInput").is(":focus")) this._updateFloat(e);
            if ($(".intInput").is(":focus")) this._updateInt(e);
            if ($(".textInput").is(":focus")) this._updateString(e)
            if ($(".hexInput").is(":focus")) this._updateHex(e);
        },

        _updateString: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var property = $target.data("property");
            if (!property) {
                console.warn("no property associated with string input");
                return;
            }
            this._getPropertyOwner($target).set(property, $target.val());
        },

        _updateHex: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var hex = $target.val();
            if (!this._isValidHex(hex)) return;
            var property = $target.data("property");
            if (!property) {
                console.warn("no property associated with string input");
                return;
            }
            this._getPropertyOwner($target).set(property, hex);
            if (this.menu.updateHex) this.menu.updateHex(hex);
        },

        _isValidHex: function(hex){
            return hex.match(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i) !== null;
        },

        _updateFloat: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var newVal = parseFloat($target.val());
            if (isNaN(newVal)) {
                console.warn("value is not float");
                return;
            }
            newVal = parseFloat(newVal.toFixed(parseInt(4)));
            this._setNumber($target, newVal);
        },

        _updateInt: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var newVal = parseInt($target.val());
            if (isNaN(newVal)) {
                console.warn("value is NaN");
                return;
            }
            this._setNumber($target, newVal);
        },

        _setNumber: function($target, newVal){
            var property = $target.data("property");
            if (!property) {
                console.warn("no property associated with number input");
                return;
            }
            var key = $target.data("key");

            //some numbers are relative
            if (property == "stockPosition" && globals.cam.get(property + "Relative")){
                if (key) newVal = parseFloat((newVal + globals.cam.get("originPosition")[key]).toFixed(4));
                else console.warn("no key found for " + property);
            } else if (property == "rapidHeight" && !globals.cam.get(property + "Relative")){
                newVal = parseFloat((newVal - globals.cam.get("originPosition")["z"]).toFixed(4));
            }

            //remove trailing zeros
            newVal = newVal.toString();
            newVal = parseFloat(newVal);

            if (key){
                var value = this._getPropertyOwner($target).get(property).clone();
                value[key] = newVal;
                this._getPropertyOwner($target).set(property, value);
                return;
            }
            this._getPropertyOwner($target).set(property, newVal);
        },

        _makeDropdownSelection: function(e){
            var $target = $(e.target);
            var property = $target.data("property");
            var value = $target.data("value");
            if (!property || !value) return;
            var owner = this._getPropertyOwner($target, property, value);
            if (owner) owner.set(property, value);
        },

        _clickCheckbox: function(e){
            e.preventDefault();
            var $target = $(e.target);
            $target.blur();
            var property = $target.data("property");
            if (!property) {
                console.warn("no property associated with checkbox input");
                return;
            }
           this._getPropertyOwner($target).set(property, !this._getPropertyOwner($target).get(property));
        },

        _radioSelection: function(e){
            e.preventDefault();
            var $target = $(e.target);
            this._getPropertyOwner($target).set($target.attr("name"), $target.val());
            $target.blur();
        },

        _clearCells: function(e){
            e.preventDefault();
            lattice.getUItarget().clearCells();
        },

        _getPropertyOwner: function($target, property, value){
            if ($target.hasClass("lattice")) return lattice;
            if ($target.hasClass("compositeEditor")) return lattice.compositeEditor;
            if ($target.hasClass("assembler")) return globals.cam;
            if ($target.hasClass("appState")) return this.model;
            if ($target.hasClass("serialComm")) {
                require(['serialComm'], function(serialComm){
                    serialComm.changeProperty(property, value);
                });
                return null;
            }
            console.warn("no owner found for " + $target);
            return null;
        },




        _tabWasSelected: function(e){
            e.preventDefault();
            var tabName = $(e.target).parent().data('name');
            this.model.set("currentTab", tabName);
        },

        _updateCurrentTab: function(){
            var tabName = this.model.get("currentTab");
            _.each($(".menuWrapperTab"), function(tab){
                var $tab = $(tab);
                if ($tab.data('name') == tabName){
                    $tab.addClass("active");
                } else {
                    $tab.removeClass("active");
                }
            });
            this._renderTab(tabName);
        },

        _renderTab: function(tabName){
            if (!tabName || !_.isString(tabName)) tabName = this.model.get("currentTab");

            if (this.menu) this.menu.destroy();
            var self = this;
            require([tabName + "Menu"], function(MenuView){
                self.menu = new MenuView({model:self.model});
                self.menu.render();
            });
        },

        render: function(){
            var self = this;
            this._hide(function(){
                self._populateAndShow();
                self.model.trigger("change:currentTab");//this was updated silently before todo need this?
            }, true);
        },

        _populateAndShow: function(){
            $("#menuHeader").html(this.template(_.extend(this.model.toJSON(), lattice.toJSON(), plist)));
            this._updateCurrentTab();
            this._show();
        },

        _setVisibility: function(){
            if(this.model.get("menuIsVisible")){
                this._populateAndShow();
            } else {
                this._hide();
            }
        },

        _hide: function(callback, suppressModelUpdate){
            this.$el.animate({right: "-430"}, {done: callback});
            if (!suppressModelUpdate) this.model.set("menuIsVisible", false);
        },

        _show: function(){
            this.$el.animate({right: "0"});
            this.model.set("menuIsVisible", true);
        },

        template: _.template('\
            <ul class="nav nav-tabs nav-justified">\
            <% _.each(_.keys(allMenuTabs[currentNav]), function(key){\
                if (key == "part" && !(allPartTypes[cellType][connectionType])) return;  %>\
              <li role="presentation" class="menuWrapperTab" data-name="<%= key %>"><a href="#"><%= allMenuTabs[currentNav][key] %></a></li>\
            <% }); %>\
            </ul>\
            ')
    });
});