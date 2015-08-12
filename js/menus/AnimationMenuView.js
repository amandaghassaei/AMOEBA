/**
 * Created by aghassaei on 2/1/15.
 */

define(['jquery', 'underscore', 'menuParent', 'cam', 'text!animationMenuTemplate'],
    function($, _, MenuParentView, cam, template){

    return MenuParentView.extend({

        events: {
            "click #playStockSim":                                      "_playStockSim",
            "click #pauseStockSim":                                     "_pauseStockSim",
            "click #resetStockSim":                                     "_resetStockSim",
            "click #animationMenuSave":                                 "_save",
            "click .overrideEdits":                                     "_postProcess",
            "slideStop #speedSlider":                                   "_changeSpeedSlider"
        },

        _initialize: function(){
    
            _.bindAll(this, "_codeEdit", "_setEditorHeight");

            //bind events
            this.listenTo(this.model, "change:stockSimulationPlaying", this.render);
            var self = this;
            this.listenTo(cam, "change", function(){
                //ignore simLineNumber for render calls
                if (_.isEqual(_.keys(cam.changedAttributes()), ["simLineNumber"])) return;
                self.render();
            });
            this.listenTo(cam, "change:simLineNumber", this._drawGcodeHighlighter);
            $(document).bind('keyup', {state:false}, this._codeEdit);
            //this.$el.bind('resize', this._setEditorHeight);
        },

        _save: function(e){
            e.preventDefault();
            cam.save();
        },

        _postProcess: function(e){
            e.preventDefault();
            cam.postProcess();
        },

        _codeEdit: function(e){
            var editor = $("#gcodeEditor");
            if (!editor.is(":focus")) return;
            e.preventDefault();
            cam.makeProgramEdits(editor.text());
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
            cam.resetSimulation();
            this.render();
        },

        _changeSpeedSlider: function(e){
            e.preventDefault();
            cam.set("simSpeed", Math.pow(2,$(e.target)[0].value));
        },

        _drawGcodeHighlighter: function(){
            var lineNum = cam.get("simLineNumber");
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

        _setEditorHeight: function(){
            var $editor = $('#gcodeEditor');
            var height = this.$el.height()-$editor.position().top-50;
            height = Math.max(height, 250);
            $editor.css({height:height +"px"});
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON());
        },

        _render: function(){
            if (cam.get("needsPostProcessing") && !cam.get("editsMadeToProgram")) cam.postProcess();//todo this might need to go first?
            this._setEditorHeight();
            this._drawGcodeHighlighter();//in case of code pause

            $('#speedSlider').slider({
                formatter: function(value) {
                    return Math.pow(2, value) + "X";
                }
            });
        },

        template: _.template(template)
    });
});
