/**
 * Created by aghassaei on 9/9/15.
 */


define(['jquery', 'underscore', 'commParentMenu', 'serialComm', 'text!SerialMonitorView.html'],
    function($, _, CommParentMenu, serialComm, template){

    return CommParentMenu.extend({

        el: "#serialMonitorView",

        events: {
            "click #clearMonitor":                         "_clear",
            "change input:checkbox":                       "_clickCheckbox"
        },

        __initialize: function(){
            this.render();
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

        _toggleProperty: function($target, property){ //val = !val
            var owner = this._getPropertyOwner($target);
            if (owner) this._setOwnerProperty(owner, property, !(this._getOwnerProperty(owner, property)));
        },

        _getPropertyOwner: function($target){
            if ($target.hasClass("serialMonitor")) return this.model;
            return null;
        },

        _getOwnerProperty: function(owner, property){
            if (owner instanceof Backbone.Model) return owner.get(property);
            return owner[property];
        },

        _setOwnerProperty: function(owner, property, value){
            if (owner instanceof Backbone.Model) owner.set(property, value);
            else {
                owner[property] = value;
            }
        },

        _makeTemplateJSON: function(){
            return this.model.toJSON();
        },

        _clear: function(e){
            e.preventDefault();
            $("#serialMonitorOutput").html("");
        },

        __sendMessage: function(message){
            $("#serialMonitorOutput").append("<span class='outgoing'>" + message + "</span><br/>");
        },

        _updateIncomingMessage: function(){
            $("#serialMonitorOutput").append("<span class='incoming'>" + serialComm.get("lastMessageReceived") + "</span><br/>");
        },

        template: _.template(template)

    });
});