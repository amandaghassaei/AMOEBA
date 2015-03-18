/**
 * Created by aghassaei on 1/26/15.
 */

ScriptMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "script") return;
        this.$el.html(this.template(this.model.toJSON()));
    },

    template: _.template('\
        <div class="btn-group fullWidth">\
            <button data-toggle="dropdown" class="btn btn-default btn-lg dropdown-toggle fullWidth" type="button">Load Script<span class="caret"></span></button>\
            <ul role="menu" class="dropdown-menu">\
                <% _.each(_.keys(allScripts), function(key){ %>\
                    <li><a class="units" data-type="<%= key %>" href="#"><%= allScripts[key] %></a></li>\
                <% }); %>\
            </ul>\
        </div><br/><br/><!-- /btn-group -->\
        <a href="#" id="scriptClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});