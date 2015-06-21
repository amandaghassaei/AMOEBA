/**
 * Created by aghassaei on 6/16/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!discoveryMenuTemplate'],
    function($, _, MenuParentView, plist, lattice, template){

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

        template: _.template(template)
    });
});