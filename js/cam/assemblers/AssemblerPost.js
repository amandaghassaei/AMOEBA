/**
 * Created by aghassaei on 8/19/15.
 */



define(['underscore', 'appState', 'lattice', 'cam'], function(_, appState, lattice, cam){


    function AssemblerPost(id, json){

        //what's in "settings"?

//        feedRate: THREE.Vector3 - slow speeds, exporter.move commands use this speed
//        originPosition: THREE.Vector3 - you won't need this
//        rapidHeight: 30 - max z height of machine, used when we want to be sure we're clear
//        rapidSpeeds: THREE.Vector3 - fast speeds, exporter.rapid use this speed
//        safeHeight: 4.5 - height above parts where we start to move slowly
//        scale: 1.27 - all positions and speeds are already scaled for you to mm
//        stockPosition: THREE.Vector3 - not used for your machine
//        units: mm

        this.customFunctionsContext = json.customPost.customFunctionsContext || {
            zClearHeight: 8,//height above part to clear during assembly
            zPreload: 0.2,
            stockWait: 0.75,//seconds
            blOvershoot: 1.0
        };

        this.customHeader = function(exporter, settings, context){
    var data = "";
    data += exporter.setUnits(settings.units);
    data += this.customHome(exporter, settings, context);
    return data;
};
        this._loadFunction(json.customPost, "customHeader");

        this.customFooter = function(exporter, settings, context){
    var data = "";
    data += this.customHome(exporter, settings, context);
    return data;
};

        this._loadFunction(json.customPost, "customFooter");

        this.customHome = function(exporter, settings, context){
    var data = "";
    data += exporter.goHome(settings);
    return data;
};

        this._loadFunction(json.customPost, "customHome");

        this.customPickUpStock = function(exporter, settings, context){//not relevant for your assembler
    var data = "";
    return data;
};

        this._loadFunction(json.customPost, "customPickUpStock");

        this.customChangeZLayer = function(currentIndex, lastIndex, exporter, settings, context){
    var data = "";
    if (lastIndex === null || (currentIndex.z-lastIndex.z)%2 != 0){
        data += exporter.addLine("G0", ["A" + (currentIndex.z%2*0.3125).toFixed(4)], "new layer");
        data += "\n";
    }
    return data;
};

        this._loadFunction(json.customPost, "customChangeZLayer");

        this.customMoveXY = function(position, lastPosition, index, exporter, settings, context){//already offset for dual heads
    var data = "";

    var overshoot = false;
    var overshootPosition = position.clone();

    //always approach from +x +y direction
    if (lastPosition.x < position.x){
        overshoot = true;
        overshootPosition.x += context.blOvershoot;
    }

    if (lastPosition.y < position.y){
        overshoot = true;
        overshootPosition.y += context.blOvershoot;
    }

    if (overshoot) data += exporter.rapidXY(overshootPosition, settings);
    data += exporter.rapidXY(position, settings);

    return data;
};

        this._loadFunction(json.customPost, "customMoveXY");

        this.customPlacePart = function(position, index, material, exporter, settings, context){//already offset for dual heads
    var data = "";
    data += exporter.rapidZ(position.z + settings.safeHeight, settings);
    data += exporter.moveZ(position.z - context.zPreload, settings);

    if (material == "brass") data += exporter.addLine("M3");
    else if (material == "fiberGlass") data += exporter.addLine("M4");


    data += exporter.addLine("G4", ["P" + context.stockWait]);
    data += exporter.addLine("M5");
    data += exporter.addComment(JSON.stringify(index));//leave this, tells sim to show cell

    data += exporter.moveZ(position.z - context.zPreload, settings);//need this line?

    data += exporter.moveZ(position.z + settings.safeHeight, settings);
    data += exporter.rapidZ(position.z + context.zClearHeight, settings);
    return data;
};

        this._loadFunction(json.customPost, "customPlacePart");

        this.customCalcPositionOffsets = function(index, position, material, settings, context){
    //this feeds into moveXY and placePart functions

    position.sub(settings.originPosition);

    if (index.z%2 != 0){
        //offset for rotation
        var offset = this.components.substrate.centerOfRotation.clone().multiplyScalar(settings.scale);//offset in mm
        var dist = position.clone().sub(offset);
        position = offset.add(new THREE.Vector3(dist.y, -dist.x, position.z));
    }

    var stock = _.find(this.stock, function(thisStock){
        return thisStock.getMaterial() == material
    });
    if (stock === undefined) {
        console.warn("no stock defined of type " + material + " for this assembler");
        return null;
    }


    position.sub(stock.getPosition().multiplyScalar(settings.scale));

    return position;
}

        this._loadFunction(json.customPost, "customCalcPositionOffsets");
    }









    AssemblerPost.prototype._loadFunction = function(json, name){
        if (json[name] === undefined) return;
        var js = "js = " + json[name];
        try{
            eval(js);
            this[name] = js;
        } catch(error){
            console.log(error.message);
        }
    };



    //post process

    AssemblerPost.prototype.postProcess = function(settings, exporter){//called from outside);

        var data = "";
        data += this.customHeader(exporter, settings, this.customFunctionsContext);

        data += exporter.newLine();
        data += exporter.newLine();

        data += exporter.addComment("begin program");

        data += exporter.newLine();

        data += this._postProcessCells(exporter, settings, this.customFunctionsContext);

        data += exporter.newLine();
        data += exporter.newLine();

        data += exporter.addComment("end program");

        data += exporter.newLine();

        data += this.customFooter(exporter, settings, this.customFunctionsContext);

        return data;
    };

    AssemblerPost.prototype._postProcessCells = function(exporter, settings, context){
        var data = "";
        var self = this;
        var lastIndex = null;

        lattice.rasterCells(cam._getOrder(cam.get("camStrategy")), function(cell){
            if (!cell) return;

            var cellPosition = cell.getAbsolutePosition().multiplyScalar(settings.scale);
            var cellIndex = cell.getAbsoluteIndex();

            if (!self.shouldPickUpStock){
                data += self._postGetStock(cellIndex, lastIndex, cellPosition, cell.materialName, settings, exporter, context);
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
            data += self._postReleaseStock(cellIndex, cellPosition, cell.materialName, settings, exporter, context);
            data += "\n";
            lastIndex = cellIndex.clone();
        });

        return data;
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

    AssemblerPost.prototype._postGetStock = function(index, lastIndex, position, material, settings, exporter, context){
        var data = "";
        if (lastIndex === null || lastIndex.z != index.z){
            data += this.customChangeZLayer(index, lastIndex, exporter, settings, context)
        }
        data += exporter.addComment("get stock " + JSON.stringify(index));
        return data;
    };

    AssemblerPost.prototype._postReleaseStock = function(index, position, material, settings, exporter, context){
        var data = "";


//        position.add(new THREE.Vector3(18.23*((index.z)%2), 0.3*((index.z)%2), 0));
        var position = this.customCalcPositionOffsets(index, position, material, settings, context);
        if (position === null) return data;


//        (5.08mm, 5.715mm)
//        x = part_pos[0]*1.27 + 18.23*((layer+1)%2)
//		y = part_pos[1]*1.27 + 0.3*((layer+1)%2)

        data += this.customMoveXY(position.clone(), exporter.getPostPosition(), index.clone(), exporter, settings, context);

        data += this.customPlacePart(position.clone(), index.clone(), material, exporter, settings, context);
        return data;
    };


    return AssemblerPost;

});


//don't delete
//         this.customHeader = function(exporter, settings, context){
//            var data = "";
//            data += exporter.setUnits(lattice.get("units"));
//            data += this.customHome(exporter, settings, context);
//            return data;
//        };
//
//        this.customFooter = function(exporter, settings, context){
//            var data = "";
//            data += this.customHome(exporter, settings, context);
//            return data;
//        };
//
//        this.customHome = function(exporter, settings, context){
//            var data = "";
//            data += exporter.goHome(settings);
//            return data;
//        };
//
//        this.customPickUpStock = function(exporter, settings, context){//not relevant for your assembler
//            var data = "";
//            return data;
//        };
//
//        this.customChangeZLayer = function(currentIndex, lastIndex, exporter, settings, context){
//            var data = "";
//            if (lastIndex === null || (currentIndex.z-lastIndex.z)%2 != 0){
//                data += exporter.addLine("G0", ["A" + (currentIndex.z%2*0.3125).toFixed(4)], "new layer");
//                data += "\n";
//            }
//            return data;
//        };
//
//        this.customMoveXY = function(position, index, exporter, settings, context){//already offset for dual heads
//            var data = "";
//            data += exporter.rapidXY(position, settings);
//            return data;
//        };
//
//        this.customPlacePart = function(position, index, material, exporter, settings, context){//already offset for dual heads
//            var data = "";
//            data += exporter.rapidZ(position.z + settings.safeHeight, settings);
//            data += exporter.moveZ(position.z - context.zPreload, settings);
//
//            if (material == "brass") data += exporter.addLine("M3");
//            else if (material == "fiberGlass") data += exporter.addLine("M4");
//
//            data += exporter.addComment(JSON.stringify(index));
//
//            data += exporter.addLine("G4", ["P" + context.stockWait]);
//            data += exporter.addLine("M5");
//            data += exporter.moveZ(position.z - context.zPreload, settings);//need this line?
//
//            data += exporter.moveZ(position.z + settings.safeHeight, settings);
//            data += exporter.rapidZ(position.z + context.zClearHeight, settings);
//            return data;
//        };