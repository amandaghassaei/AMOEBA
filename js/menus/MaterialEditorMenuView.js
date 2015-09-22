/**
 * Created by aghassaei on 6/24/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materials', 'text!materialEditorMenuTemplate', 'fileSaver'],
    function($, _, MenuParentView, plist, materials, template, fileSaver){

    var materialNameIndex = 1;

    return MenuParentView.extend({

        events: {
            "click #saveToFile":                                 "_saveMaterialToFile",
            "click #newRandomColor":                             "_changeRandomColor"
        },

        _initialize: function(options){
            //bind events
            if (!options.myObject) {
                console.warn("no editing material id passed in");
                this.model.set("currentNav", plist.allMenus.navMaterial.parent);
            }
            this.materialID = options.myObject;
            this.material = _.clone(materials.getMaterialForId(options.myObject));
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

        _saveMaterialToFile: function(e){
            e.preventDefault();
            fileSaver.saveMaterial(this.materialID, this.material);
        },

        saveExitMenu: function(e, callback){
            e.preventDefault();
            if (this.material.name == "") this.material.name = "Material " + materialNameIndex++;
            materials.setMaterial(this.materialID, _.clone(this.material));
            callback();
        },

        deleteExitMenu: function(e, callback){
            var deleted = materials.deleteMaterial(this.materialID);
            if (deleted) callback();
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
            this.materialID = null;
        },

        template: _.template(template)
    });
});