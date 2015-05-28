/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

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
        if (this.model.get("currentTab") != "lattice") return;
        if ($("input[type=text]").is(":focus")) return;
        this.$el.html(this.template(_.extend(globals.lattice.toJSON(), globals.plist)));
    },

    template: _.template('\
        Cell Type: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allCellTypes[cellType] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allCellTypes), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="cellType" data-value="<%= key %>" href="#"><%= allCellTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Cell Connection:&nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allConnectionTypes[cellType][connectionType] %>-Connected<span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allConnectionTypes[cellType]), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="connectionType" data-value="<%= key %>" href="#"><%= allConnectionTypes[cellType][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        <% if (connectionType == "freeformFace") { %>\
        Current Draw Shape:&nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= freeformCellType %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <li><a class="lattice dropdownSelector" data-property="freeformCellType" data-value="octa" href="#">octa</a></li>\
                    <li><a class="lattice dropdownSelector" data-property="freeformCellType" data-value="tetra" href="#">tetra</a></li>\
                </ul>\
            </div>\
            <br/><br/>\
        <% } %>\
        <% if (connectionType == "gik") { %>\
        GIK Length:&nbsp;&nbsp;<input data-property="gikLength" value="<%= gikLength %>" placeholder="GIK length" class="form-control intInput lattice" type="text"><br/>\
        <br/>\
        <% } %>\
        <a href="#" class="clearCells btn btn-block btn-lg btn-danger">Clear All Cells</a><br/>\
        Num Cells:&nbsp;&nbsp;<%= numCells %><br/>\
        ')

});

//Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text">\
//&nbsp;<input data-type="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control numberInput cellSeparation" type="text">\
//<% } else { %>( radial ): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text"><% } %>\
//<br/><br/>\