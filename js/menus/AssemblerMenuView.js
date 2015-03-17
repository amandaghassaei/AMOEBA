/**
 * Created by aghassaei on 2/25/15.
 */


AssemblerMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click .camStrategy":                            "_selectCamStrategy",
        "click .machineType":                            "_selectMachine"
    },

    initialize: function(options){

        this.assembler = options.assembler;

        _.bindAll(this, "render", "_onKeyup");
        this.listenTo(this.assembler, "change", this.render);
        $(document).bind('keyup', {}, this._onKeyup);
    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "assembler") return;
        if ($(".placementOrder").is(":focus")) this._updatePlacementOrder(e);
    },

    _updatePlacementOrder: function(e){
        e.preventDefault();
        var newVal = $(e.target).val();
        if (newVal.length<3) return;//todo this isn't quite right
        this.assembler.set("placementOrder", newVal);
        this.assembler.trigger("change:placementOrder");
    },

    _selectCamStrategy: function(e){
        e.preventDefault();
        this.assembler.set("camStrategy", $(e.target).data("type"));
    },

    _selectMachine: function(e){
        e.preventDefault();
        this.assembler.set("machineName", $(e.target).data("type"));
    },

    render: function(){
        if (this.model.get("currentTab") != "assembler") return;
        if ($("input").is(":focus")) return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), this.assembler.toJSON())));
    },

    template: _.template('\
        Machine: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMachineTypes[machineName] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allMachineTypes), function(key){ %>\
                        <li><a class="machineType" data-type="<%= key %>" href="#"><%= allMachineTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Strategy: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allAssemblyStrategies[camStrategy] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allAssemblyStrategies), function(key){ %>\
                        <li><a class="camStrategy" data-type="<%= key %>" href="#"><%= allAssemblyStrategies[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
            <% if (camStrategy == "manual"){ %>\
        Manual Placement Order: &nbsp;&nbsp;<input value="<%= placementOrder %>" placeholder="Placement Order" class="form-control placementOrder" type="text"><br/><br/>\
        <% } %>\
        ')
});