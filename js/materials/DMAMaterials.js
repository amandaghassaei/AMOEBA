/**
 * Created by aghassaei on 6/4/15.
 */

//everything is a top level material with a threeMaterial object
define(['underscore', 'three', 'appState', 'lattice', 'plist', 'threeModel'], function(_, THREE, appState, lattice, plist, three){

    var materialsList = {
        deleteMaterial: {
            color: "#ff0000",
            threeMaterial: makeMaterialObject("#ff0000")
        }
    };

    var listener = {};
    _.extend(listener, Backbone.Events);

    listener.listenTo(appState, "change:realisticColorScheme", changeColorScheme);
    listener.listenTo(appState, "change:materialClass", function(){setToDefaultMaterial()});//pass no params
    listener.listenTo(lattice, "change:connectionType cellType", function(){setToDefaultMaterial()});
    listener.listenTo(appState, "change:materialType", setMaterialDefaults);

    setToDefaultMaterial();





    function setMaterial(id, data){
        if (id && data === null) return deleteMaterial(id);
        if (!materialsList[id]) materialsList[id] = {};
        var oldColor = materialsList[id].color;

        var edited = false;
        if (materialsList[id].sparseCells) edited = !(_.isEqual(data.sparseCells, materialsList[id].sparseCells));

        if (data.elementaryChildren) data.properties = getPropertiesFromChildren(data.elementaryChildren);

        _.each(_.keys(data), function(key){
            if (data[key] && data[key].x) materialsList[id][key] = new THREE.Vector3(data[key].x, data[key].y, data[key].z);
            else materialsList[id][key] = data[key];
        });

        if (!materialsList[id].threeMaterial || oldColor != materialsList[id].color) changeSingleMaterialColorScheme(id);
        if (edited){
            var allChangedMaterialsList = getAllParentComposites(id);
            allChangedMaterialsList.push(id);

            _.each(allChangedMaterialsList, function(key){
                materialsList[key].compositeChildren = getChildCellTypes(materialsList[key].sparseCells, false);
                materialsList[key].elementaryChildren = getChildCellTypes(materialsList[key].sparseCells, true);
            });

            lattice.reinitAllCellsOfTypes(allChangedMaterialsList);
        }

        return false;
    }

    function deleteMaterial(id){
        if (materialsList[id].noDelete) {
            console.warn("no delete flag on this material type");
            return false;
        }
        delete materialsList[id];//todo check if being used first
        var deleted = true;
        if (deleted) setToDefaultMaterial();
        return deleted;
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
            var isComposite = cell.materialName.substr(0,5) == "super";
            if ((elementaryTypes && !isComposite) || (!elementaryTypes && isComposite)) children.push(cell.materialName);
            if (isComposite){
                if (elementaryTypes && materialsList[cell.materialName].elementaryChildren) {
                    Array.prototype.push.apply(children, materialsList[cell.materialName].elementaryChildren);
                }
                else if (!elementaryTypes && materialsList[cell.materialName].compositeChildren) {
                    Array.prototype.push.apply(children, materialsList[cell.materialName].compositeChildren);
                }
            }
        });
        if (children.length == 0) return null;
        return _.uniq(children);//remove duplicates
    }

    function getPropertiesFromChildren(children){
        var properties = {};
        _.each(children, function(child){
            if (materialsList[child].properties.conductive) properties.conductive = true;
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
        var newDefaultType = _.keys(plist.allMaterials[materialClass])[0];
        if (!materialsList[newDefaultType]) _.extend(materialsList, parseClassFromDefinitions(plist.allMaterials[materialClass]));
        if (!materialsList[newDefaultType]) console.warn("material type " + newDefaultType + "  not in definition for " + materialClass);
        if (triggerEvent === undefined) triggerEvent = false;
        appState.set("materialType", newDefaultType, {silent:!triggerEvent});
    }

    function parseClassFromDefinitions(definitions){
        var newMaterials = {};
        var state = appState.get("realisticColorScheme");
        _.each(_.keys(definitions), function(key){
            newMaterials[key] = definitions[key];
            var color = getMaterialColorForState(state, definitions[key], key);
            newMaterials[key].threeMaterial = makeMaterialObject(color);
            newMaterials[key].transparentMaterial = makeMaterialObject(color, true);
            newMaterials[key].noDelete = true;//don't delete the predefined materials
        });
        return newMaterials;
    }









    function changeColorScheme(){
        var state = appState.get("realisticColorScheme");
        _.each(_.keys(materialsList), function(name){
            if (name == "setMaterial") return;
            changeSingleMaterialColorScheme(name, state);
        });
        three.render();
    }

    function changeSingleMaterialColorScheme(name, state){
        if (!state) state = appState.get("realisticColorScheme");
        var materialInfo = materialsList[name];
        var color = getMaterialColorForState(state, materialInfo, name);

        if (materialInfo.threeMaterial) materialInfo.threeMaterial.color = new THREE.Color(color);
        else materialInfo.threeMaterial = makeMaterialObject(color);

        if (materialInfo.transparentMaterial) materialInfo.transparentMaterial.color = new THREE.Color(color);
        else materialInfo.transparentMaterial = makeMaterialObject(color, true);
    }

    function getMaterialColorForState(state, definition, key){
        var color = definition.color;
        if (!color) console.warn("no color for material type " + key);
        if (!state && definition.altColor) color = definition.altColor;
        return color;
    }

    function makeMaterialObject(color, transparent){
        if (transparent) return new THREE.MeshLambertMaterial({color:color, shading:THREE.FlatShading, transparent: true, opacity:0.1});
        return new THREE.MeshLambertMaterial({color:color, shading:THREE.FlatShading});
    }

    function setMaterialDefaults(){
        var materialType = appState.get("materialType");
        appState.set("superCellIndex", new THREE.Vector3(0,0,0));
        if (materialsList[materialType].dimensions){
            appState.set("superCellRange", materialsList[materialType].dimensions.clone());
        } else if (lattice.get("connectionType") == "gik"){
            appState.set("superCellRange", new THREE.Vector3(appState.get("gikLength"), 1, 1));
        }
    }

    return {
        list: materialsList,
        setMaterial: setMaterial,
        getCompositeKeys: getCompositeKeys,
        getVaildAvailableCompositeKeys: getVaildAvailableCompositeKeys,
        getChildCellTypes:getChildCellTypes,
        setToDefaultMaterial: setToDefaultMaterial
    };
});