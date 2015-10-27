/**
 * Created by aghassaei on 10/26/15.
 */


define(['jquery', 'underscore', 'backbone', 'appState'], function($, _, Backbone, appState){

    var Console = Backbone.View.extend({

        el: "#console",

        events: {

        },

        initialize: function(){

            _.bindAll(this, "_onKeyUp");
            $(document).bind('keyup', {}, this._onKeyUp);

            this.listenTo(appState, "change:consoleIsVisible", this._setVisibility);
            this.listenTo(appState, "change:menuIsVisible", function(){
                this._setWidth(false);
            });
            this._setWidth(false);
            this._setVisibility();
        },

        _setWidth: function(immediately){
            var padding = "0";
            if (appState.get("menuIsVisible")) padding = "430px";
            if (immediately) this.$el.css({"padding-right":padding});
            else this.$el.animate({"padding-right":padding});
        },

        _setVisibility: function(){
            if (this._isVisible()) this._show();
            else this._hide();
        },

        _isVisible: function(){
            return appState.get("consoleIsVisible");
        },

        write: function(string){
            this._writeOutput(string + "<br/>");
        },

        warn: function(string){
            this._writeOutput("<span class='consoleWarning'>" + string + "</span><br/>");
        },

        error: function(string){

        },

        clear: function(){
            $("#consoleOutput").html("");
        },

        _writeOutput: function(html){
            var $output = $("#consoleOutput");
            var height = $output.height();
            $output.append(html);
            $output.height(height);
            $output.scrollTop($output.scrollTop()+$output.innerHeight());
        },

        _show: function(){
            this.$el.fadeIn();
        },

        _hide: function(){
            this.$el.fadeOut();
        },

        _onKeyUp: function(e){

            var $input = $("#consoleInput");
            if ($input.is(":focus")){
                if (e.keyCode == 27) $input.blur();
//                if (e.keyCode == 38) $output.val(this.model.getPrevHistElem());
//                else if (e.keyCode == 40) $output.val(this.model.getNewerHistElem());
                else if (e.keyCode == 13) this._enterCommand($input);
            }
        },

        _enterCommand: function($input){
//            var command = $input.val();
            var command = "nice try, this doesn't work yet :)";
            $input.val("");
            this.write(command);
        }

    });

    return new Console();

});