/**
 * Created by aghassaei on 6/16/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

    var log = "testing<br/>hello";

    return MenuParentView.extend({

        events: {
            "click #discoveryLogClear":                              "_clearLog"
        },


        _initialize: function(){
        },

        _clearLog: function(e){
            e.preventDefault();
            log = "";
            this.render();
        },

        _makeTemplateJSON: function(){
            return _.extend({log: log}, this.model.toJSON(), plist);
        },

        template: _.template('\
        Log:\
        <div id="gcodeEditor"><%= log %></div><br/>\
        <a id="discoveryLogClear" href="#" class="btn btn-block btn-lg btn-danger">Clear Log</a><br/>\
            ')

    });
});