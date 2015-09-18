/**
 * Created by aghassaei on 3/10/15.
 */

define(['underscore', 'cam', 'lattice', 'three'], function(_, cam, lattice, THREE){

    function GCodeExporter() {
        //keep track of speeds for F commands
        this.postSpeed = null;
        this.postPosition = new THREE.Vector3(0,0,0);
        this.animationSpeed = null;
    }

    GCodeExporter.prototype.addLine = function(command, params, comment){
        var data = "";
        data += command + " ";
        _.each(params, function(param){
            if (!param) return;
            data += param + " ";
        });
        if (comment) data += "(" + comment + ")";
        data += "\n";
        return data;
    };

    GCodeExporter.prototype.addComment = function(comment){
        return "(" + comment + ")" + "\n";
    };

    GCodeExporter.prototype._setSpeed = function(speed){
        this.postSpeed = speed;
        return "F"+ speed + "\n";
    };

    GCodeExporter.prototype.setUnits = function(units){
        if (units == "inches") return this.addLine("G20", [], "units inches");
        else if (units == "mm") return this.addLine("G21", [], "units mm");
        console.warn("units " + units + " not recognized");
        return "";
    };

    GCodeExporter.prototype.newLine = function(){
        return "\n";
    };

    //GCodeExporter.prototype._rapidXYZ = function(x, y, z){
    //    return this._goXYZ(x,y,z);
    //};

    GCodeExporter.prototype.rapidXY = function(position, settings){
        var data = "";
        if (this.postSpeed != settings.rapidSpeeds.x) data += this._setSpeed(settings.rapidSpeeds.x);
        return data + this._rapidXYZ(position.x, position.y, null);
    };

    GCodeExporter.prototype.rapidZ = function(z, settings){
        var data = "";
        if (this.postSpeed != settings.rapidSpeeds.z) data += this._setSpeed(settings.rapidSpeeds.z);
        return data + this._rapidXYZ(null, null, z);
    };

    GCodeExporter.prototype.moveXY = function(x, y, settings){
        var data = "";
        if (this.postSpeed != settings.feedRate.x) data += this._setSpeed(settings.feedRate.x);
        return data + this._goXYZ(x, y, null);
    };

    GCodeExporter.prototype.moveZ = function(z, settings){
        var data = "";
        if (this.postSpeed != settings.feedRate.z) data += this._setSpeed(settings.feedRate.z);
        return data + this._goXYZ(null, null, z);
    };

    GCodeExporter.prototype._goXYZ = function(x, y, z, command){
        if (x !== null) {
            this.postPosition.x = x;
            x = "X"+parseFloat(x).toFixed(3);
        }
        if (y !== null) {
            this.postPosition.y = y;
            y = "Y"+parseFloat(y).toFixed(3);
        }
        if (z !== null) {
            this.postPosition.z = z;
            z = "Z"+parseFloat(z).toFixed(3);
        }
        if (command) return this.addLine(command, [x,y,z]);
        return this.addLine("G1", [x,y,z]);
    };

    GCodeExporter.prototype._rapidXYZ = function(x, y, z){
        return this._goXYZ(x, y, z, "G0");
    };

    GCodeExporter.prototype.goHome = function(settings){
        var data = this.rapidZ(settings.rapidHeight, settings);
        return data + this.rapidXY({x:0, y:0}, settings);
    };

    GCodeExporter.prototype.getPostPosition = function(){
        return this.postPosition.clone();
    };








    GCodeExporter.prototype.save = function(data){
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "GCodeExport" + ".nc");
    };

    GCodeExporter.prototype.simulate = function(line, machine, settings,  callback){
        if (line.substr(0,10) == "(get stock"){
            var json = line.substr(11,line.length-12);
            json = JSON.parse(json);
            return machine.pickUpStock(json, this.animationSpeed, settings, callback);
        }
        if (line.substr(0,2) == "({"){
            var json = line.substr(1,line.length-2);
            json = JSON.parse(json);
            machine.releaseStock(json, settings);
            if (callback) callback();
            return;
        }
        if (line[0] == "F"){//speed
            this.animationSpeed = line.split("F")[1] / settings.scale;
            if (callback) callback();
            return;
        }
        if (line == "" || line[0] == "(" || !this._isMoveCommand(line)){
            if (callback) callback();
            return;
        }
        if (this._isMoveCommand(line)){
            return this._simulateMove(line, this.animationSpeed, machine, settings, callback);
        } else {
            console.warn("problem parsing gcode: " + line);
            if (callback) callback();
            return;
        }
    };

    GCodeExporter.prototype._isMoveCommand = function(line){
        return line.substr(0,2) == "G1" || line.substr(0,2) == "G0" || line.substr(0,3) == "G01";
    };

    GCodeExporter.prototype._simulateMove = function(line, speed, machine, settings, callback){
        var data = line.split(" ");
        var position = {x:null,y:null,z:null};
        if (data.length<2) {
            console.warn("problem parsing gcode " + line);
            return callback();
        }
        for (var i=1;i<data.length;i++){
            var item = data[i];
            if (item[0] == "X") position.x = parseFloat(item.substr(1)) / settings.scale;
            if (item[0] == "Y") position.y = parseFloat(item.substr(1)) / settings.scale;
            if (item[0] == "Z") position.z = parseFloat(item.substr(1)) / settings.scale;
        }
        machine.moveTo(position, speed, settings, callback);
    };

    return GCodeExporter;
});
