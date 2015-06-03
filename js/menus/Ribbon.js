/**
 * Created by fab on 3/18/15.
 */

define(['jquery', 'underscore', 'backbone', 'plist', 'lattice'], function($, _, Backbone, plist, lattice){

    return Backbone.View.extend({

        el: "#navRibbon",

        events: {
            "click .ribbonCellMode":                                 "_updateCellMode",
            "click .ribbonDeleteMode":                               "_updateDeleteMode",
            "click .highlightMode":                                  "_updateHighlightMode",
            "click .cellsVisible":                                   "_updateCellVisibility"
        },

        initialize: function(){

            _.bindAll(this, "render");

            this.listenTo(this.model, "change:ribbonIsVisible", this._changeVisibility);
            this.listenTo(this.model, "change:cellMode", this.render);
            this.listenTo(this.model, "change:deleteMode", this.render);
            this.listenTo(this.model, "change:highlightMode", this.render);
            this.listenTo(this.model, "change:cellsVisible", this.render);
            this.listenTo(lattice, "change:cellType change:connectionType", this.render);
            this.render();
        },

        _updateCellMode: function(e){
            e.preventDefault();
            this.model.set("cellMode", $(e.target).data("type"));
        },

        _updateDeleteMode: function(e){
            e.preventDefault();
            this.model.set("deleteMode", !this.model.get("deleteMode"));
        },

        _updateHighlightMode: function(e){
            e.preventDefault();
            this.model.set("highlightMode", !this.model.get("highlightMode"));
        },

        _updateCellVisibility: function(e){
            e.preventDefault();
            this.model.set("cellsVisible", !this.model.get("cellsVisible"));
        },

        _changeVisibility: function(){
            var state = this.model.get("ribbonIsVisible");
            if (state) this.$el.show();
            else this.$el.hide();
        },

        render: function(){
            this.$el.html(this.template(_.extend(lattice.toJSON(), this.model.toJSON(), plist)));
        },

        template: _.template('\
            <div class="btn-toolbar">\
                <div class="btn-group">\
                  <a data-type="cell" class="btn btn-primary btn-ribbon ribbonCellMode<% if (cellMode == "cell"){ %> ribbon-selected<% } %>" href="#"><img data-type="cell" src="assets/imgs/cell-sm.png"></a>\
                  <% if (allPartTypes[cellType][connectionType]){ %>\
                  <a data-type="part" class="btn btn-primary btn-ribbon ribbonCellMode<% if (cellMode == "part"){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/part-sm.png"></a>\
                  <% } %>\
                  <a class="btn btn-primary btn-ribbon ribbonDeleteMode<% if (deleteMode){ %> ribbon-selected"<% } %>"><span class="fui-cross"></span></a>\
                </div>\
            </div>\
            ')

    });
});

//<a class="btn btn-primary btn-ribbon highlightMode<% if (highlightMode){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/cursor-light.png"></a>\
//<a class="btn btn-primary btn-ribbon cellsVisible<% if (!cellsVisible){ %> ribbon-selected<% } %>" href="#"><img data-type="part" src="assets/imgs/hide.png"></a>\
