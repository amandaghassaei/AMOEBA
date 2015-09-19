/**
 * Created by aghassaei on 3/11/15.
 */

define(['jquery', 'underscore', 'menuParent', 'serialComm', 'commPlist', 'text!sendMenuTemplate', 'text!menus/templates/SendControlPanel.html', 'cam', 'camPlist'],
    function($, _, MenuParent, serialComm, commPlist, template, controlPanelTemplate, cam, camPlist){

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

            this.gcode = "";

            this.listenTo(serialComm, "change", this._renderControls);
            this.listenTo(cam, "change", this._renderControls);
            this.listenTo(cam, "change:simLineNumber", this._lineNumChanged);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("cam")) return cam;
            if ($target.hasClass("comm")) return serialComm;
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

        _openSerialMonitor: function(e){
            e.preventDefault();
            serialComm.openSerialMonitor();
        },

        _lineNumChanged: function(){
            var lineNum = cam.get("simLineNumber");
            this._drawGcodeHighlighter(lineNum);
        },

        _drawGcodeHighlighter: function(lineNum){
            var code = this.gcode.split("\n");
            code[lineNum] = "<span id='gcodeHighlighter'>" + code[lineNum] + " </span>";
            var newText = code.join('\n');
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
            if($editor.position()=== undefined) return;//not rendered (bc user has not generated gcode yet)
            var height = this.$el.height()-$editor.position().top;
            height = Math.max(height, 250);
            $editor.css({height:height +"px"});
        },

        _makeControlTemplateJSON: function(){

        },

        _makeTemplateJSON: function(){
            return _.extend(serialComm.toJSON(), cam.toJSON(), camPlist);
        },

        _renderControls: function(){
            if ($("input[type=text]").is(":focus")) return;
            $("#sendControls").html(this.controlPanelTemplate(this._makeTemplateJSON()));
        },

        _render: function(){
            this._setEditorHeight();
            var code = cam.get("dataOut").split("\n");
            var newText = "";
            _.each(code, function(line, num){
                newText += '<span class="gCodeLineNum">' + num + '</span>' + line + '\n';
            });
            this.gcode = newText;
            this._drawGcodeHighlighter(cam.get("simLineNumber"));
            this._renderControls();
        },

        controlPanelTemplate: _.template(controlPanelTemplate),
        template: _.template(template)

    });
});