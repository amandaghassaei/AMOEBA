/**
 * Created by aghassaei on 6/16/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'serialComm'], function($, _, MenuParentView, plist, serialComm){




    return MenuParentView.extend({

        events: {
        },


        _initialize: function(){

            this.listenTo(serialComm, "change", this.render);
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), serialComm.toJSON(), {allBaudRates: [300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200]});
        },

        template: _.template('\
        <% if(error){ %> \
        <div class="postWarning">Error: <%= error%></div>\
        <% } %>\
        Status: &nbsp;&nbsp;<% if (portConnected){ %> Connected <% } else { %> Disconnected <% } %><br/><br/>\
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
                </div><br/><br/>\
        Test Message:<br/>\
        \
            ')

    });
});