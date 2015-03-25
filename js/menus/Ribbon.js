/**
 * Created by fab on 3/18/15.
 */


Ribbon = Backbone.View.extend({

    el: "#navRibbon",

    events: {
        "click .cellModeBtn":                                    "_updateCellMode"
    },

    initialize: function(){

        _.bindAll(this, "render");

        this.listenTo(this.model, "change:cellMode", this.render);
        this.render();
    },

    _updateCellMode: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("cellMode", $(e.target).data("type"));
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <div class="btn-toolbar">\
            <div class="btn-group">\
              <a data-type="cell" class="btn btn-primary btn-ribbon cellModeBtn<% if (cellMode == "cell"){ %> ribbon-selected"<% } %> href="#"><img data-type="cell" src="assets/cell-sm.png"></a>\
              <a data-type="part" class="btn btn-primary btn-ribbon cellModeBtn<% if (cellMode == "part"){ %> ribbon-selected"<% } %> href="#"><img data-type="part" src="assets/part-sm.png"></a>\
            </div>\
        </div>\
        ')

});