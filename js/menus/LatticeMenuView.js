/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

    return MenuParentView.extend({

        events: {
        },


        _initialize: function(){
            this.listenTo(lattice, "change", this.render);
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), plist);
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
            <% if (connectionType == "gik") { %>\
            GIK Length:&nbsp;&nbsp;<input data-property="superCellRange" data-key="x" value="<%= superCellRange.x %>" placeholder="GIK length" class="form-control intInput lattice" type="text"><br/>\
            <br/>\
            <% } %>\
            <a href="#" class="clearCells btn btn-block btn-lg btn-danger">Clear All Cells</a><br/>\
            Num Cells:&nbsp;&nbsp;<%= numCells %><br/>\
            ')

    });
});

//Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text">\
//&nbsp;<input data-type="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control numberInput cellSeparation" type="text">\
//<% } else { %>( radial ): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text"><% } %>\
//<br/><br/>\