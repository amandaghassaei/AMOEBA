/**
 * Created by fab on 3/18/15.
 */


Ribbon = Backbone.View.extend({

    el: "#navRibbon",

    events: {
        "click .cellModeBtn":                                    "_updateCellMode",
        "click .deleteMode":                                     "_updateDeleteMode",
        "click .highlightMode":                                  "_updateHighlightMode",
        "click .cellsVisible":                                   "_updateVisibility"
    },

    initialize: function(){

        _.bindAll(this, "render");

        this.listenTo(this.model, "change:cellMode", this.render);
        this.listenTo(this.model, "change:deleteMode", this.render);
        this.listenTo(this.model, "change:highlightMode", this.render);
        this.listenTo(this.model, "change:cellsVisible", this.render);
        this.listenTo(dmaGlobals.lattice, "change:cellType change:connectionType", this.render);
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

    _updateHighlightMode: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("highlightMode", !dmaGlobals.appState.get("highlightMode"));
    },

    _updateVisibility: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("cellsVisible", !dmaGlobals.appState.get("cellsVisible"));
    },

    render: function(){
        this.$el.html(this.template(_.extend(dmaGlobals.lattice.toJSON(), this.model.toJSON())));
    },

    template: _.template('\
        <div class="btn-toolbar">\
            <div class="btn-group">\
              <a data-type="cell" class="btn btn-primary btn-ribbon cellModeBtn<% if (cellMode == "cell"){ %> ribbon-selected<% } %>" href="#"><img data-type="cell" src="assets/imgs/cell-sm.png"></a>\
              <% if (allPartTypes[cellType][connectionType]){ %>\
              <a data-type="part" class="btn btn-primary btn-ribbon cellModeBtn<% if (cellMode == "part"){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/part-sm.png"></a>\
              <% } %>\
              <a class="btn btn-primary btn-ribbon highlightMode<% if (highlightMode){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/cursor-light.png"></a>\
              <a class="btn btn-primary btn-ribbon deleteMode<% if (deleteMode){ %> ribbon-selected"<% } %>"><span class="fui-cross"></span></a>\
            </div>\
        </div>\
        ')

});

//              <a class="btn btn-primary btn-ribbon cellsVisible<% if (!cellsVisible){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/hide.png"></a>\
