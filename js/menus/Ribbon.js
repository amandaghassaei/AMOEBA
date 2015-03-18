/**
 * Created by fab on 3/18/15.
 */


Ribbon = Backbone.View.extend({

    el: "#navRibbon",

    events: {
        "click #cellModeToggle":                                    "_toggleCellMode"
    },

    initialize: function(){

        _.bindAll(this, "render");

        this.listenTo(this.model, "change:cellMode", this.render);
        this.render();
    },

    _toggleCellMode: function(e){
        e.preventDefault();
        var currentState = dmaGlobals.appState.get("cellMode");
        var nextState = "cell";
        if (currentState == "cell"){
            nextState = "part";
        }
        dmaGlobals.appState.set("cellMode", nextState);
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <div class="btn-toolbar">\
            <div class="btn-group">\
              <a id="cellModeToggle" class="btn btn-primary btn-ribbon" href="#fakelink">toggle cell/part view</a>\
            </div>\
        </div>\
        ')

});