/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'lattice', 'globals'], function($, _, MenuParentView, plist, lattice, globals){

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
            lattice.setToCompositeMode(id, globals.materials.compositeMaterials[id]);
        },

        _latticeToComposite: function(e){
            e.preventDefault();
        },

        _makeTemplateJSON: function(){
            return _.extend(lattice.toJSON(), this.model.toJSON(), plist, globals);
        },

        template: _.template('\
            Material Class: &nbsp;&nbsp;\
                <div class="btn-group">\
                    <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMaterialClasses[materialClass] %><span class="caret"></span></button>\
                    <ul role="menu" class="dropdown-menu">\
                        <% _.each(_.keys(allMaterialClasses), function(key){ %>\
                            <li><a class="lattice dropdownSelector" data-property="materialClass" data-value="<%= key %>" href="#"><%= allMaterialClasses[key] %></a></li>\
                        <% }); %>\
                    </ul>\
                </div><br/><br/>\
            <% if (allMaterialTypes[cellType][connectionType]){ %> \
            Materials:<br/>\
            <% _.each(_.keys(allMaterials[materialClass]), function(key){ %>\
            <label class="radio colorSwatches">\
                <input type="radio" <%if (key == materialType){ %>checked<%}%> name="materialType" value="<%= key %>" data-toggle="radio" class="custom-radio lattice"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
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
            <% _.each(_.keys(materials.compositeMaterials), function(key){ %>\
            <label class="radio colorSwatches">\
                <input type="radio" <%if (key == materialType){ %>checked<%}%> name="materialType" value="<%= key %>" data-toggle="radio" class="custom-radio lattice"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
                <div class="materialColorSwatch">\
                <div style="background-color:<% if(realisticColorScheme){ %><%= materials.compositeMaterials[key].color %><% }else{ %><%= materials.compositeMaterials[key].altColor %><% } %>"></div>\
                <span><%= materials.compositeMaterials[key].name %><a data-id="<%= key %>" class="editComposite">Edit</a></span></div>\
            </label>\
            <% }); %><br/>\
            <a id="navToCompositeMenu" href="#" class="btn btn-block btn-lg btn-default">+ Create New Composite Material</a><br/>\
            <a id="compositeFromLattice" href="#" class="btn btn-block btn-lg btn-default">New Composite From Current Assembly</a><br/>\
            ')

    });
});