/**
 * Created by aghassaei on 8/12/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'materialsPlist', 'cam', 'materials', 'text!menus/templates/EditComponentMenuView.html'],
    function($, _, MenuParentView, plist, materialsPlist, cam, materials, template){

    return MenuParentView.extend({

        events: {
            "click #finishComponent":                                 "_save",
            "click #deleteComponent":                                 "_delete",
            "click .removeChild":                                     "_removeChild",
            "click .addChild":                                        "_addChild",
            "click .changeParent":                                    "_changeParent",
            "click .stockMaterial":                                   "_changeStockMaterial"
        },

        _initialize: function(){
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("component")) return cam.get("assembler").getComponent(cam.get("editingComponent"));
            return null;
        },

        _save: function(e){
            e.preventDefault();
            this._stopEditing();
        },

        _delete: function(e){
            e.preventDefault();
            console.log("delete component");
            this._stopEditing();
        },

        _stopEditing: function(){
            cam.set("editingComponent", null);
            this.model.set("currentNav", "navAssemble");
        },

        _removeChild: function(e){
            e.preventDefault();
            var id = $(e.target).data("id");
            var assembler = cam.get("assembler");
            assembler.addChild(assembler.getComponent(id));//add subtree to root
            assembler.buildComponentTree();
            this.render();
        },

        _addChild: function(e){
            e.preventDefault();
            var id = $(e.target).data("id");
            var assembler = cam.get("assembler");
            assembler.getComponent(cam.get("editingComponent")).addChild(assembler.getComponent(id));
            assembler.buildComponentTree();
            this.render();
        },

        _changeParent: function(e){
            e.preventDefault();
            var id = $(e.target).data("id");
            var assembler = cam.get("assembler");
            var parent = assembler;
            if (id) parent = assembler.getComponent(id);
            parent.addChild(assembler.getComponent(cam.get("editingComponent")));
            assembler.buildComponentTree();
            this.render();
        },

        _changeStockMaterial: function(e){
            e.preventDefault();
            var $target = $(e.target);
            var id = $target.data("id");
            if (id === undefined) id = $target.closest("a").data("id");
            cam.get("assembler").getComponent(cam.get("editingComponent")).setMaterial(id);
            this.render();
        },

        _makeTemplateJSON: function(){
            var assembler = cam.get("assembler");
            var editingComponent = cam.get("editingComponent");
            var component = assembler.getComponent(editingComponent);
            var allDescendants = [];
            var allAncestors = component.getAncestry([]);
            var correctBranch = false;
            _.each(assembler.tree, function(level, id){
                if(correctBranch && level <= assembler.tree[editingComponent]) correctBranch = false;
                if(id == editingComponent) correctBranch = true;
                if (!correctBranch || assembler.tree[editingComponent] >= level) return;
                allDescendants.push(id);
            });
            return _.extend(this.model.toJSON(), cam.toJSON(), assembler.toJSON(), plist, materialsPlist,
                {thisComponent: component.toJSON(), ancestors:allAncestors, descendants:allDescendants, materials:materials.list});
        },

        template: _.template(template)

    });
});