/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'globals', 'materials'], function($, _, MenuParentView, plist, lattice, globals, materials){

    return MenuParentView.extend({

        events: {
            "click #navToCompositeMenu":                             "_navToCompositeMenu",
            "click #compositeFromLattice":                           "_latticeToComposite",
            "click .editComposite":                                  "_editComposite"
        },

        _initialize: function(){
            //bind events
            this.listenTo(lattice, "change", this.render);
            this.listenTo(this.model, "change", this.render);
        },

        _navToCompositeMenu: function(e){
            e.preventDefault();
            lattice.setToCompositeMode();
        },

        _editComposite: function(e){
            e.stopPropagation();
            e.preventDefault();
            var id = $(e.target).data("id");
            lattice.setToCompositeMode(id, materials[id]);
        },

        _latticeToComposite: function(e){
            lattice.setToCompositeMode(null, lattice.getCompositeData());
            lattice.clearCells();
            e.preventDefault();
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), this.model.toJSON(), plist, globals, {materials:materials});
        },

        template: _.template('\
            Material Class: &nbsp;&nbsp;\
                <div class="btn-group">\
                    <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMaterialClasses[materialClass] %><span class="caret"></span></button>\
                    <ul role="menu" class="dropdown-menu">\
                        <% _.each(_.keys(allMaterialClasses), function(key){ %>\
                            <li><a class="appState dropdownSelector" data-property="materialClass" data-value="<%= key %>" href="#"><%= allMaterialClasses[key] %></a></li>\
                        <% }); %>\
                    </ul>\
                </div><br/><br/>\
            <% if (allMaterialTypes[cellType][connectionType]){ %> \
            Materials:<br/>\
            <% _.each(_.keys(allMaterials[materialClass]), function(key){ %>\
            <label class="radio colorSwatches">\
                <input type="radio" <%if (key == materialType){ %>checked<%}%> name="materialType" value="<%= key %>" data-toggle="radio" class="custom-radio appState"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
                <div class="materialColorSwatch">\
                <div style="background-color:<% if(realisticColorScheme){ %><%= allMaterials[materialClass][key].color %><% }else{ %><%= allMaterials[materialClass][key].altColor %><% } %>"></div>\
                <span><%= allMaterials[materialClass][key].name %></span></div>\
            </label>\
            <% }); %>\
            <br/>\
            <label class="checkbox" for="realisticColorScheme">\
            <input id="realisticColorScheme" data-property="realisticColorScheme" type="checkbox" <% if (realisticColorScheme){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="appState custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Use realistic color scheme</label>\
            <% } %>\
            <br/>\
            Composite Materials:<br/>\
            <% if ((cellType == "octa" && connectionType != "vertex") || cellType == "tetra"){ %>\
            not available for this lattice type\
            <%  } else { %> \
            <% _.each(_.keys(materials), function(key){ \
            if (key.substr(0,5) != "super") return; %>\
            <label class="radio colorSwatches">\
                <input type="radio" <%if (key == materialType){ %>checked<%}%> name="materialType" value="<%= key %>" data-toggle="radio" class="custom-radio appState"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
                <div class="materialColorSwatch">\
                <div style="background-color:<% if(realisticColorScheme){ %><%= materials[key].color %><% }else{ %><%= materials[key].altColor %><% } %>"></div>\
                <span><%= materials[key].name %><a data-id="<%= key %>" class="editComposite">Settings...<a/></span></div>\
            </label>\
            <% }); %><br/>\
            <% if (_.keys(materials).length > 0) { %>\
            Offset (xyz): &nbsp;&nbsp;<input data-property="superCellIndex" data-key="x" value="<%= superCellIndex.x %>" placeholder="X" class="form-control intInput appState" type="text">\
                &nbsp;<input data-property="superCellIndex" data-key="y" value="<%= superCellIndex.y %>" placeholder="Y" class="form-control intInput appState" type="text">\
                &nbsp;<input data-property="superCellIndex" data-key="z" value="<%= superCellIndex.z %>" placeholder="Z" class="form-control intInput appState" type="text"><br/><br/>\
            <% } %>\
            <a id="navToCompositeMenu" href="#" class="btn btn-block btn-lg btn-default">+ Create New Composite Material</a><br/>\
            <a id="compositeFromLattice" href="#" class="btn btn-block btn-lg btn-default">New Composite From Current Assembly</a><br/>\
            <% } %>\
            ')

    });
});