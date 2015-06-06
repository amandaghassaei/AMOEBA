/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice'], function($, _, MenuParentView, plist, lattice){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            //bind events
            this.listenTo(lattice, "change", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), this.model.toJSON(), plist);
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
            <!--Cell Separation (xy, z): &nbsp;&nbsp;<input data-property="cellSeparation" data-key="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control floatInput lattice" type="text">\
            &nbsp;<input data-property="cellSeparation" data-key="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control floatInput lattice" type="text">\
            <br/><br/>--><br/>\
            ')

    });
});