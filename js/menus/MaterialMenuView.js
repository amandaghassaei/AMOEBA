/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'materialPlist', 'plist', 'lattice', 'text!menus/templates/MaterialMenuView.html'],
    function($, _, MenuParentView, materialsPlist, plist, lattice, template){

    return MenuParentView.extend({

        events: {
            "click .editMaterial":                                   "_editMaterial",
            "click #newMaterial":                                    "_newMaterial"
        },

        _initialize: function(){
        },

        _editMaterial: function(e){
            e.stopPropagation();
            e.preventDefault();
            this._openMaterialEditor($(e.target).data("id"));
        },

        _newMaterial: function(e){
            e.preventDefault();
            this._openMaterialEditor();
        },

        _openMaterialEditor: function(materialID){
            require(['menuWrapper'], function(menuWrapper){
                menuWrapper.initTabWithObject(materialID, "materialEditor", "navMaterial")
            });
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), materialsPlist);
        },

        template: _.template(template)
    });
});

//<!--<% _.each(materials, function(material, key){ %>-->
//    <!--<% if(material.noDelete) return; %>-->
//    <!--<label class="radio colorSwatches">-->
//        <!--<input type="radio" <%if (key == materialType){ %>checked<%}%> name="materialType" value="<%= key %>" data-toggle="radio" class="custom-radio appState"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>-->
//        <!--<div class="materialColorSwatch">-->
//        <!--<div style="background-color:<% if(realisticColorScheme){ %><%= material.color %><% }else{ %><%= material.altColor %><% } %>"></div>-->
//        <!--<span><span><%= material.name %></span><a data-id="<%= key %>" class="editMaterial">Edit...</a></span></div>-->
//    <!--</label>-->
//<!--<% }); %>-->