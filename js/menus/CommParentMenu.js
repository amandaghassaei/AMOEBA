/**
 * Created by aghassaei on 8/28/15.
 */



define(['jquery', 'underscore', 'menuParent', 'plist', 'serialComm', 'commPlist'],
    function($, _, MenuParentView, plist, serialComm, commPlist){


    return MenuParentView.extend({

        parentEvents: {
            "change #sendSerialMessage":                        "_sendMessage"
        },


        _initialize: function(){

            _.extend(this.events, this.parentEvents);

            this.listenTo(serialComm, "change", this.render);
            this.listenTo(serialComm, "change:lastMessageReceived", this._updateIncomingMessage);

            this.inTimeout = false;
            if (this.__initialize) this.__initialize();
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("serialComm")) return serialComm;
            return null;
        },

        _sendMessage: function(e){
            e.preventDefault();
            var message = $("#sendSerialMessage").val();
            $("#sendSerialMessage").val("");
            if (message == "") return;
            serialComm.send(message);
        },

        _updateIncomingMessage: function(){
            var message = serialComm.get("lastMessageReceived");
            var $message = $("#incomingSerialMessage");
            $message.html(message);
            $message.css("background", "#ffff99");
            if (!this.inTimeout) {
                this.inTimeout = true;
                var self = this;
                setTimeout(function(){
                    $message.css("background", "white");
                    self.inTimeout = false;
                }, 100);
            }
        }

    });
});