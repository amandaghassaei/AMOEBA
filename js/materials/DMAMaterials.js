/**
 * Created by aghassaei on 6/4/15.
 */

//everything is a top level material with a threeMaterial object
define(['underscore', 'backbone', 'three', 'appState', 'lattice', 'materialsPlist', 'threeModel', 'material', 'compositeMaterial', 'console'],
    function(_, Backbone, THREE, appState, lattice, materialsPlist, three, DMAMaterial, DMACompositeMaterial, myConsole){

    var compositeID = 1;
    var materialID = 1;

    function getNextCompositeID(){
        return "super" + compositeID++;
    }

    function getNextMaterialID(){
        return "material" + materialID++;
    }

    return new Backbone.Model.extend({

        initialize: function(){
            this.materialsList = {};
            this.compositeMaterialsList = {};
            this.newMaterial({
                id: "deleteMaterial",
                name: "Delete",
                color: "#ff0000",
                altColor: "#ff0000",
                noDelete: true
            }, {silent:true});

            this.listenTo(appState, "change:realisticColorScheme", this.changeColorScheme);
            this.listenTo(appState, "change:materialClass", this.loadMaterialClass);
            this.listenTo(appState, "change:materialType", this.setMaterialDefaults);

            this.loadMaterialClass();
        },

        loadMaterialClass:function(){
            var materialClass = appState.get("materialClass");
            var self = this;
            _.each(materialsPlist.allMaterials[materialClass], function(json, id){
                if (self.materialsList[id]) return;
                json.noDelete = true;
                json.id = id;
                self.materialsList[id] = self.newMaterial(json, {silent:true});
            });
            this.setToDefaultMaterial();
        },

        setToDefaultMaterial: function(){
            var materialClass = appState.get("materialClass");
            var id = _.keys(materialsPlist.allMaterials[materialClass])[0];
            if (!this.getMaterialForId(id)) {
                this.loadMaterialClass();
                return;
            }
            appState.set("materialType", id);
        },




        //create/delete materials

        newMaterial: function(json, options){
            options = options || {};
            json = json || {};

            if (json.sparseCells) {
                console.warn("you are trying to init a composite material, use newCompositeMaterial()");
                return this.newCompositeMaterial(json, options);
            }

            var id = json.id || getNextMaterialID();
            var material = new DMAMaterial(json, id);

            if (options.noAdd) return material;//in the new material menu, you may init a material before saving changes

            this.materialsList[id] = material;
            if (!options.silent) myConsole.write("materials.newMaterial(" + JSON.stringify(material.toJSON()) + "}");
            return material;
        },

        newCompositeMaterial: function(json, options){
            options = options || {};
            json = data || {};

            var id = json.id || getNextMaterialID();
            var material = new DMAMaterial(json, id);

            if (options.noAdd) return material;//in the new material menu, you may init a material before saving changes

            this.compositeMaterialsList[id] = material;
            if (!options.silent) myConsole.write("materials.newCompositeMaterial(" + JSON.stringify(material.toJSON()) + "}");
            return material;
        },

        deleteMaterialById: function(id){
            var material = getMaterialForId(id);
            if (!material){
                myConsole.warn("this material was never saved, deleteMaterial operation cancelled");
                return false;
            }
            return this.deleteMaterial(material);
        },

        deleteMaterial: function(material){
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
                this.compositeMaterialsList[id] = null;
                delete this.compositeMaterialsList[id];//todo check if being used first
            } else {
                this.materialsList[id] = null;
                delete this.materialsList[id];//todo check if being used first (instances)
            }
            material.destroy();

            var deleted = true;
            if (deleted) this.setToDefaultMaterial();
            return deleted;
        },

        getMaterialForId: function(id){
            return this.materialsList[id] || this.compositeMaterialsList[id];
        },




        //edit material

        setMaterial: function(id, data){

            var material = this.getMaterialForId(id);
            if (material.isComposite()){
                console.warn("use setCompositeMaterial()");
                return this.setCompositeMaterial(id, data);
            }
            if (!material) return this.newMaterial(data);

            var edited = material.set(data);
            if (edited) myConsole.write("materials.setMaterial(" + id + ", " + JSON.stringify(material.toJSON()) + "}");
            return material;
        },

        setCompositeMaterial: function(id, data){
            var material = this.getMaterialForId(id);
            if (!material) return this.newCompositeMaterial(data);

            var edited = material.set(data);
            if (edited) myConsole.write("materials.setCompositeMaterial(" + id + ", " + JSON.stringify(material.toJSON()) + "}");
            return material;
        },

        updateParentProperties: function(parents){
            //update properties of all composites containing this element
            var allChangedMaterialsList = getAllParentComposites(id);
        },

        upDataParentComposition: function(parents){
            var allChangedMaterialsList = getAllParentComposites(id);
            allChangedMaterialsList.push(id);

            _.each(allChangedMaterialsList, function(key){
//                materialsList[key].compositeChildren = getChildCellTypes(materialsList[key].sparseCells, false);
//                materialsList[key].elementaryChildren = getChildCellTypes(materialsList[key].sparseCells, true);
            });

            lattice.reinitAllCellsOfTypes(allChangedMaterialsList);
        },

        getDeleteMaterial: function(){
            return this.getMaterialForId("deleteMaterial").getThreeMaterial();
        },

        isComposite: function(id){
            var material = this.getMaterialForId(id);
            if (!material) {
                console.warn("no material found with id " + id);
                return false;
            }
            return material.isComposite();
        }


    });




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





    //events





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
});