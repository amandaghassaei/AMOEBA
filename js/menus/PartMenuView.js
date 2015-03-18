/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click .partType":                                  "_changePartType",
    },

    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "render");
        _.bindAll(this, "_onKeyup");
        //bind events
        this.listenTo(this.lattice, "change:partType", this.render);
        $(document).bind('keyup', {state:false}, this._onKeyup);

    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "part") return;

        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this.render();
            return;
        }

        if ($(".cellSeparation").is(":focus")) this._updateNumber(e, "cellSeparation");
    },

    _updateNumber: function(e, property){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        var object = this.lattice.get(property);
        object[$(e.target).data("type")] = newVal;
        this.lattice.trigger("change:"+property);
    },

    _changePartType: function(e){
        e.preventDefault();
        this.lattice.set("partType", $(e.target).data("type"));
    },

    render: function(){
        if (this.model.get("currentTab") != "part") return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), this.lattice.toJSON())));
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
        Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text">\
        &nbsp;<input data-type="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control numberInput cellSeparation" type="text">\
        <% } else { %>( radial ): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text"><% } %>\
        <br/><br/>todo: generic beam part type, part types for new lattice configurations\
        ')

});