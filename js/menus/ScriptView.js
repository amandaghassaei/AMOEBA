/**
 * Created by aghassaei on 5/30/15.
 */



define(['jquery', 'underscore', 'backbone', 'appState', 'codeMirror', 'text!menus/templates/ScriptView.html',  'codeMirrorJS'],
    function($, _, Backbone, appState, CodeMirror, template){
    

    var ScriptView = Backbone.View.extend({
    
        el: "#scriptView",
    
        events: {
            "click #runScript":                                       "_runScript",
            "click #saveScript":                                      "_saveScript",
            "click #loadScript":                                      "_loadScript"
        },
    
        initialize: function(){
    
            _.bindAll(this, "render");
    
            //bind events
//            $(document).bind('keydown', {}, this._handleKeyStroke);
            this.render();
    
            this.listenTo(this.model, "change:scriptIsVisible", this._setVisibility);
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
    
//        _saveScript: function(e){
//            e.preventDefault();
//    //        appState.syncScript(globals.codeMirror.getValue());
//    //        globals.saveFile(globals.script, "linkageScript", ".js");
//        },
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
        },
    
        _show: function(){
            this.$el.animate({left: "0"});
        },
    
        render: function(){
            this.$el.html(this.template({script:"test"}));
            CodeMirror.fromTextArea(document.getElementById("scriptEditor"), {
                lineNumbers: true,
                mode: "javascript"
            });
            this._setEditorHeight();
        },
    
        template: _.template(template)
    
    });


    return new ScriptView({model: appState});
    
});