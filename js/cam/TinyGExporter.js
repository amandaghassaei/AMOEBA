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

TinyGExporter.prototype.makeHeader = function(){
    return this.goHome();
};

TinyGExporter.prototype._setSpeed = function(speed){
    return "F"+ speed + "\n";
};

TinyGExporter.prototype.goHome = function(){
    return this.addComment("home");
};

TinyGExporter.prototype.engageZAxis = function(type, cellPosition, cell, wcs){
    var data = "";
    if (type == "cell"){
        if (Math.abs(cellPosition.z-wcs.z)<0.001) data += "M3 ";//lower height
        else data += "M4 ";//upper height
        data += this.addComment(JSON.stringify(cell.indices));
    } else if (type == "stock"){
        data += "M8\n";
    } else {
        console.warn("tinyG type not recognized");
        return "";
    }
    data += "G04 P750\n";//pause for 750 ms
    data += "M5\n";
    return data
};

TinyGExporter.prototype.simulate = function(line, machine, wcs,  callback){
    var rapidSpeed = dmaGlobals.assembler.get("rapidSpeeds");
    var rapidHeight = dmaGlobals.assembler.get("rapidHeight");
    if (line == "(home)"){
        machine.moveTo("", "", rapidHeight, rapidSpeed, wcs, callback);
        return;
    } else if (line[0]=="M"){
        if (line[1] == "8"){//get stock
            var stockPosition = dmaGlobals.assembler.get("stockPosition");
            machine.moveTo("", "", stockPosition.z-wcs.z, rapidSpeed, wcs, function(){
                machine.pickUpStock();
                machine.moveTo("", "", rapidHeight, rapidSpeed, wcs, callback);
            });
        } else if (line[1] == "3"){//lower height
            callback();
            return;
        } else if (line[1] == "4"){
            callback();
            return;
        } else if (line[1] == "5") {
            console.log("here");
            callback();
            return;
        }
    } else if (line.substr(0,3) == "G04"){
        callback();
        return;
    }
    GCodeExporter.prototype.simulate.call(this, line, machine, wcs, callback);
};

