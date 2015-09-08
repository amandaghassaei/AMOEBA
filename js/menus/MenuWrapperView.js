/**
 * Created by aghassaei on 1/26/15.
 */


define(['jquery', 'underscore', 'plist', 'backbone', 'lattice', 'appState', 'text!menuWrapperTemplate'],
    function($, _, plist, Backbone, lattice, appState, template){

    var MenuWrapperView = Backbone.View.extend({

        el: "#menuWrapper",

        events: {
            "click .menuWrapperTab>a":                     "_tabWasSelected",
            "click .dropdownSelector":                     "_makeDropdownSelection",
            "click .clearCells":                           "_clearCells",
            "focusout .floatInput":                        "_softRenderTab",//force rounding if needed
            "focusout .intInput":                          "_softRenderTab",
            "change input:checkbox":                       "_clickCheckbox",
            "click input:radio":                           "_radioSelection"
        },

        initialize: function(){

            _.bindAll(this, "render", "_updateCurrentTab", "_setVisibility", "_hide", "_show", "_onKeyUp");
            $(document).bind('keyup', {}, this._onKeyUp);

            //bind events
            this.listenTo(this.model, "change:currentNav", this.render);
            this.listenTo(lattice, "change:cellType change:connectionType change:latticeType", this._populateAndShow);
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
                this._softRenderTab();
                return;
            }

            if ($(".floatInput").is(":focus")) this._updateFloat(e);
            else if ($(".intInput").is(":focus")) this._updateInt(e);
            else if ($(".textInput").is(":focus")) this._updateString(e);
            else if ($(".hexInput").is(":focus")) this._updateHex(e);

            else if (!$("input").is(":focus") && e.keyCode == 77 && (e.ctrlKey || e.metaKey) && e.shiftKey && appState.get("currentNav") == "navComm"){
                e.preventDefault();
                require(['serialComm'], function(serialComm){
                    serialComm.openSerialMonitor();
                });
            }
            console.log(e);

        },

        _updateString: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var property = $target.data("property");
            if (!property) {
                console.warn("no property associated with string input");
                return;
            }
            this._setProperty($target, property, $target.val());
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
            this._setProperty($target, property, hex);
            if (this.menu.updateHex) this.menu.updateHex(hex, $target);//no render when input in focus, this forces update of the inputs color
        },

        _isValidHex: function(hex){
            return hex.match(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i) !== null;
        },

        _updateFloat: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var newVal = parseFloat($target.val());
            if (isNaN(newVal)) {
                if (newVal == "") return;
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
                if (newVal == "") return;
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
            var owner = this._getPropertyOwner($target);//todo not great here
            if (property == "stockPosition" && owner.get(property + "Relative")){
                if (key) newVal = parseFloat((newVal + owner.get("originPosition")[key]).toFixed(4));
                else console.warn("no key found for " + property);
            } else if (property == "rapidHeight" && !owner.get(property + "Relative")){
                newVal = parseFloat((newVal - owner.get("originPosition")["z"]).toFixed(4));
            }

            //remove trailing zeros
            newVal = newVal.toString();
            newVal = parseFloat(newVal);
            this._setProperty($target, property, newVal, key);
        },

        _makeDropdownSelection: function(e){
            var $target = $(e.target);
            var property = $target.data("property");
            var value = $target.data("value");
            if (!property || !value) return;
            this._setProperty($target, property, value);
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
            this._toggleProperty($target, property);
        },

        _radioSelection: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var property = $target.attr("name");
            var newVal = $target.val();
            this._setProperty($target, property, newVal);
            $target.blur();
        },

        _clearCells: function(e){
            e.preventDefault();
            lattice.getUItarget().clearCells();
        },

        _getPropertyOwner: function($target){
            if ($target.hasClass("lattice")) return lattice;
            if ($target.hasClass("appState")) return this.model;
            if (this.menu) {
                var owner = this.menu.getPropertyOwner($target);
                if (owner) return owner;
            }
            else console.warn("no menu found for ui change");
            console.warn("no owner found for target");
            console.warn($target);
            return null;
        },

        _toggleProperty: function($target, property){ //val = !val
            var owner = this._getPropertyOwner($target);
            if (owner) this._setOwnerProperty(owner, property, !(this._getOwnerProperty(owner, property)));
        },

        _setProperty: function($target, property, newVal, key){
            var owner = this._getPropertyOwner($target);
            if (!owner) return;
            if (owner.setProperty){
                owner.setProperty(property, newVal, key);
                return;
            }
            if (key){
                var propObject = this._getOwnerProperty(owner, property);
                if (propObject.clone) propObject = propObject.clone();
                else propObject = _.clone(propObject);
                propObject[key] = newVal;
                this._setOwnerProperty(owner, property, propObject);
            } else {
                this._setOwnerProperty(owner, property, newVal);
            }
        },

        _getOwnerProperty: function(owner, property){
            if (owner instanceof Backbone.Model) return owner.get(property);
            return owner[property];
        },

        _setOwnerProperty: function(owner, property, value){
            if (owner instanceof Backbone.Model) owner.set(property, value);
            else {
                owner[property] = value;
                this.menu.render();
            }
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

        _softRenderTab: function(){
            if (this.menu) this.menu.render();
            else console.warn("no menu found");
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
                $("#menuContent").html("");//clear current menu
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

        template: _.template(template)
    });

    return new MenuWrapperView({model:appState});
});