/**
 * Created by aghassaei on 9/8/15.
 */


define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    var SerialMonitorView = Backbone.View.extend({

        events: {
        },

        initialize: function(){
            this.popup = null;
            var self = this;
            $(window).unload(function(){
                self.popup.close();//close popup when leaving page
            });
        },

        open: function(){
            if (this.popup){
                this.popup.focus();
                return;
            }
            this.popup = window.open('js/SerialMonitor/', '', 'height=700, width=900, titlebar=no, toolbar=no, menubar=yes, scrollbars=no, resizable=yes, location=no, directories=no, status=no');
            var self = this;
            $(this.popup).unload(function(){
                self.onClose();
            });
        },

        onClose: function(){
            var self = this;
            setTimeout(function(){
                if (self.popup.closed) self.dumpPopup();
            }, 100);//todo this is stupid, find an event that fires with window.closed == true
        },

        dumpPopup: function(){
            this.popup = null;
        }

    });

    return new SerialMonitorView();

});