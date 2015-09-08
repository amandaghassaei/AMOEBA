/**
 * Created by aghassaei on 9/8/15.
 */


define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    var SerialMonitorView = Backbone.View.extend({

        el: "#serialMonitorView",

        events: {
        },

        initialize: function(){
            this.open();
        },

        open: function(){
            window.open('SerialMonitor.html', '', 'height=400, width=400, titlebar=no, toolbar=no, menubar=yes, scrollbars=no, resizable=yes, location=no, directories=no, status=no');
        },

        onClose: function(){

        },

        _destroy: function(){

        }

    });

    return SerialMonitorView;

});