/**
 * Created by aghassaei on 3/10/15.
 */

define(['underscore', 'cam', 'lattice'], function(_, cam, lattice){

    function GCodeExporter() {
        //keep track of speeds for F commands
        this.postSpeed = null;
        this.animationSpeed = null;
    }

    GCodeExporter.prototype.makeHeader = function(settings){
        var data = "";
        if (lattice.get("units") == "inches") data += this.addLine("G20", [], "units inches");
        else data += this.addLine("G21", [], "units mm");
    //    data += this.addLine("G90", [], "absolute positioning");
    //    data += this.addLine("G54", [], "work offset");
    ////    data += this.addLine("G49", [], "cancel tool length comp");
    //    data += this.addLine("G40", [], "cancel tool radius comp");
    ////    data += this.addLine("M09", [], "coolant off");
        data += this.goHome(settings);
        return data;
    };

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
        return "F"+ speed + "\n";
    };

    //GCodeExporter.prototype._rapidXYZ = function(x, y, z){
    //    return this._goXYZ(x,y,z);
    //};

    GCodeExporter.prototype.rapidXY = function(position, settings){
        var data = "";
        if (this.postSpeed != settings.rapidSpeeds.x) data += this._setSpeed(settings.rapidSpeeds.x);
        return data + this._goXYZ(position.x, position.y, null);
    };

    GCodeExporter.prototype.rapidZ = function(z, settings){
        var data = "";
        if (this.postSpeed != settings.rapidSpeeds.z) data += this._setSpeed(settings.rapidSpeeds.z);
        return data + this._goXYZ(null, null, z);
    };

    GCodeExporter.prototype._goXYZ = function(x, y, z){
        if (x !== null) x = "X"+parseFloat(x).toFixed(3);
        if (y !== null) y = "Y"+parseFloat(y).toFixed(3);
        if (z !== null) z = "Z"+parseFloat(z).toFixed(3);
        return this.addLine("G01", [x,y,z]);
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

    GCodeExporter.prototype.goHome = function(settings){
        var data = this._setSpeed(settings.rapidSpeeds.z);
        return data + this._goXYZ(0,0,settings.rapidHeight);
    };

    GCodeExporter.prototype.makeFooter = function(settings){
        var data = "";
        data += this.goHome(settings);
    //    data += this.addLine("M30", [], "program stop");
        return data;
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
            return callback();
        }
        if (line[0] == "F"){//speed
            this.animationSpeed = line.split("F")[1] / settings.scale;
            return callback();
        }
        if (line == "" || line[0] == "(" || line.substr(0,3) != "G01"){
            return callback();
        }
        if (line.substr(0,3) == "G01"){
            return this._simulateG01(line, this.animationSpeed, machine, settings, callback);
        } else {
            console.warn("problem parsing gcode: " + line);
            return callback();
        }
    };

    GCodeExporter.prototype._simulateG01 = function(line, speed, machine, settings, callback){
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
