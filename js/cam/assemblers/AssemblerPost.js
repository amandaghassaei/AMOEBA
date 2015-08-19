/**
 * Created by aghassaei on 8/19/15.
 */



define(['underscore', 'appState', 'lattice', 'cam'], function(_, appState, lattice, cam){


    function AssemblerPost(id, json){

        //settings:
//        feedRate: THREE.Vector3
//        originPosition: THREE.Vector3
//        rapidHeight: 30 - max z height of machine, used when we want to be sure we're clear
//        rapidSpeeds: THREE.Vector3
//        safeHeight: 4.5 - height above parts where we start to move slowly
//        scale: 1.27
//        stockPosition: THREE.Vector3

        this.customFunctionsContext = {
            zClearHeight: 8,//height above part to clear during assembly
            zPreload: 0.2,
            wait: 0.75,//seconds
            blOvershoot: 1.0
        };

        this.customHeader = function(exporter, settings, context){
            var data = "";
            data += exporter.setUnits(lattice.get("units"));
            data += this.customHome(exporter, settings, context);
            return data;
        };

        this.customFooter = function(exporter, settings, context){
            var data = "";
            data += this.customHome(exporter, settings, context);
            return data;
        };

        this.customHome = function(exporter, settings, context){
            var data = "";
            data += exporter.goHome(settings);
            return data;
        };

        this.customPickUpStock = function(exporter, settings, context){//not relevant for your assembler
            var data = "";
            return data;
        };

        this.customChangeZLayer = function(currentIndex, lastIndex, exporter, settings, context){
            var data = "";
            if (lastIndex === null || (currentIndex.z-lastIndex.z)%2 != 0){
                data += exporter.addLine("G0", ["A" + (currentIndex.z%2*0.3125).toFixed(4)], "new layer");
                data += "\n";
            }
            return data;
        };

        this.customMoveXY = function(position, index, exporter, settings, context){
            var data = "";
            data += exporter.rapidXY(position, settings);
            return data;
        };

        this.customPlacePart = function(position, index, material, exporter, settings, context){
            var data = "";
            data += exporter.rapidZ(position.z + settings.safeHeight, settings);
            data += exporter.moveZ(position.z, settings);

            if (material == "brass") data += exporter.addLine("M3");
            else if (material == "fiberGlass") data += exporter.addLine("M4");

            data += exporter.addComment(JSON.stringify(index));

            data += exporter.addLine("G4", ["P" + context.wait]);
            data += exporter.addLine("M5");
            data += exporter.moveZ(position.z, settings);

            data += exporter.moveZ(position.z + settings.safeHeight, settings);
            data += exporter.rapidZ(position.z + context.zClearHeight, settings);
            return data;
        };




    }



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
        var stock = _.find(this.stock, function(thisStock){
            return thisStock.getMaterial() == material
        });
        if (stock === undefined) {
            console.warn("no stock defined of type " + material + " for this assembler");
            return data;
        }
        position.sub(stock.getPosition().multiplyScalar(settings.scale));
        position.sub(settings.originPosition);

        data += this.customMoveXY(position.clone(), index.clone(), exporter, settings, context);

        data += this.customPlacePart(position, index, material, exporter, settings, context);
        return data;
    };


    return AssemblerPost;

});