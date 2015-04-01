/**
 * Created by aghassaei on 3/26/15.
 */

//M3 M4 spindle direction (z layer bit 0)
//M8 M9  - coolant on/of (z layer bit 1)
//M5 spindle stop (z layer start)


//spin - z axis go
//wait 1s
//direction - z axis height
//coolant - legs up down



function TinyGExporter(){
    GCodeExporter.call(this);
}
TinyGExporter.prototype = Object.create(GCodeExporter.prototype);

TinyGExporter.prototype._setSpeed = function(speed){
    return "F"+ speed + "\n";
};

TinyGExporter.prototype.goHome = function(){
//    var data = this.addComment("home z");
//    data += "M9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.5 \n";data += "G28.2 Z0\n";//home Z
//    data += "G4 P2\n";//pause
    return "";
};

TinyGExporter.prototype.engageZAxis = function(type, cellPosition, cell, wcs){
    var data = "";
    if (type == "cell"){
        if (Math.abs(cellPosition.z-wcs.z)<0.001) data += "M9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM8 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.5 \n";//lower height
        else data += "M9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM8 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM8 \nM3 \nG4 P0.05 \nM5 \nG4 P0.5 \n";//upper height
        data += this.addComment(JSON.stringify(cell.indices));
    } else if (type == "stock"){
        data += "M9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM9 \nM3 \nG4 P0.05 \nM5 \nG4 P0.05 \nM8 \nM3 \nG4 P0.05 \nM5 \nG4 P0.5 \n";
    } else {
        console.warn("tinyG type not recognized");
        return "";
    }
    data += "G28.2 Z0\n";//home Z
    data += "G4 P2\n";//pause
    return data
};

TinyGExporter.prototype.simulate = function(line, machine, wcs,  callback){
    var rapidSpeed = dmaGlobals.assembler.get("rapidSpeeds");
    var rapidHeight = dmaGlobals.assembler.get("rapidHeight");
    if (line == "(home)"){
        return machine.moveTo("", "", rapidHeight, rapidSpeed, wcs, callback);
    } else if (line[0]=="M"){
        if (line == "M3 M5 M4 M5 M3 M5"){//get stock
            var stockPosition = dmaGlobals.assembler.get("stockPosition");
            return this.simulateZ(machine, rapidSpeed, wcs, rapidHeight, stockPosition.z-wcs.z, function(){
                machine.pickUpStock();
            }, callback);
        } else if (line == "M3 M5 M3 M5 M3 M5"){//lower height
            //stupid thing needs to do some math to force to float...
            return this.simulateZ(machine, rapidSpeed, wcs, rapidHeight, wcs.z+0.000001, function(){
                machine.releaseStock(line.substr(4, line.length-5));
            }, callback);
        } else if (line == "M3 M5 M3 M5 M4 M5"){//higher height
            return this.simulateZ(machine, rapidSpeed, wcs, rapidHeight, wcs.z+dmaGlobals.lattice.zScale(), function(){
                machine.releaseStock(line.substr(4, line.length-5));
            }, callback);
        } else if (line.substr(0,3) == "M5 ") return callback();
    } else if (line.substr(0,3) == "G04"){
        return callback();
    }
    GCodeExporter.prototype.simulate.call(this, line, machine, wcs, callback);
};

TinyGExporter.prototype.simulateZ = function(machine, rapidSpeed, wcs, rapidHeight, height, action, callback){
    var feedRate = dmaGlobals.assembler.get("feedRate");
    var safeHeight = dmaGlobals.assembler.get("safeHeight");
    return machine.moveTo("", "", height+safeHeight, rapidSpeed, wcs, function(){
        machine.moveTo("", "", height, feedRate, wcs, function(){
            action();
            machine.moveTo("", "", height+safeHeight, feedRate, wcs, function(){
                machine.moveTo("", "", rapidHeight, rapidSpeed, wcs, callback);
            });
        });
    });
};

