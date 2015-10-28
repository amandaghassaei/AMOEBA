/**
 * Created by aghassaei on 6/4/15.
 */

//everything is a top level material with a threeMaterial object
define(['underscore', 'three', 'appState', 'lattice', 'materialsPlist', 'threeModel', 'material', 'compositeMaterial', 'console'],
    function(_, THREE, appState, lattice, materialsPlist, three, DMAMaterial, DMACompositeMaterial, myConsole){


    var materialsList = {};
    var compositeMaterialsList = {};

    newMaterial({
        id: "deleteMaterial",
        name: "Delete",
        color: "#ff0000",
        altColor: "#ff0000",
        noDelete: true
    }, {silent:true} );

    var compositeID = 1;
    var materialID = 1;

    function getNextCompositeID(){
        return "super" + compositeID++;
    }

    function getNextMaterialID(){
        return "material" + materialID++;
    }

    var listener = {};
    _.extend(listener, Backbone.Events);

    listener.listenTo(appState, "change:realisticColorScheme", changeColorScheme);
    listener.listenTo(appState, "change:materialClass", function(){setToDefaultMaterial()});//pass no params
//    listener.listenTo(lattice, "change:connectionType cellType", function(){materialClassChanged()});
    listener.listenTo(appState, "change:materialType", setMaterialDefaults);

    setToDefaultMaterial();



    function newMaterial(data, options){
        options = options || {};
        data = data || {};

        if (data.sparseCells) {
            console.warn("you are trying to init a composite material, use newCompositeMaterial()");
            return newCompositeMaterial(data, options);
        }

        var id = data.id || getNextMaterialID();
        var material = new DMAMaterial(data, id);

        if (options.noAdd) return material;//in the new material menu, you may init a material before saving changes

        materialsList[id] = material;
        if (!options.silent) myConsole.write("materials.newMaterial(" + JSON.stringify(material.toJSON()) + "}");
        return material;
    }

    function newCompositeMaterial(data, options){
        options = options || {};
        data = data || {};

        var id = data.id || getNextMaterialID();
        var material = new DMAMaterial(data, id);

        if (options.noAdd) return material;//in the new material menu, you may init a material before saving changes

        compositeMaterialsList[id] = material;
        if (!options.silent) myConsole.write("materials.newCompositeMaterial(" + JSON.stringify(material.toJSON()) + "}");
        return material;
    }

    function deleteMaterialById(id){
        var material = getMaterialForId(id);
        if (!material){
            myConsole.warn("this material was never saved, deleteMaterial operation cancelled");
            return false;
        }
        return deleteMaterial(material);
    }

    function deleteMaterial(material){
        if (!material){
            myConsole.warn("no material provided, deleteMaterial operation cancelled");
            return false;
        }
        if (!material.canDelete()) {
            myConsole.warn("noDelete flag on this material type, deleteMaterial operation cancelled");
            return false;
        }
        myConsole.write("materials.deleteMaterialById(" + id + "}");
        myConsole.log(JSON.stringify(material.toJSON()));
        if (material.isComposite()){
            compositeMaterialsList[id] = null;
            delete compositeMaterialsList[id];//todo check if being used first
        } else {
            materialsList[id] = null;
            delete materialsList[id];//todo check if being used first (instances)
        }
        material.destroy();

        var deleted = true;
        if (deleted) setToDefaultMaterial();
        return deleted;
    }

    function getMaterialForId(id){
        return materialsList[id] || compositeMaterialsList[id];
    }

    function setMaterial(id, data){

        var material = getMaterialForId(id);
        if (material.isComposite()){
            console.warn("use setCompositeMaterial()");
            return setCompositeMaterial(id, data);
        }
        if (!material) return newMaterial(data);

        var edited = material.set(data);
        if (edited) myConsole.write("materials.setMaterial(" + id + ", " + JSON.stringify(material.toJSON()) + "}");

        if (edited){
            //update properties of all composites containing this element
            var allChangedMaterialsList = getAllParentComposites(id);
        }
    }

    function setCompositeMaterial(id, data){

        var material = getMaterialForId(id);
        if (!material) return newCompositeMaterial(data);

        var edited = material.setMetaData(data);
        var materialDefinitionEdited = material.setData(data);
        edited |= materialDefinitionEdited;

        if (edited) myConsole.write("materials.setCompositeMaterial(" + id + ", " + JSON.stringify(material.toJSON()) + "}");

        if (materialDefinitionEdited){

            //update composite children
            //update elem children
            //update properties

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






    function isComposite(id){
        var material = this.getMaterialForId(id);
        if (!material) {
            console.warn("no material found with id " + id);
            return false;
        }
        return material.isComposite();
    }

    function getCompositeKeys(){
        return _.keys(compositeMaterialsList);
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
            if (material.compositeChildren && material.isCompositeChild(id)){
                parentComposites.push(key);
            }
        });
        return parentComposites;
    }

    function getChildCellTypes(cells, elementaryTypes){//deep search to find all sub sub components
        var children = [];
        var _isComposite = isComposite;
        loopCells(cells, function(cell){
            if (!cell) return;
            var isComposite = _isComposite(cell.getMaterialID());
            if ((elementaryTypes && !isComposite) || (!elementaryTypes && isComposite)) children.push(cell.getMaterialID());
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











    //events

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
            data.id = key;
            newMaterial(data, {silent:true});
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
        if (materialsList[materialType].getDimensions){
            appState.set("superCellRange", materialsList[materialType].getDimensions());
        } else if (lattice.get("connectionType") == "gik"){
            appState.set("superCellRange", new THREE.Vector3(appState.get("gikLength"), 1, 1));
        }
    }


    return {
        list: materialsList,
        newMaterial: newMaterial,
        newCompositeMaterial: newCompositeMaterial,
        setMaterial: setMaterial,
        deleteMaterialById: deleteMaterialById,
        deleteMaterial: deleteMaterial,
        getMaterialForId: getMaterialForId,
        isComposite: isComposite,


        getCompositeKeys: getCompositeKeys,
        getVaildAvailableCompositeKeys: getVaildAvailableCompositeKeys,
        getChildCellTypes:getChildCellTypes,
        setToDefaultMaterial: setToDefaultMaterial,
        getDeleteMaterial: getDeleteMaterial,
        getNextCompositeID: getNextCompositeID
    };
});