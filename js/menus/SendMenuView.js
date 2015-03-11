/**
 * Created by aghassaei on 3/11/15.
 */

SendMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #saveSendMenu":                                       "_save"
    },

    initialize: function(){


        _.bindAll(this, "render");
    },

    _save: function(e){
        e.preventDefault();
        dmaGlobals.assembler.save();
    },

    render: function(){
        if (this.model.get("currentTab") != "send") return;
        if (dmaGlobals.assembler.get("needsPostProcessing")) dmaGlobals.assembler.postProcess();
        this.$el.html(this.template(dmaGlobals.assembler.toJSON()));
    },

    template: _.template('\
        <a href="#" id="saveSendMenu" class=" btn btn-block btn-lg btn-default">Save</a><br/>\
        <textarea id="gcodeEditor"><%= dataOut %></textarea>\
        ')

});