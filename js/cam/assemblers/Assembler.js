/**
 * Created by aghassaei on 5/28/15.
 */

define(['underscore', 'appState', 'lattice', 'stlLoader', 'threeModel', 'cam', 'component', 'stockComponent'],
    function(_, appState, lattice, THREE, three, cam, Component, StockComponent){
    
    var assemblerMaterial = new THREE.MeshLambertMaterial({color:0xaaaaaa, shading: THREE.FlatShading, transparent:true, opacity:0.5});
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
    }

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

            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-21, -0.63, 0));
            return geometry;
        }

        _.each(stlFilenames, function(filename, id){
            require([filename], function(geo){
                geo = geometryPreProcess(stlLoader.parse(geo));
                if (geo === null) {
                    console.warn("no geometry loaded for " + filename);
                    return;
                }
                components[id].makeGeometry(geo, assemblerMaterial);
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
        _.each(json, function(componentJSON, id){
            if (componentJSON.parent) components[componentJSON.parent].addChild(newComponents[id]);
            else object3D.add(newComponents[id].getObject3D());
        });
    };



    

    
    Assembler.prototype.setVisibility = function(visible){
        this.object3D.visible = visible;
        this._setTranslucent();
        three.render();
    };
    
    Assembler.prototype._setTranslucent = function(){
        assemblerMaterial.transparent = (appState.get("currentTab") == "cam" || appState.get("currentTab") == "assemblerSetup");
    };

    Assembler.prototype.moveMachine = function(origin){//origin selection
        this.object3D.position.set(origin.x, origin.y, origin.z);
        three.render();
    };
    
    
    
    
    
    Assembler.prototype.postProcess = function(settings, exporter){//override in subclasses
        var data = "";
        var self = this;
    
        lattice.rasterCells(cam._getOrder(cam.get("camStrategy")), function(cell){
            if (!cell) return;
            var cellPosition = cell.getAbsolutePosition().multiplyScalar(settings.scale);
            var cellIndex = cell.getAbsoluteIndex();

            if (!self.shouldPickUpStock){
                data += self._postGetStock(cellIndex, cellPosition, settings, exporter);
            } else {
//                var thisStockPosition = _.clone(stockPosition);
//                if (multStockPositions) {
//                    thisStockPosition.x += stockNum % stockArraySize.y * stockSeparation;
//                    thisStockPosition.y -= Math.floor(stockNum / stockArraySize.y) * stockSeparation;
//                    stockNum += 1;
//                    if (stockNum >= stockArraySize.x * stockArraySize.y) stockNum = 0;
//                }
//                data += self._postMoveXY(exporter, stockPosition.x-wcs.x, stockPosition.y-wcs.y);
//                data += self._postMoveToStock(exporter, thisStockPosition, rapidHeight, wcs, safeHeight);
            }
            data += self._postMoveXY(cellPosition.x-settings.originPosition.x, cellPosition.y-settings.originPosition.y, settings, exporter);
            data += self._postReleaseStock(cellPosition, cell, settings, exporter);
            data += "\n";
        });
        return data;
    };
    
    Assembler.prototype._postMoveXY = function(x, y, settings, exporter){
        return exporter.rapidXY(x, y, settings);
    };
    
//    Assembler.prototype._postMoveToStock = function(exporter, stockPosition, rapidHeight, wcs, safeHeight){
//        var data = "";
//        data += exporter.rapidZ(stockPosition.z-wcs.z+safeHeight);
//        data += exporter.moveZ(stockPosition.z-wcs.z);
//        data += this._postGetStock(exporter);
//        data += exporter.moveZ(stockPosition.z-wcs.z+safeHeight);
//        data += exporter.rapidZ(rapidHeight);
//        return data;
//    };
    
    Assembler.prototype._postGetStock = function(index, position, settings, exporter){
        return exporter.addComment("get stock");
    };
    
    Assembler.prototype._postReleaseStock = function(cellPosition, cell, settings, exporter){
        var data = "";
        data += exporter.rapidZ(cellPosition.z-settings.originPosition.z+settings.safeHeight, settings);
        data += exporter.moveZ(cellPosition.z-settings.originPosition.z, settings);
        data += exporter.addComment(JSON.stringify(cell.getAbsoluteIndex()));
        data += exporter.moveZ(cellPosition.z-settings.originPosition.z+settings.safeHeight, settings);
        data += exporter.rapidZ(settings.rapidHeight, settings);
        return data;
    };
    
    
    
    
    //animation methods
    
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
    
    Assembler.prototype.pickUpStock = function(){
        _.each(this.stock, function(stock){
            stock.show();
        });
    };
    
    Assembler.prototype.releaseStock = function(index){
        console.log(index);
        lattice.showCellAtIndex(JSON.parse(index));
        _.each(this.stock, function(stock){
            stock.hide();
        });
    };
    
    Assembler.prototype.pause = function(){
    };
    
    Assembler.prototype.moveTo = function(x, y, z, speed, wcs, callback){
        x = this._makeAbsPosition(x, wcs.x);
        y = this._makeAbsPosition(y, wcs.y);
        z = this._makeAbsPosition(z, wcs.z);
        this._moveTo(x, y, z, speed, wcs, callback);
    };
    
    Assembler.prototype._moveTo = function(x, y, z, speed, wcs, callback){
        var totalThreads = 3;
        function sketchyCallback(){
            totalThreads -= 1;
            if (totalThreads > 0) return;
            callback();
        }
        var startingPos = {x:this.components.xAxis.getPosition().x, y:this.components.yAxis.getPosition().y, z:this.components.zAxis.getPosition().z};
        speed = this._normalizeSpeed(startingPos, x, y, this._reorganizeSpeed(speed));
        this.components.xAxis.moveTo(this._makeAxisVector(x, "x"), speed.x, sketchyCallback);
        this.components.yAxis.moveTo(this._makeAxisVector(y, "y"), speed.y, sketchyCallback);
        this.components.zAxis.moveTo(this._makeAxisVector(z, "z"), speed.z, sketchyCallback);
    };
    
    Assembler.prototype._makeAbsPosition = function(target, wcs){
        if (target == "" || target == null || target === undefined) return null;
        return parseFloat(target)+wcs;
    };
    
    Assembler.prototype._reorganizeSpeed = function(speed){
        var newSpeed = {};
        newSpeed.x = speed.xy;
        newSpeed.y = speed.xy;
        newSpeed.z = speed.z;
        return newSpeed;
    };
    
    Assembler.prototype._normalizeSpeed = function(startingPos, x, y, speed){//xy moves need speed normalization
        var normSpeed = {};
        if (x == "" || y == "" || x === null || y === null) return speed;
        var deltaX = x-startingPos.x;
        var deltaY = y-startingPos.y;
        var totalDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        if (totalDistance == 0) return speed;
        normSpeed.x = Math.abs(deltaX/totalDistance*speed.x);
        normSpeed.y = Math.abs(deltaY/totalDistance*speed.y);
        normSpeed.z = speed.z;
        return normSpeed;
    };
    
    Assembler.prototype._makeAxisVector = function(position, axis){
        switch (axis){
            case "x":
                return {x:position, y:0, z:0};
            case "y":
                return {x:0, y:position, z:0};
            case "z":
                return {x:0, y:0, z:position};
            default:
                console.warn(axis + " axis not recognized");
                return null;
        }
    };
    
    
    
    
    //helper
    
    Assembler.prototype.destroy = function(){
        var self = this;
        _.each(this.components, function(component, index){
            component.destroy();
            self[index] = null;
        });
        this.components = null;
        three.sceneRemove(this.object3D);
        this.stock = null;
        this.components.zAxis = null;
        this.components.xAxis = null;
        this.components.yAxis = null;
        this.frame = null;
        this.substrate = null;
        this.object3D = null;
    };

    Assembler.prototype.toJSON = function(){
        var componentsJSON = {};
        _.each(this.components, function(component, id){
            componentsJSON[id] = component.toJSON();
        });
        return {
            components: componentsJSON,
            translation: this.translation,
            scale: this.scale,
            rotation: this.rotation,
            shouldPickUpStock: this.shouldPickUpStock,
            relative: this.relative,
            camProcesses: this.camProcesses,
            numMaterials: this.numMaterials
        }
    };



    return Assembler;
});
