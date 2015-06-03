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
            <!--Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-property="cellSeparation" data-key="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control floatInput lattice" type="text">\
            &nbsp;<input data-property="cellSeparation" data-key="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control floatInput lattice" type="text">\
            <% } else { %>( radial ): &nbsp;&nbsp;<input data-property="cellSeparation" data-key="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control floatInput lattice" type="text"><% } %>\
            <br/><br/>--><br/>\
            <% if (allMaterialTypes[cellType][connectionType]){ %> \
            Materials:<br/>\
            <% _.each(_.keys(allMaterialTypes[cellType][connectionType]), function(key){ %>\
            <label class="radio colorSwatches">\
                <input type="radio" <%if (key == materialType){ %>checked<%}%> name="materialType" value="<%= key %>" data-toggle="radio" class="custom-radio lattice"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
                <div class="materialColorSwatch">\
                <div style="background-color:<% if(realisticColorScheme){ %><%= allMaterialTypes[cellType][connectionType][key].color %><% }else{ %><%= allMaterialTypes[cellType][connectionType][key].altColor %><% } %>"></div>\
                <span><%= allMaterialTypes[cellType][connectionType][key].name %></span></div>\
            </label>\
            <% }); %>\
            <br/>\
            <label class="checkbox" for="realisticColorScheme">\
            <input id="realisticColorScheme" data-property="realisticColorScheme" type="checkbox" <% if (realisticColorScheme){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="appState custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Use realistic color scheme</label>\
            <% } %>\
            <br/>\
            ')

    });
});