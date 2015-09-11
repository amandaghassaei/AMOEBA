/**
 * Created by aghassaei on 9/9/15.
 */


define(['backbone'], function(Backbone){

    var SerialMonitor = Backbone.Model.extend({

        defaults: {
            autoscroll: true
        },

        history: [],
        historyIndex: -1,

        appendOutput: function(message){
            this.history.unshift(message);
            this.historyIndex = -1;
            if (this.history.length>50) this.history.pop();
        },

        getPrevHistElem: function(){
            this.historyIndex++;
            if (this.historyIndex < 0) this.historyIndex = 0;
            if (this.history.length == 0) return "";
            if (this.history.length <= this.historyIndex) this.historyIndex = this.history.length-1;
            return this.history[this.historyIndex];
        },

        getNewerHistElem: function(){
            if (this.history.length == 0) return "";
            this.historyIndex --;
            if (this.historyIndex < 0) {
                this.historyIndex = -1;
                return "";
            }
            if (this.history.length <= this.historyIndex) this.historyIndex = this.history.length-1;
            return this.history[this.historyIndex];
        }

    });

    return new SerialMonitor();
});