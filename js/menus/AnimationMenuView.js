/**
 * Created by aghassaei on 2/1/15.
 */


AnimationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #playStockSim":                                      "_playStockSim",
        "click #pauseStockSim":                                     "_pauseStockSim",
        "click #resetStockSim":                                     "_resetStockSim",
        "click #saveSendMenu":                                      "_save",
        "click .overrideEdits":                                     "_postProcess",
        "slideStop #speedSlider":                                   "_changeSpeedSlider"
    },

    initialize: function(){

        _.bindAll(this, "render", "_codeEdit", "_setEditorHeight");

        //bind events
        this.listenTo(this.model, "change:stockSimulationPlaying", this.render);
        var self = this;
        this.listenTo(dmaGlobals.assembler, "change", function(){
            //ignore simLineNumber for render calls
            if (_.isEqual(_.keys(dmaGlobals.assembler.changedAttributes()), ["simLineNumber"])) return;
            self.render();
        });
        this.listenTo(dmaGlobals.assembler, "change:simLineNumber", this._drawGcodeHighlighter);
        $(document).bind('keyup', {state:false}, this._codeEdit);
        //this.$el.bind('resize', this._setEditorHeight);
    },

    _save: function(e){
        e.preventDefault();
        dmaGlobals.assembler.save();
    },

    _postProcess: function(e){
        e.preventDefault();
        dmaGlobals.assembler.postProcess();
    },

    _codeEdit: function(e){
        var editor = $("#gcodeEditor");
        if (!editor.is(":focus")) return;
        e.preventDefault();
        dmaGlobals.assembler.makeProgramEdits(editor.text());
    },

    _playStockSim: function(e){
        e.preventDefault();
        this.model.set("stockSimulationPlaying", true);
    },

    _pauseStockSim: function(e){
        e.preventDefault();
        this.model.set("stockSimulationPlaying", false);
    },

    _resetStockSim: function(e){
        e.preventDefault();
        dmaGlobals.assembler.resetSimulation();
        this.render();
    },

    _changeSpeedSlider: function(e){
        dmaGlobals.assembler.set("simSpeed", $(e.target)[0].value);
    },

    _drawGcodeHighlighter: function(){
        var lineNum = dmaGlobals.assembler.get("simLineNumber");
        if (lineNum == 0) return;
        var code = dmaGlobals.assembler.get("dataOut").split("\n");
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

    _setEditorHeight: function(){
        var $editor = $('#gcodeEditor');
        var height = this.$el.height()-$editor.position().top-50;
        height = Math.max(height, 250);
        $editor.css({height:height +"px"});
    },

    render: function(){
        if (this.model.get("currentTab") != "animate") return;
        if (dmaGlobals.assembler.get("needsPostProcessing") && !dmaGlobals.assembler.get("editsMadeToProgram")) dmaGlobals.assembler.postProcess();
        this.$el.html(this.template(_.extend(this.model.toJSON(), dmaGlobals.assembler.toJSON())));
        this._setEditorHeight();
        this._drawGcodeHighlighter();//in case of code pause

        $('#speedSlider').slider({
            formatter: function(value) {
                return value + "X";
            }
        });
    },

    template: _.template('\
        <% if (stockSimulationPlaying){ %>\
        <a href="#" id="pauseStockSim" class=" btn btn-block btn-lg btn-warning">Pause</a>\
        <% } else { %>\
            <% if (simLineNumber != 0){ %>\
                <a href="#" id="playStockSim" class=" btn btn-lg btn-halfWidth btn-success">Play</a>\
                <a href="#" id="resetStockSim" class=" btn btn-lg btn-halfWidth pull-right btn-default">Reset</a><br/>\
            <% } else { %>\
                <a href="#" id="playStockSim" class=" btn btn-block btn-lg btn-success">Play</a>\
            <% } %>\
        <% } %>\
        <input id="speedSlider" data-slider-id="speedSlider" type="text" data-slider-min="1" data-slider-max="10" data-slider-step="1" data-slider-value="<%= simSpeed %>"/>\
        <br/><a href="#" id="saveSendMenu" class=" btn btn-block btn-lg btn-default">Save</a><br/>\
        Assembly Time:&nbsp;&nbsp;<br/>\
        <% if (editsMadeToProgram && needsPostProcessing){ %>\
        <div id="postWarning">You have made the following changes that require post processing:<br/>\
        This will override edits you have made to the G-code.  OK to override? <a href="#" class="overrideEdits btn btn-block btn-lg btn-danger">OK</a></div>\
        <% } %>\
        <div id="gcodeEditor" contenteditable><%= dataOut %></div><br/>\
        <a href="#" class="overrideEdits btn btn-block btn-lg btn-default">Undo Changes</a><br/>\
        ')

});
