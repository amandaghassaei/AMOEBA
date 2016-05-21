/**
 * Created by aghassaei on 6/2/15.
 */

//globals namespace, not sure if there's a way to get around this

define(['backbone'], function(Backbone){

    var Globals = Backbone.Model.extend({
        defaults:{
            baseplane: null,
            highlighter: null,
            selection3D: null,
            selectedRegion: null,
            fileSaver: null,
            savedAssemblies:{
                element: null,
                function: null,
                module: null,
                system: null
            }
        },

        destroySelectedRegion: function(){
            if (this.get("selectedRegion")) this.get("selectedRegion").destroy();
            this.set("selectedRegion", null);
        },

        destroySelection3D: function(){
            if (this.get("selection3D")) this.get("selection3D").destroy();
            this.set("selection3D", null);
        },

        saveHierarchicalAssembly: function(type){
            if (type == "element" || type == "function" || type == "module" || type == "system") {
                var data = this.get("fileSaver").generateSaveString();
                this.get("savedAssemblies")[type] = data;
            }
            else console.warn("unknown type " + type);
        },

        loadHierarchicalAssembly: function(type){
            if (type == "element" || type == "function" || type == "module" || type == "system") {
                var string = this.get("savedAssemblies")[type];
                if (string) this.get("fileSaver").loadFile(JSON.parse(string));
            }
            else console.warn("unknown type " + type);
        }




    });
    return new Globals();
});