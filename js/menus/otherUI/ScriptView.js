/**
 * Created by aghassaei on 5/30/15.
 */



define(['jquery', 'underscore', 'backbone', 'appState', 'codeMirror', 'globals', 'text!menus/templates/ScriptView.html',  'codeMirrorJS'],
    function($, _, Backbone, appState, CodeMirror, globals, template){
    

    var ScriptView = Backbone.View.extend({
    
        el: "#scriptView",
    
        events: {
            "click #runScript":                                       "_runScript",
            "click #saveScript":                                      "_saveScript",
            "click #loadScript":                                      "_loadScript",
            "click #hideScript":                                      "_hide"
        },
    
        initialize: function(){
    
            _.bindAll(this, "render");

            this.script = "write code here.";
            this.scriptName = "Script";
            this.saveCallback = null;
            this.editor = null;
    
            //bind events
//            $(document).bind('keydown', {}, this._handleKeyStroke);
            this.render();
    
            this.listenTo(this.model, "change:scriptIsVisible", this._setVisibility);

//            var string = "function(){console.log('here');}";
////            console.log(acorn.parse(string));
//            string();
//            eval(string);
////            console.log(eval(string));
//            console.log(string);

        },
    
//        _handleKeyStroke: function(e){
//            if (e.keyCode == 82 && this.model.get("currentTab") == "script"){
//                if (e.shiftKey || !e.metaKey) return;
//                e.preventDefault();
//                e.stopPropagation();
//    //            appState.runScript(globals.codeMirror.getValue());
//            }
//        },
    
        _runScript: function(e){
            e.preventDefault();
    //        appState.runScript(globals.codeMirror.getValue());
        },
    
        _saveScript: function(e){
            e.preventDefault();
            if (this.saveCallback){
                this.script = this.editor.getValue();
                var js = "js = " + this.script;
                try{
                    eval(js);
                    this.saveCallback(js);
                    this._hide();
                } catch(error){
                    this.render(error.message);
                }
//                console.log(acorn.parse(js));
                return;
            }
            console.warn("no save callback for this script");
        },
//
//        _loadScript: function(e){
//            e.preventDefault();
//            $("#fileInput").click();
//        },
    
        _setEditorHeight: function(){
            var $editor = $('.CodeMirror');
            var height = this.$el.height()-$editor.position().top;
            height = Math.max(height, 250);
            $editor.css({height:height +"px"});
        },
    
        _setVisibility: function(){
            if(this.model.get("scriptIsVisible")) this._show();
            else this._hide();
        },
    
        _hide: function(){
            var width = this.$el.parent().width();
            this.$el.animate({left: "-" + width + "px"});
            this.model.set("scriptIsVisible", false);
        },
    
        _show: function(){
            this.$el.animate({left: "0"});
            this.model.set("scriptIsVisible", true);
        },

        showWithJS: function(js, name, saveCallback){
            this.script = js;
            this.scriptName = name || "Script";
            this.saveCallback = saveCallback;
            this._show();
            this.render();
        },
    
        render: function(errorMsg){
            this.$el.html(this.template({script:this.script, scriptName: this.scriptName, errorMsg:errorMsg}));
            this.editor = CodeMirror.fromTextArea(document.getElementById("scriptEditor"), {
                lineNumbers: true,
                mode: "javascript"
            });
            this._setEditorHeight();
        },
    
        template: _.template(template)
    
    });

        var view = new ScriptView({model: appState});
        globals.scriptView = view;

    return view
    
});