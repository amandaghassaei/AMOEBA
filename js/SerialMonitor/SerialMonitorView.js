/**
 * Created by aghassaei on 9/9/15.
 */


define(['jquery', 'underscore', 'commParentMenu', 'serialComm', 'text!SerialMonitorView.html'],
    function($, _, CommParentMenu, serialComm, template){

    return CommParentMenu.extend({

        el: "#serialMonitorView",

        events: {
        },

        __initialize: function(){
            this.render();
        },

        _makeTemplateJSON: function(){
            return this.model.toJSON();
        },

        _updateIncomingMessage: function(){
            $("#serialMonitorOutput").append(serialComm.get("lastMessageReceived") + "<br/>");
        },

        template: _.template(template)

    });
});