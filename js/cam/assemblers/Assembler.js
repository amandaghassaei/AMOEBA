/**
 * Created by aghassaei on 5/28/15.
 */

define(['underscore', 'appState', 'lattice', 'stlLoader', 'threeModel', 'cam', 'component', 'stockComponent', 'assemblerPost'],
    function(_, appState, lattice, THREE, three, cam, Component, StockComponent, AssemblerPostMethods){
    
    var assemblerMaterial = new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading, transparent:true, opacity:0.3});
    var stlLoader = new THREE.STLLoader();

    function Assembler(id, json){

        this.id = id;
        this.rotation = json.rotation;
        this.translation = json.translation;
        this.scale = json.scale;
        this.shouldPickUpStock = json.shouldPickUpStock;
        this.relative = json.relative;
        this.camProcesses = json.camProcesses;
        this.numMaterials = json.numMaterials;
        this.name = json.name;


        this.object3D = new THREE.Object3D();
        three.sceneAdd(this.object3D);

        var componentsJSON = json.components;
        this.components = this._buildAssemblerComponents(componentsJSON);
        this._loadSTLs(json, this.components);
        this._configureAssemblerMovementDependencies(componentsJSON, this.components, this.components, this.object3D);

        this.stock = this._buildAssemblerComponents(json.stock, StockComponent);
        this._configureAssemblerMovementDependencies(json.stock, this.components, this.stock, this.object3D);

        this.setVisibility(cam.isVisible());
        three.render();

        AssemblerPostMethods.call(this, id, json);//needed to separate this for now
    }
    Assembler.prototype = Object.create(AssemblerPostMethods.prototype);

    Assembler.prototype.getID = function(){
        return this.id;
    };

    Assembler.prototype._getStlNames = function(json){
        var stls = {};
        _.each(json, function(component, id){
            if (component === undefined || component.stl === undefined || component.stl.filename === undefined){
                console.warn("no stl found for component " + component.name);
            }
            stls[id] = "bin!" + component.stl.filename;
        });
        return stls;
    };

    Assembler.prototype._loadSTLs = function(json, components){
        var stlFilenames = this._getStlNames(json.components);

        function geometryPreProcess(geometry){//todo do this better
            if(geometry === undefined || (geometry.vertices && geometry.vertices.length == 0)) return null;

            if (json.translation) geometry.applyMatrix(new THREE.Matrix4().makeTranslation(json.translation.x, json.translation.y, json.translation.z));
            if (json.rotation) {
                if (json.rotation.x) geometry.applyMatrix(new THREE.Matrix4().makeRotationX(json.rotation.x));
                if (json.rotation.y) geometry.applyMatrix(new THREE.Matrix4().makeRotationY(json.rotation.y));
                if (json.rotation.z) geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(json.rotation.z));
            }
            if (json.scale) geometry.applyMatrix(new THREE.Matrix4().makeScale(json.scale, json.scale, json.scale));

            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-21, -0.63, -1.28));//todo get rid of these
