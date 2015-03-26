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
    return "";
};

TinyGExporter.prototype._setSpeed = function(speed){
    return "F"+ speed + "\n";
};

TinyGExporter.prototype.goHome = function(){
    return "";
};

TinyGExporter.prototype.engageZAxis = function(height){
    console.log("z");
};

TinyGExporter.prototype.simulate = function(line, machine, wcs,  callback){
    if (line == "(get stock)"){
        machine.pickUpStock();
        return callback();
    }
    if (line.substr(0,2) == "({"){
        machine.releaseStock(line.substr(1,line.length-2));
        return callback();
    }
    if (line[0] == "F"){//speed
        this.animationSpeed = line.split("F")[1];
        return callback();
    }
    if (line == "" || line[0] == "(" || line.substr(0,3) != "G01"){
        return callback();
    }
    if (line.substr(0,3) == "G01"){
        return this._simulateGetPosition(line, {xy:this.animationSpeed, z:this.animationSpeed}, machine, wcs, callback);
    } else {
        console.warn("problem parsing gcode: " + line);
        return callback();
    }
};

TinyGExporter.prototype._simulateGetPosition = function(line, speed, machine, wcs, callback){
    var data = line.split(" ");
    var position = {x:"",y:"",z:""};
    if (data.length<2) console.warn("problem parsing gcode " + line);
    for (var i=1;i<data.length;i++){
        var item = data[i];
        if (item[0] == "X") position.x = item.substr(1);
        if (item[0] == "Y") position.y = item.substr(1);
        if (item[0] == "Z") position.z = item.substr(1);
    }
    machine.moveTo(position.x, position.y, position.z, speed, wcs, callback);
};

