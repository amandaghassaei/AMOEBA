/**
 * Created by aghassaei on 1/26/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'text!latticeMenuTemplate'], function($, _, MenuParentView, plist, lattice, template){

    return MenuParentView.extend({

        events: {
        },


        _initialize: function(){
            this.listenTo(lattice, "change", this.render);
            this.listenTo(this.model, "change:superCellRange", this.render);
        },

        _makeTemplateJSON: function(){
            return _.extend(_.extend(lattice.toJSON(), this.model.toJSON()), plist);
        },

        template: _.template(template)
    });
});

//Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text">\
//&nbsp;<input data-type="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control numberInput cellSeparation" type="text">\
//<% } else { %>( radial ): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text"><% } %>\
//<br/><br/>\