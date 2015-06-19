/**
 * Created by aghassaei on 6/4/15.
 */


define(['underscore', 'three', 'appState', 'globals'], function(_, THREE, appState, globals){

    var materials = {
        deleteMaterial: {
            color: "#ff0000",
            threeMaterial:new THREE.MeshLambertMaterial({color:"#ff0000", shading:THREE.FlatShading})
        }
    };

    _.extend(materials, Backbone.Events);

    materials.listenTo(appState, "change:realisticColorScheme", changeColorScheme);
    materials.listenTo(appState, "change:materialClass", loadMaterialClass);

    globals.materials = materials;

    function loadMaterialClass(){
        var materialClass = appState.get("materialClass");
        var materialType = appState.get("materialType");
        if (!plist.allMaterials[materialClass].materialType) this.set("materialType", _.keys(plist.allMaterials[materialClass])[0], {silent:true});//set to default silently
        if (globals.materials[materialClass]) return;//already loaded
        require([materialClass + "Materials"], function(MaterialClass){
            globals.materials[materialClass] = MaterialClass;
        });
    }

    function changeColorScheme(){
        var state = appState.get("realisticColorScheme");
        _.each(_.keys(materials), function(name){
            var materialInfo = materials[name];

            var color = materialInfo.color;
            if (!color) console.warn("no color for material type " + name);
            if (!state && materialInfo.altColor) color = materialInfo.altColor;

            if (materialInfo.threeMaterial) materialInfo.threeMaterial.color = new THREE.Color(color);
            else materialInfo.threeMaterial = new THREE.MeshLambertMaterial({color:color, shading:THREE.FlatShading});
        });
    }


    function DMAMaterials(materialList){
        this.materials = {};
        this.materialList = materialList;
        this.changeMaterials();
    }

    DMAMaterials.prototype.changeMaterials = function(){
        var self = this;
        var state = appState.get("realisticColorScheme");
        _.each(_.keys(self.materialList), function(materialName){
            var materialData = self.materialList[materialName];
            if (state) {
                if (self.materials[materialName]) self.materials[materialName].color = new THREE.Color(materialData.color);
                else self.materials[materialName] = new THREE.MeshLambertMaterial({color:materialData.color, shading:THREE.FlatShading});
                if (materialData.opacity){
                    self.materials[materialName].transparent = true;
                    self.materials[materialName].opacity = materialData.opacity;
                } else {
                    self.materials[materialName].transparent = false;
                }
            }
            else {
                if (self.materials[materialName]) self.materials[materialName].color = new THREE.Color(materialData.altColor);
                else self.materials[materialName] = new THREE.MeshLambertMaterial({color:materialData.altColor, shading:THREE.FlatShading});
                self.materials[materialName].transparent = false;
            }
        });
    };

    return materials;
});