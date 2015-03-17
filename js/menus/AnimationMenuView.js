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
        "click #overrideEdits":                                     "_postProcess"
    },

    initialize: function(){

        _.bindAll(this, "render", "_codeEdit");

        //bind events
        this.listenTo(this.model, "change:stockSimulationPlaying", this.render);
        this.listenTo(dmaGlobals.assembler, "change", this.render);
        $(document).bind('keyup', {state:false}, this._codeEdit);
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
        var textarea = $("#gcodeEditor");
        if (!textarea.is(":focus")) return;
        e.preventDefault();
        dmaGlobals.assembler.makeProgramEdits(textarea.val());
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
        dmaGlobals.assembler.set("simLineNumber", 1);
    },

    render: function(){
        if (this.model.get("currentTab") != "animate") return;
        if (dmaGlobals.assembler.get("needsPostProcessing")) dmaGlobals.assembler.postProcess();
        this.$el.html(this.template(_.extend(this.model.toJSON(), dmaGlobals.assembler.toJSON())));
    },

    template: _.template('\
        <% if (stockSimulationPlaying){ %>\
        <a href="#" id="pauseStockSim" class=" btn btn-block btn-lg btn-warning">Pause</a><br/>\
        <% } else { %>\
            <% if (simLineNumber != 1){ %>\
                <a href="#" id="playStockSim" class=" btn btn-lg btn-halfWidth btn-success">Play</a>\
                <a href="#" id="resetStockSim" class=" btn btn-lg btn-halfWidth pull-right btn-default">Reset</a><br/><br/>\
            <% } else { %>\
                <a href="#" id="playStockSim" class=" btn btn-block btn-lg btn-success">Play</a><br/>\
            <% } %>\
        <% } %>\
        <a href="#" id="saveSendMenu" class=" btn btn-block btn-lg btn-default">Save</a><br/>\
        Assembly Time:&nbsp;&nbsp;<br/><br/>\
        <textarea id="gcodeEditor"><%= dataOut %></textarea><br/><br/>\
        <a href="#" id="overrideEdits" class=" btn btn-block btn-lg btn-default">Undo Changes</a><br/>\
        ')

});

//        Scene: &nbsp;&nbsp;\
//        <div class="btn-group">\
//            <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allScenes[currentScene] %><span class="caret"></span></button>\
//            <ul role="menu" class="dropdown-menu">\
//                <% _.each(_.keys(allScenes), function(key){ %>\
//                    <li><a class="sceneType" data-type="<%= key %>" href="#"><%= allScenes[key] %></a></li>\
//                <% }); %>\
//            </ul>\
//        </div><br/><br/>\
