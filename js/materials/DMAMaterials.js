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
        _.each(_.keys(self.materialList), function(material){
            if (appState.get("realisticColorScheme")) {
                if (self.materials[material]) self.materials[material].color = new THREE.Color(self.materialList[material].color);
                else self.materials[material] = new THREE.MeshLambertMaterial({color:self.materialList[material].color});
                if (self.materialList[material].opacity){
                    self.materials[material].transparent = true;
                    self.materials[material].opacity = self.materialList[material].opacity;
                } else {
                    self.materials[material].transparent = false;
                }
            }
            else {
                if (self.materials[material]) self.materials[material].color = new THREE.Color(self.materialList[material].altColor);
                else self.materials[material] = new THREE.MeshLambertMaterial({color:self.materialList[material].altColor});
                self.materials[material].transparent = false;
            }
        });
    };

    return DMAMaterials;
});