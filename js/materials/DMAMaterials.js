/**
 * Created by aghassaei on 6/4/15.
 */

//everything is a top level material with a threeMaterial object
define(['underscore', 'three', 'appState', 'lattice', 'materialsPlist', 'threeModel', 'material'],
    function(_, THREE, appState, lattice, materialsPlist, three, DMAMaterial){

    var materialsList = {
    };
    newMaterial({
        id: "deleteMaterial",
        name: "Delete",
        color: "#ff0000",
        altColor: "#ff0000",
        noDelete: true
    });


    var listener = {};
    _.extend(listener, Backbone.Events);

    listener.listenTo(appState, "change:realisticColorScheme", changeColorScheme);
    listener.listenTo(appState, "change:materialClass", function(){setToDefaultMaterial()});//pass no params
//    listener.listenTo(lattice, "change:connectionType cellType", function(){materialClassChanged()});
    listener.listenTo(appState, "change:materialType", setMaterialDefaults);

    setToDefaultMaterial();



    function newMaterial(data, noAdd){
        if (data.sparseCells) {
            console.warn("you are trying to init a composite material as a regular material");
            return null;
        }

        var id = data.id || getNextMaterialID();
        var material = new DMAMaterial(data, id);
        if (noAdd) return material;//in the new material menu, you may init a material before saving changes

        materialsList[id] = material;
        return material;
    }

    function deleteMaterial(id){
        if (materialsList[id] === undefined){
            console.warn("this material was never saved");
            return true;
        }
        if (!materialsList[id].canDelete()) {
            console.warn("no delete flag on this material type");
            return false;
        }
        materialsList[id].destroy();
        materialsList[id] = null;
        delete materialsList[id];//todo check if being used first (instances)
        var deleted = true;
        if (deleted) setToDefaultMaterial();
        return deleted;
    }

    function getMaterialForId(id){
        return materialsList[id];
    }

    function setMaterial(id, data){

        var material = getMaterialForId(id);

        var edited = false;
        if (!material) {
            newMaterial(data);
            return;
        } else {
            if (data.elementaryChildren) data.properties = getPropertiesFromChildren(data.elementaryChildren);
            edited = material.set(data);
        }

        if (edited){
            var allChangedMaterialsList = getAllParentComposites(id);
            allChangedMaterialsList.push(id);

            _.each(allChangedMaterialsList, function(key){
                materialsList[key].compositeChildren = getChildCellTypes(materialsList[key].sparseCells, false);
                materialsList[key].elementaryChildren = getChildCellTypes(materialsList[key].sparseCells, true);
            });

            lattice.reinitAllCellsOfTypes(allChangedMaterialsList);
        }
    }









    function getDeleteMaterial(){
        return materialsList.deleteMaterial.threeMaterial;
    }









    function getCompositeKeys(){
        return _.filter(_.keys(materialsList), function(key){
            return key.substr(0,5) == "super";
        });
    }

    function getVaildAvailableCompositeKeys(id){//for "available materials" list in composite editor
        var compositeKeys = getCompositeKeys();
        var invalidKeys = getAllParentComposites(id);
        invalidKeys.push(id);
        return _.difference(compositeKeys, invalidKeys);
    }

    function getAllParentComposites(id){
        var parentComposites = [];
        _.each(materialsList, function(material, key){
            if (key == id) return;
            if (material.compositeChildren && material.compositeChildren.indexOf(id)>-1){
                parentComposites.push(key);
            }
        });
        return parentComposites;
    }

    function getChildCellTypes(cells, elementaryTypes){//deep search to find all sub sub components
        var children = [];
        loopCells(cells, function(cell){
            if (!cell) return;
            var isComposite = cell.materialID.substr(0,5) == "super";
            if ((elementaryTypes && !isComposite) || (!elementaryTypes && isComposite)) children.push(cell.materialID);
            if (isComposite){
                if (elementaryTypes && materialsList[cell.materialID].elementaryChildren) {
                    Array.prototype.push.apply(children, materialsList[cell.materialID].elementaryChildren);
                }
                else if (!elementaryTypes && materialsList[cell.materialID].compositeChildren) {
                    Array.prototype.push.apply(children, materialsList[cell.materialID].compositeChildren);
                }
            }
        });
        if (children.length == 0) return null;
        return _.uniq(children);//remove duplicates
    }

    function getPropertiesFromChildren(children){
        var properties = {};
        var self = this;
        _.each(children, function(childID){
            if (self.getMaterialForId(childID).getProperties().conductive) properties.conductive = true;
        });
        return properties;
    }

    function loopCells(cells, callback){
        for (var x=0;x<cells.length;x++){
            for (var y=0;y<cells[0].length;y++){
                for (var z=0;z<cells[0][0].length;z++){
                    callback(cells[x][y][z], x, y, z);
                }
            }
        }
    }













    function setToDefaultMaterial(triggerEvent){
        var materialClass = appState.get("materialClass");
        var newDefaultType = _.keys(materialsPlist.allMaterials[materialClass])[0];
        if (!materialsList[newDefaultType]) _.extend(materialsList, parseClassFromDefinitions(materialsPlist.allMaterials[materialClass]));
        if (!materialsList[newDefaultType]) console.warn("material type " + newDefaultType + "  not in definition for " + materialClass);
        if (triggerEvent === undefined) triggerEvent = false;
        appState.set("materialType", newDefaultType, {silent:!triggerEvent});
    }

    function parseClassFromDefinitions(definitions){
        var newMaterials = {};
        _.each(definitions, function(data, key){
            data.noDelete = true;
            newMaterials[key] = new DMAMaterial(data, key);
        });
        return newMaterials;
    }









    function changeColorScheme(){
        var state = appState.get("realisticColorScheme");
        _.each(materialsList, function(material, name){
            material.changeColorScheme(state);
        });
        three.render();
    }

    function setMaterialDefaults(){
        var materialType = appState.get("materialType");
        appState.set("superCellIndex", new THREE.Vector3(0,0,0));
        if (materialsList[materialType].getDimensions()){
            appState.set("superCellRange", materialsList[materialType].getDimensions());
        } else if (lattice.get("connectionType") == "gik"){
            appState.set("superCellRange", new THREE.Vector3(appState.get("gikLength"), 1, 1));
        }
    }



    var compositeID = 0;
    var materialID = 0;

    function getNextCompositeID(){
        return "super" + compositeID++;
    }

    function getNextMaterialID(){
        return "material" + materialID++;
    }



    return {
        list: materialsList,
        newMaterial: newMaterial,
        setMaterial: setMaterial,
        deleteMaterial: deleteMaterial,
        getMaterialForId: getMaterialForId,
        getCompositeKeys: getCompositeKeys,
        getVaildAvailableCompositeKeys: getVaildAvailableCompositeKeys,
        getChildCellTypes:getChildCellTypes,
        setToDefaultMaterial: setToDefaultMaterial,
        getDeleteMaterial: getDeleteMaterial,
        getNextCompositeID: getNextCompositeID
    };
});