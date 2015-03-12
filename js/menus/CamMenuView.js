/**
 * Created by aghassaei on 1/26/15.
 */


CamMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click .camProcess":                            "_selectCamProcess",
        "click .units":                                 "_changeUnits",
        "click #saveCam":                               "_save"
    },


    initialize: function(options){

        this.lattice = options.lattice;
        this.assembler = options.assembler;

        _.bindAll(this, "render");
        _.bindAll(this, "_updateOrigin");
        //bind events
        this.listenTo(this.assembler, "change", this.render);
        this.listenTo(this.model, "change:units", this.render);
        $(document).bind('keyup', {state:false}, this._updateOrigin);
    },

    _selectCamProcess: function(e){
        e.preventDefault();
        this.assembler.set("camProcess", $(e.target).data("type"));
    },

    _changeUnits: function(e){
        e.preventDefault();
        this.model.set("units", $(e.target).data("type"));
    },

    _updateOrigin: function(e){
        if (!$(".wcs").is(":focus")) return;
        e.preventDefault();
        var newPosition = parseFloat($(e.target).val());
        if (isNaN(newPosition)) return;
        var origin = this.assembler.get("originPosition");
        origin[$(e.target).data("type")] = newPosition;
        this.assembler.trigger("change:originPosition");
    },

    _save: function(e){
        e.preventDefault();
        this.assembler.save();
    },

    render: function(){
        if (this.model.get("currentTab") != "cam") return;
        if ($(".wcs").is(":focus")) return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), this.assembler.toJSON())));
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
         <a href="#" id="saveCam" class=" btn btn-block btn-lg btn-default">Process and Save</a><br/>\
         Units: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allUnitTypes[units] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allUnitTypes), function(key){ %>\
                        <li><a class="units" data-type="<%= key %>" href="#"><%= allUnitTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
            Part Zero: &nbsp;&nbsp;<input data-type="x" value="<%= originPosition.x %>" placeholder="origin X" class="form-control numberInput wcs" type="text">\
            &nbsp;<input data-type="y" value="<%= originPosition.y %>" placeholder="origin Y" class="form-control numberInput wcs" type="text">\
            &nbsp;<input data-type="z" value="<%= originPosition.z %>" placeholder="origin Z" class="form-control numberInput wcs" type="text"><br/>\
        ')

});