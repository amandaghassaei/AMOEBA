/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "slide #columnSepSlider":                           "_changeColSeparation"
    },

    initialize: function(options){

        this.appState = options.appState;

        _.bindAll(this, "render");
        this.listenTo(this.model, "change:partType", this.render);

    },

    _changeColSeparation: function(e){
        this.model.set("columnSeparation", $(e.target).val()/100);
    },

    render: function(){
        if (this.appState.get("currentTab") != "part") return;
        this.$el.html(this.template(this.model.attributes));

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
        ')

});