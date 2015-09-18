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


        _initialize: function(){

            this.listenTo(this.model, "change:stockSimulationPlaying", this.render);
            this.listenTo(serialComm, "change:isStreaming", this.render);
            this.listenTo(cam, "change:simLineNumber", this._lineNumChanged);
        },

        _getPropertyOwner: function($target){
            if ($target.hasClass("cam")) return cam;
            return null;
        },

        _startStream: function(e){
            e.preventDefault();
            serialComm.startStream();
        },

        _pauseStream: function(e){
            e.preventDefault();
            serialComm.pauseStream();
        },

        _stopMachine: function(e){
            e.preventDefault();
            serialComm.stopStream();
        },

        _decrementLineNum: function(e){
            e.preventDefault();
            var nextLine = cam.get("simLineNumber") - 1;
            this._setNextLine(nextLine);
        },

        _incrementLineNum: function(e){
            e.preventDefault();
            var nextLine = cam.get("simLineNumber") + 1;
            this._setNextLine(nextLine);
        },

        _setNextLine: function(nextLine){
            var length = cam.get("dataOut").split("\n").length;
            if (nextLine < 0) nextLine = length-1;
            if (nextLine > length-1) nextLine = 0;
            cam.set("simLineNumber", nextLine);
        },

        _showNextLine: function(nextLine){
            console.log(nextLine);
            $("#nextLine").val(nextLine);
            this._drawGcodeHighlighter(nextLine);
        },

        _openSerialMonitor: function(e){
            e.preventDefault();
            serialComm.openSerialMonitor();
        },

        _lineNumChanged: function(){
            var lineNum = cam.get("simLineNumber");
            this._showNextLine(lineNum);
        },

        _drawGcodeHighlighter: function(lineNum){
            var code = cam.get("dataOut").split("\n");
            code[lineNum] = "<span id='gcodeHighlighter'>" + code[lineNum] + " </span>";
            var newText = code.join("\n");
            var $editor = $('#gcodeEditor');
            $editor.html(newText);
            var $highlighter = $("#gcodeHighlighter");
            if (!$editor.position() || !$highlighter.position()) return;//todo weird bug
            var highlighterHeight = $highlighter.position().top - $editor.position().top;
            var desiredHeight = $editor.height()/2;
            if (highlighterHeight != desiredHeight) $editor.scrollTop($editor.scrollTop()+highlighterHeight-desiredHeight);
        },

         _setEditorHeight: function(){
            var $editor = $('#gcodeEditor');
            var height = this.$el.height()-$editor.position().top;
            height = Math.max(height, 250);
            $editor.css({height:height +"px"});
        },

        _makeTemplateJSON: function(){
            return _.extend(serialComm.toJSON(), commPlist, cam.toJSON(), camPlist, {nextLine:this.nextLine});
        },

        _render: function(){
            if (serialComm.get("lastMessageReceived") === null) $("#incomingSerialMessage").hide();
            this._setEditorHeight();
            this._drawGcodeHighlighter(this.nextLine);
        },

        template: _.template(template)

    });
});