/**
 * Created by aghassaei on 1/26/15.
 */


CamMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click .camProcess":                            "_selectCamProcess"
    },


    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "render");
        this.listenTo(this.model, "change:camProcess", this.render);
    },

    _selectCamProcess: function(e){
        e.preventDefault();
        this.model.set("camProcess", $(e.target).data("type"));
    },

    render: function(){
        if (this.model.get("currentTab") != "cam") return;
        this.$el.html(this.template(_.extend(this.model.attributes)));
    },

    template: _.template('\
        CAM output: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allCamProcesses[camProcess] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allCamProcesses), function(key){ %>\
                        <li><a class="camProcess" data-type="<%= key %>" href="#"><%= allCamProcesses[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        ')

});