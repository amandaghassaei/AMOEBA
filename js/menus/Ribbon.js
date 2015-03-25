/**
 * Created by fab on 3/18/15.
 */


Ribbon = Backbone.View.extend({

    el: "#navRibbon",

    events: {
        "click .cellModeBtn":                                    "_updateCellMode",
        "click .deleteMode":                                     "_updateDeleteMode"
    },

    initialize: function(){

        _.bindAll(this, "render");

        this.listenTo(this.model, "change:cellMode", this.render);
        this.listenTo(this.model, "change:deleteMode", this.render);
        this.render();
    },

    _updateCellMode: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("cellMode", $(e.target).data("type"));
    },

    _updateDeleteMode: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("deleteMode", !dmaGlobals.appState.get("deleteMode"));
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <div class="btn-toolbar">\
            <div class="btn-group">\
              <a data-type="cell" class="btn btn-primary btn-ribbon cellModeBtn<% if (cellMode == "cell"){ %> ribbon-selected<% } %>" href="#"><img data-type="cell" src="assets/imgs/cell-sm.png"></a>\
              <a data-type="part" class="btn btn-primary btn-ribbon cellModeBtn<% if (cellMode == "part"){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/part-sm.png"></a>\
              <a class="btn btn-primary btn-ribbon deleteMode<% if (deleteMode){ %> ribbon-selected"<% } %>"><span class="fui-cross"></span></a>\
            </div>\
        </div>\
        ')

});