//            geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/2));
            return geometry;
        }

        _.each(stlFilenames, function(filename, id){
            require([filename], function(geo){
                geo = geometryPreProcess(stlLoader.parse(geo));
                if (geo === null) {
                    console.warn("no geometry loaded for " + filename);
                    return;
                }
                components[id].makeGeometry(geo, assemblerMaterial.clone());
            });
        });
    };

    Assembler.prototype._buildAssemblerComponents = function(componentsJSON, Class){
        var components = {};
        if (componentsJSON === undefined ) return components;
        _.each(componentsJSON, function(componentJSON, id){
            if (Class) components[id] = new Class(id, componentJSON);
            else components[id] = new Component(id, componentJSON);
        });
        return components;
    };

    Assembler.prototype._configureAssemblerMovementDependencies = function(json, components, newComponents, object3D){
        if (json === undefined) return;
        var self = this;
        _.each(json, function(componentJSON, id){
            if (componentJSON.parent) components[componentJSON.parent].addChild(newComponents[id]);
            else self.addChild(newComponents[id], object3D);
        });
    };

    Assembler.prototype.addChild = function(child, object3D){
        child._addParent(this, null);
        if (object3D === undefined) object3D = this.object3D;
        object3D.add(child.getObject3D());
    };

    Assembler.prototype._removeChild = function(child){
        if (this.object3D.children.indexOf(child.object3D) == -1){
            console.warn("not a child");
            return;
        }
        this.object3D.remove(child.getObject3D());
    };

    Assembler.prototype.newComponent = function(){
        var component = new Component(null, {});
        var id = component.getID();
        this.components[id] = component;
        this.addChild(component);
        this.buildComponentTree();
        return id;
    };

    Assembler.prototype.checkAncestry = function(){
        return false;
    };

    Assembler.prototype.setVisibility = function(visible){
        this.object3D.visible = visible;
        this._setTranslucent();
        three.render();
    };

    Assembler.prototype.highlight = function(componentId){
        if (this.components[componentId]) this.components[componentId].setTranslucent(false);
        else if (this.stock[componentId]) this.stock[componentId].show();
    };
    
    Assembler.prototype._setTranslucent = function(){
        var currentTab = appState.get("currentTab");
        var translucent = currentTab == "cam" || currentTab == "assemblerSetup";
        if (currentTab == "editComponent") return;
        _.each(this.components, function(component){
            component.setTranslucent(translucent);
        });
        this.hideStock();
    };

    Assembler.prototype.getComponent = function(id){
        return this.components[id] || this.stock[id];
    };

    Assembler.prototype.buildComponentTree = function(){
        var tree = this._recursiveTreeBuilding(0, null, {});
        this.tree = tree;
    };

    Assembler.prototype._recursiveTreeBuilding = function(index, parent, tree){
        var self = this;
        _.each(this.stock, function(thisStock, key){
            if (thisStock.parent == parent) {
                tree[key] = index;
            }
        });
        _.each(this.components, function(component, key){
            if (component.parent == parent) {
                tree[key] = index;
                self._recursiveTreeBuilding(index+1, key, tree);
            }
        });
        return tree;
    };
    

    
    
    //animation methods

    Assembler.prototype.moveMachine = function(origin){//origin selection
        this.object3D.position.set(origin.x, origin.y, origin.z);
        three.render();
    };
    
    Assembler.prototype.updateCellMode = function(){//message from cam
        _.each(this.stock, function(stock){
            stock.setMode();
        });
    };

    Assembler.prototype.updatePartType = function(){//message from cam
        _.each(this.stock, function(stock){
            stock.updatePartType();
        });
    };

    Assembler.prototype.hideStock = function(){
        _.each(this.stock, function(stock){
            stock.hide();
        });
    };
    
    Assembler.prototype.pickUpStock = function(index, speed, settings, callback){
        _.each(this.stock, function(stock){
            stock.show();
        });
        if (index.z%2 != 0) {//rotate on odd rows
            this.components.substrate.rotateTo(new THREE.Vector3(0, 0, Math.PI/2), speed, callback);
            return;
        }
        this.components.substrate.rotateTo(new THREE.Vector3(0, 0, 0), speed, callback);
    };

    Assembler.prototype.rotateTo = function(index, speed, settings, callback){
        this.components.substrate.rotateTo(new THREE.Vector3(0, 0, Math.PI/2), speed, callback);
    };
    
    Assembler.prototype.releaseStock = function(index, settings){
        lattice.showCellAtIndex(index);
        this.hideStock();
    };
    
    Assembler.prototype.pause = function(){
    };
    
    Assembler.prototype.moveTo = function(position, speed, settings, callback){

        var totalThreads = 3;
        function sketchyCallback(){
            totalThreads -= 1;
            if (totalThreads > 0) return;
            callback();
        }

        console.log(position);
        var startingPos = this.components.xAxis.getPosition().add(this.components.yAxis.getPosition().add(this.components.zAxis.getPosition()));//this.components.zAxis.getAbsolutePosition();//get position of end effector
        speed = this._normalizeSpeed(startingPos, position, new THREE.Vector3(speed, speed, speed));//todo fix this

        this.components.xAxis.moveTo(position, speed.x, sketchyCallback);
        this.components.yAxis.moveTo(position, speed.y, sketchyCallback);
        this.components.zAxis.moveTo(position, speed.z, sketchyCallback);
    };
    
    Assembler.prototype._normalizeSpeed = function(startingPos, position, speed){//todo make this more general
        if (position.x === null && position.y === null) return speed;
        var deltaX = position.x-startingPos.x;
        var deltaY = position.y-startingPos.y;
        var totalDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        if (totalDistance == 0) return speed;
        speed.x = Math.abs(deltaX/totalDistance*speed.x);
        speed.y = Math.abs(deltaY/totalDistance*speed.y);
        return speed;
    };
    
    Assembler.prototype._makeAxisVector = function(position, axis){
        if (position[axis] == null) return null;
        var vector = new THREE.Vector3(0,0,0);
        vector[axis] = position[axis];
        return vector;
    };
    
    




    
    //helper
    
    Assembler.prototype.destroy = function(){
        var self = this;
        _.each(this.components, function(component, index){
            component.destroy();
            self.components[index] = null;
        });
        _.each(this.stock, function(thisStock, index){
            thisStock.destroy();
            self.stock[index] = null;
        });
        this.components = null;
        this.stock = null;
        three.sceneRemove(this.object3D);
        this.stock = null;
        this.components.zAxis = null;
        this.components.xAxis = null;
        this.components.yAxis = null;
        this.frame = null;
        this.substrate = null;
        this.object3D = null;
    };

    Assembler.prototype.saveJSON = function(){
        var json = this.toJSON();
        json.lattice = {
            scale: lattice.get("scale"),
            units: lattice.get("units")
        };
        json.defaults = {
            camStrategy: cam.get("camStrategy"),
            placementOrder: cam.get("placementOrder"),
            camProcess: cam.get("camProcess"),
            rapidHeight: cam.get("rapidHeight"),
            rapidHeightRelative: cam.get("rapidHeightRelative"),
            safeHeight: cam.get("safeHeight"),
            originPosition: cam.get("originPosition"),
            rapidSpeeds: cam.get("rapidSpeeds"),
            feedRate: cam.get("feedRate")
        };
        return {assembler: json};
    };

    Assembler.prototype.toJSON = function(){
        var componentsJSON = {};
        _.each(this.components, function(component, id){
            componentsJSON[id] = component.toJSON();
        });
        var stockJSON = {};
        _.each(this.stock, function(thisStock, id){
            stockJSON[id] = thisStock.toJSON();
        });
        var json = this.basicJSON();
        _.extend(json, {
            components: componentsJSON,
            stock: stockJSON,
            tree: this.tree || this.buildComponentTree()
        });
        return json;
    };

    Assembler.prototype.basicJSON = function(){
        return {
            name: this.name,
            translation: this.translation,
            scale: this.scale,
            rotation: this.rotation,
            shouldPickUpStock: this.shouldPickUpStock,
            relative: this.relative,
            camProcesses: this.camProcesses,
            numMaterials: this.numMaterials,
        }
    };



    return Assembler;
});
