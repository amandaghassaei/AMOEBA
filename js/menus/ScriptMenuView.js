/**
 * Created by aghassaei on 1/26/15.
 */

ScriptMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "script") return;
        if ($("input[type=text]").is(":focus")) return;
        this.$el.html(this.template(globals.plist));
    },

    template: _.template('\
        <div class="btn-group fullWidth">\
            <button data-toggle="dropdown" class="btn btn-default btn-lg dropdown-toggle fullWidth" type="button">Load Script<span class="caret"></span></button>\
            <ul role="menu" class="dropdown-menu">\
                <% _.each(_.keys(allScripts), function(key){ %>\
                    <li><a data-type="<%= key %>" href="#"><%= allScripts[key] %></a></li>\
                <% }); %>\
            </ul>\
        </div><br/><br/><!-- /btn-group -->\
        <a href="#" class="clearCells btn btn-block btn-lg btn-danger">Clear All Cells</a><br/>\
        ')

});