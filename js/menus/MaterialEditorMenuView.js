/**
 * Created by aghassaei on 6/24/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materials', 'text!materialEditorMenuTemplate'],
    function($, _, MenuParentView, plist, materials, template){

    var materialNameIndex = 1;

    return MenuParentView.extend({

        events: {
            "click #cancelMaterial":                             "_cancelMaterial",
            "click #deleteMaterial":                             "_deleteMaterial",
            "click #finishMaterial":                             "_save"
        },

        _initialize: function(){
            //bind events
            this.material = _.clone(materials[this.model.get("materialType")]);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("materialEditor")) return this.material;
            return null;
        },

        updateHex: function(hex, $target){
            //update hex without rendering
            $target.css("border-color", hex);
        },

        _save: function(e){
            e.preventDefault();
            var name = this.material.name;
            if (name == "") name = "Material " + materialNameIndex++;
            materials.setMaterial(this.model.get("materialType"), {
                name: name,
                color: this.material.color,
                altColor: this.material.altColor
            });
            this._exit();
        },

        _deleteMaterial: function(e){
            e.preventDefault();
            var deleted = materials.setMaterial(this.model.get("materialType"), null);
            if (deleted) this._exit();
        },

        _cancelMaterial: function(e){
            e.preventDefault();
            this._exit();
        },

        _exit: function(){
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