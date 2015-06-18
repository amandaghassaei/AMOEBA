/**
 * Created by aghassaei on 6/16/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'serialComm'], function($, _, MenuParentView, plist, serialComm){




    return MenuParentView.extend({

        events: {
            "click #serialFlushBuffer":                         "_flushBuffer",
            "click #sendTestMessage":                           "_sendTestMessage"
        },


        _initialize: function(){

            this.listenTo(serialComm, "change", this.render);
        },

        _sendTestMessage:function(e){
            e.preventDefault();
            var message = $("#seriallTestMessage").val();
            serialComm.send(message);
        },

        _flushBuffer: function(e){
            e.preventDefault();
            serialComm.flushBuffer();
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), serialComm.toJSON(), {allBaudRates: [300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200]});
        },

        template: _.template('\
        <% if(error){ %> \
        <div class="postWarning"><%= error%></div>\
        <% } %>\
        <% if(connected){ %>\
        Status: &nbsp;&nbsp;<% if (portConnected){ %> Connected <% } else { %> <span class="red">Disconnected</span> <% } %><br/><br/>\
        Baud Rate: &nbsp;&nbsp;\
                <div class="btn-group">\
                    <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= baudRate %><span class="caret"></span></button>\
                    <ul role="menu" class="dropdown-menu">\
                        <% _.each(allBaudRates, function(rate){ %>\
                            <li><a class="serialComm dropdownSelector" data-property="baudRate" data-value="<%= rate %>" href="#"><%= rate %></a></li>\
                        <% }); %>\
                    </ul>\
                </div><br/><br/>\
        Port: &nbsp;&nbsp;\
                <div class="btn-group">\
                    <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= portName %><span class="caret"></span></button>\
                    <ul role="menu" class="dropdown-menu">\
                        <% _.each(availablePorts, function(port){ %>\
                            <li><a class="serialComm dropdownSelector" data-property="portName" data-value="<%= port %>" href="#"><%= port %></a></li>\
                        <% }); %>\
                    </ul>\
                </div><br/><br/><br/>\
        <a href="#" id="sendTestMessage" class="btn btn-block btn-lg btn-default">Send Test Message:</a><br/>\
        <input id="seriallTestMessage" value="<%= testMessage %>" placeholder="Test Message" class="form-control fullWidth unresponsiveInput" type="text"><br/><br/>\
        <a href="#" id="serialFlushBuffer" class="btn btn-block btn-lg btn-danger">Flush Buffer</a><br/>\
        <% }else{ %>\
        No node server found.\
        <% } %>\
            ')

    });
});