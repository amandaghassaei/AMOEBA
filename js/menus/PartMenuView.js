/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "slide #columnSepSlider":                           "_changeColSeparation",
        "click .partType":                                  "_changePartType"
    },

    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "render");
        this.listenTo(this.lattice, "change:partType", this.render);

    },

    _changeColSeparation: function(e){
        this.lattice.set("columnSeparation", $(e.target).val()/100);
    },

    _changePartType: function(e){
        e.preventDefault();
        this.lattice.set("partType", $(e.target).data("type"));
    },

    render: function(){
        if (this.model.get("currentTab") != "part") return;
        this.$el.html(this.template(_.extend(this.model.attributes, this.lattice.attributes)));

        $('#columnSepSlider').slider({
            formatter: function(value) {
                return value + "%";
            }
        });
    },

    template: _.template('\
        Part Type: &nbsp;&nbsp;\
        <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allPartTypes[cellType][connectionType][partType] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allPartTypes[cellType][connectionType]), function(key){ %>\
                        <li><a class="partType" data-type="<%= key %>" href="#"><%= allPartTypes[cellType][connectionType][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Column Separation:&nbsp;&nbsp;<input id="columnSepSlider" data-slider-id="ex1Slider" type="text" data-slider-min="0" data-slider-max="35" data-slider-step="0.1" data-slider-value="<%= columnSeparation*100 %>"/>\
        <br/><br/>\
        todo: generic beam part type, part types for new lattice configurations\
        ')

});