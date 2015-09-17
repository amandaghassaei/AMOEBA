/**
 * Created by aghassaei on 9/9/15.
 */


define(['jquery', 'underscore', 'backbone', 'serialComm', 'text!SerialMonitorView.html'],
    function($, _, Backbone, serialComm, template){

    return Backbone.View.extend({

        el: "#serialMonitorView",

        events: {
            "click #clearMonitor":                         "_clear",
            "change input:checkbox":                       "_clickCheckbox"
        },

        initialize: function(){

            _.bindAll(this, "_onKeyUp", "render");
            $(document).bind('keyup', {}, this._onKeyUp);

            this.listenTo(serialComm, "change:lastMessageReceived", this._updateIncomingMessage);
            this.listenTo(serialComm, "change:lastMessageSent", this._updateOutgoingMessage);
            this.listenTo(serialComm, "change:baudRate change:portName", this.render);
            this.listenTo(serialComm, "change:connected", function(){
                if (!serialComm.get("connected")) this._close();
            });

            this.render();
        },

        _onKeyUp: function(e){
            var $output = $("#sendSerialMessage");
            if ($output.is(":focus")){
                if (e.keyCode == 38) $output.val(this.model.getPrevHistElem());
                else if (e.keyCode == 40) $output.val(this.model.getNewerHistElem());
                else if (e.keyCode == 13) this._sendMessage(e);


            } else {
            }
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

        _sendMessage: function(e){
            e.preventDefault();
            var message = $("#sendSerialMessage").val();
            $("#sendSerialMessage").val("");
            if (message == "") return;
            serialComm.send(message);
        },

        _makeTemplateJSON: function(){
            return this.model.toJSON();
        },

        _updateOutgoingMessage: function(){
            var message = serialComm.get("lastMessageSent");
            this._addOutputData("<span class='outgoing'>" + message + "</span><br/>");
            this.model.appendOutput(message);
        },

        _updateIncomingMessage: function(){
            this._addOutputData("<span class='incoming'>" + serialComm.get("lastMessageReceived") + "</span><br/>");
        },

        _addOutputData: function(html){
            var $output = $("#serialMonitorOutput");
            $output.append(html);
            if (this.model.get("autoscroll")) $output.scrollTop($output.scrollTop()+$output.innerHeight());
        },

        _clear: function(e){
            e.preventDefault();
            $("#serialMonitorOutput").html("");
        },

        _close: function(){
            window.close();
        },

        render: function(){
            if ($("input[type=text]").is(":focus")) return;
            this.$el.html(this.template(this._makeTemplateJSON()));
        },

        template: _.template(template)

    });
});