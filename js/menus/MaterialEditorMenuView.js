/**
 * Created by aghassaei on 6/24/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materials', 'text!materialEditorMenuTemplate', 'fileSaver'],
    function($, _, MenuParentView, plist, materials, template, fileSaver){

    var materialNameIndex = 1;

    return MenuParentView.extend({

        events: {
            "click #cancelMaterial":                             "_cancelMaterial",
            "click #deleteMaterial":                             "_deleteMaterial",
            "click #finishMaterial":                             "_save",
            "click #newRandomColor":                             "_changeRandomColor",
            "click #saveMaterial":                               "_saveMaterialToFile"
        },

        _initialize: function(){
            //bind events
            if (!materials.getEditingMaterial()) console.warn("no editing material id set");
            this.material = _.clone(materials.list[materials.getEditingMaterial()]);
            if (!this.material) this.material = {
                name: "Material " + materialNameIndex++,
                color: '#000000',
                altColor: '#000000',
                noDelete: false,
                properties: {}
            };

        },

        getPropertyOwner: function($target){
            if ($target.hasClass("materialEditor")) return this.material;
            else if ($target.hasClass("materialProperties")) return this.material.properties;
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _changeRandomColor: function(e){
            e.preventDefault();
            var color = '#' + Math.floor(Math.random()*16777215).toString(16);
            this.material.altColor = color;
            this.render();
        },

        _save: function(e){
            e.preventDefault();
            if (this.material.name == "") this.material.name = "Material " + materialNameIndex++;
            materials.setMaterial(materials.getEditingMaterial(), _.clone(this.material));
            this._exit();
        },

        _saveMaterialToFile: function(e){
            e.preventDefault();
            fileSaver.saveMaterial(materials.getEditingMaterial(), this.material);
        },

        _deleteMaterial: function(e){
            e.preventDefault();
            if (!materials.list[materials.getEditingMaterial()]) {
                this._exit();
                return;
            }
            var deleted = materials.setMaterial(materials.getEditingMaterial(), null);
            if (deleted) this._exit();
        },

        _cancelMaterial: function(e){
            e.preventDefault();
            this._exit();
        },

        _exit: function(){
            this.material = null;
            materials.setEditingMaterial(null);
            this.model.set("currentNav", "navDesign");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.material);
        },

        _destroy: function(){
            var self = this;
            _.each(_.keys(this.material), function(key){
                delete self.material[key];
            });
            this.material = null;
        },

        template: _.template(template)
    });
});