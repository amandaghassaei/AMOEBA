/**
 * Created by aghassaei on 10/26/15.
 */


define(['jquery', 'underscore', 'backbone', 'appState'], function($, _, Backbone, appState){

    var Console = Backbone.View.extend({

        el: "#console",

        events: {

        },

        initialize: function(){

            this.listenTo(appState, "change:consoleIsVisible", this._setVisibility);
            this._setWidth();
            this._setVisibility();
        },

        _setWidth: function(immediately){
            var padding = "0";
            if (appState.get("menuIsVisible")) padding = "430px";
            if (immediately) this.$el.css({"padding-right":padding});
            else this.$el.animate({"padding-right":padding});
        },

        _setVisibility: function(){
            if (appState.get("consoleIsVisible")) this.show();
            else this.hide();
        },

        show: function(){
            this.$el.fadeIn();
        },

        hide: function(){
            this.$el.fadeOut();
        }

    });

    return new Console();

});