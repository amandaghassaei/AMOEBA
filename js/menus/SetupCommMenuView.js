/**
 * Created by aghassaei on 6/16/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'serialComm', 'text!setupCommMenuTemplate'],
    function($, _, MenuParentView, plist, serialComm, template){




    return MenuParentView.extend({

        events: {
            "click #serialFlushBuffer":                         "_flushBuffer",
            "click #nodeSetupInstructions":                     "_setupInstructions",
            "click #refreshPorts":                              "_refreshPorts",
            "change #seriallTestMessage":                       "_sendTestMessage",
            "click #reconnectToNode":                           "_reconnectToNode"
        },


        _initialize: function(){

            this.listenTo(serialComm, "change", this.render);
            this.listenTo(serialComm, "change:lastMessageReceived", this._updateIncomingMessage);

            this.inTimeout = false;
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("serialComm")) return serialComm;
            return null;
        },

        _sendTestMessage: function(e){
            e.preventDefault();
            var message = $("#seriallTestMessage").val();
            $("#seriallTestMessage").val("");
            if (message == "") return;
            serialComm.send(message);
        },

        _updateIncomingMessage: function(){
            var message = serialComm.get("lastMessageReceived");
            var $message = $("#incomingSerialMessage");
            console.log(message);
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
        },

        _flushBuffer: function(e){
            e.preventDefault();
            serialComm.flushBuffer();
        },

        _refreshPorts: function(e){
            e.preventDefault();
            serialComm.refreshPorts();
        },

        _setupInstructions: function(e){
            e.preventDefault();
            var self = this;
            require(['modalView'], function(ModalView){
                new ModalView({
                    title: "Node Setup",
                    text: self.helpFile
                });
            })
        },

        _reconnectToNode: function(){
            serialComm.attemptToConnectToNode();
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), serialComm.toJSON(), {allBaudRates: [300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200]});
        },

        template: _.template(template),

        helpFile: "" +
            "Download and install node.js and npm either via the installer:<br/>" +
            "<a href='https://nodejs.org/download/' target='_blank'>https://nodejs.org/download/</a><br/><br/>" +
            "or via <a href='http://brew.sh/' target='_blank'>homebrew</a> (recommended for OS X)<br/>" +
            "<b>update homebrew<br/>" +
            "brew install node<br/></b>" +
            "(with homebrew, if you run into errors, <a href='https://github.com/Homebrew/homebrew/issues/32621' target='_blank'>this thread</a> might help you)<br/><br/>" +
            "once installed, check the versions:<br/>" +
            "<b>node -v<br/>" +
            "npm -v<br/></b>" +
            "I'm using node v0.12.4 and npm v2.10.1<br/><br/>" +
            "to upgrade your version of node use:<br/>" +
            "<b>update homebrew<br/>" +
            "brew upgrade node<br/></b><br/>" +
            "create a folder somewhere on your filesystem:<br/>" +
            "<b>mkdir myNodeDirectory<br/>" +
            "cd myNodeDirectory</b><br/><br/>" +
            "once inside, install the <a href='https://github.com/voodootikigod/node-serialport' target='_blank'>serialport</a> module:<br/>" +
            "<b>npm install serialport<br/><br/></b>" +
            "and <a href='http://socket.io/' target='_blank'>socket.io</a>:<br/>" +
            "<b>npm install socket.io</b><br/><br/>" +
            "download <a href='/node/nodeServer.js' target='_blank'>this</a> file and save it as nodeServer.js in myNodeDirectory<br/><br/>" +
            "to run:<br/>" +
            "<b>node nodeServer.js</b><br/><br/>"


    });
});