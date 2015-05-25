/**
 * Created by aghassaei on 1/26/15.
 */

PartMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");

        //bind events
        this.listenTo(globals.lattice, "change", this.render);
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "part") return;
        this.$el.html(this.template(_.extend(globals.lattice.toJSON(), globals.plist)));
    },

    template: _.template('\
        Part Type: &nbsp;&nbsp;\
        <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allPartTypes[cellType][connectionType][partType] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allPartTypes[cellType][connectionType]), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="partType" data-value="<%= key %>" href="#"><%= allPartTypes[cellType][connectionType][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-property="cellSeparation" data-key="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control floatInput lattice" type="text">\
        &nbsp;<input data-property="cellSeparation" data-key="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control floatInput lattice" type="text">\
        <% } else { %>( radial ): &nbsp;&nbsp;<input data-property="cellSeparation" data-key="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control floatInput lattice" type="text"><% } %>\
        <br/><br/>\
        <% if (allMaterialTypes[cellType][connectionType]){ %> \
        Material Type: &nbsp;&nbsp;<div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMaterialTypes[cellType][connectionType][materialType].name %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allMaterialTypes[cellType][connectionType]), function(key){ %>\
                        <li><a class="materialType" data-type="<%= key %>" href="#"><%= allMaterialTypes[cellType][connectionType][key].name %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        <% } %>\
        <br/>todo: generic beam part type, part types for new lattice configurations\
        ')

});