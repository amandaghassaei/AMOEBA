/**
 * Created by aghassaei on 6/24/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materials', 'text!menus/templates/MaterialEditorMenuView.html', 'fileSaver'],
    function($, _, MenuParentView, plist, materials, template, fileSaver){

    return MenuParentView.extend({

        events: {
            "click #saveToFile":                                 "_saveMaterialToFile",
            "click #newRandomColor":                             "_changeRandomColor"
        },

        _initialize: function(options){

            var materialID = options.myObject;
            var json = {};

            if (materialID) {
                var material = materials.getMaterialForId(materialID);
                if (!material) {
                    console.warn("invalid editing material id " + materialID + " passed in");
                    this.model.set("currentNav", plist.allMenus.navMaterial.parent);
                }
                json = material.toJSON();
            }

            this.material = materials.newMaterial(json, {_noAdd: true});
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("materialEditor")) return this.material;
            else if ($target.hasClass("materialProperties")) return this.material.getProperties();
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _changeRandomColor: function(e){
            e.preventDefault();
            this.material.changeRandomColor();
            this.render();
        },

        _saveMaterialToFile: function(e){
            e.preventDefault();
            fileSaver.saveMaterial(this.material);
        },

        saveExitMenu: function(){
            materials.setMaterial(this.material.getID(), this.material.toJSON());
            return true;
        },

        deleteExitMenu: function(){
            var deleted = materials.deleteMaterialById(this.material.getID());
            this.material = null;
            return deleted;
        },

        _makeTemplateJSON: function(){
            return _.extend(this.material.toJSON());
        },

        _destroy: function(){
            if(this.material) this.material.destroy();
            this.material = null;
        },

        template: _.template(template)
    });
});