/**
 * Created by aghassaei on 2/1/15.
 */


AnimationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #playStockSim":                          "_playStockSim",
        "click #pauseStockSim":                         "_pauseStockSim"
    },

    initialize: function(options){

        this.appState = options.appState;

        //bind events
        this.listenTo(this.model, "change:currentScene", this.render);
    },

    _playStockSim: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("stockSimulationPlaying", true);
    },

    _pauseStockSim: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("stockSimulationPlaying", false);
    },

    _changeScene: function(e){
        e.preventDefault();
        this.model.set("currentScene", $(e.target).data("type"));
    },

    render: function(){
        if (this.appState.get("currentTab") != "animate") return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <a href="#" id="playStockSim" class=" btn btn-block btn-lg btn-default">Play</a><br/>\
        <a href="#" id="pauseStockSim" class=" btn btn-block btn-lg btn-default">Pause</a><br/>\
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
