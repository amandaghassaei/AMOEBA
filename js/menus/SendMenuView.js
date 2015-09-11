/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'menuParent', 'serialComm', 'commPlist', 'text!sendMenuTemplate', 'cam', 'camPlist'],
    function($, _, MenuParent, serialComm, commPlist, template, cam, camPlist){

    return MenuParent.extend({


        events: {
            "click #streamCommands":                                "_startStream",
            "click #pauseStream":                                   "_pauseStream",
            "click #stopMachine":                                   "_stopMachine",
            "click #previousLineButton":                            "_decrementLineNum",
            "click #nextLineButton":                                "_incrementLineNum",
            "click #openSerialMonitor":                             "_openSerialMonitor"
        },


        __initialize: function(){
            this.isStreaming = false;
            this.listenTo(this.model, "change:stockSimulationPlaying", this.render);
            this.listenTo(cam, "change:simLineNumber", this._drawGcodeHighlighter);
        },

        _startStream: function(e){
            e.preventDefault();
            this.model.set("stockSimulationPlaying", true);
            this.isStreaming = true;
            this.render();
        },

        _pauseStream: function(e){
            e.preventDefault();
            this.model.set("stockSimulationPlaying", false);
            this.isStreaming = false;
            this.render();
        },

        _stopMachine: function(e){
            e.preventDefault();
            this.model.set("stockSimulationPlaying", false);
            this.isStreaming = false;
            serialComm.send("!");
            this.render();
        },

        _decrementLineNum: function(e){
            e.preventDefault();
            console.log("prev");
        },

        _incrementLineNum: function(e){
            e.preventDefault();
            console.log("next");
        },

        _openSerialMonitor: function(e){
            e.preventDefault();
            serialComm.openSerialMonitor();
        },

        _drawGcodeHighlighter: function(){
            var lineNum = cam.get("simLineNumber");
            console.log(lineNum);
            if (lineNum == 0) return;
            var code = cam.get("dataOut").split("\n");
            code[lineNum] = "<span id='gcodeHighlighter'>" + code[lineNum] + " </span>";
            var newText = code.join("\n");
            var $editor = $('#gcodeEditor');
            $editor.html(newText);
            var $highlighter = $("#gcodeHighlighter");
            if (!$editor.position() || !$highlighter.position()) return;//todo weird bug
            var highlighterHeight = $highlighter.position().top - $editor.position().top;
            var desiredHeight = $editor.height()/2;
            if (highlighterHeight > desiredHeight) $editor.scrollTop($editor.scrollTop()+highlighterHeight-desiredHeight);
        },

        _makeTemplateJSON: function(){
            return _.extend(serialComm.toJSON(), commPlist, cam.toJSON(), camPlist, {streaming: this.isStreaming});
        },

        _render: function(){
            if (serialComm.get("lastMessageReceived") === null) $("#incomingSerialMessage").hide();
            this._drawGcodeHighlighter();
        },

        template: _.template(template)

    });
});