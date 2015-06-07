/**
 * Created by aghassaei on 6/4/15.
 */


define(['underscore', 'three', 'appState'], function(_, THREE, appState){

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

    return DMAMaterials;
});