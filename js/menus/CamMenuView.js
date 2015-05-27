/**
 * Created by aghassaei on 1/26/15.
 */


CamMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #saveCam":                               "_save",
        "click #manualSelectOrigin":                    "_selectOrigin"
    },


    initialize: function(){

        _.bindAll(this, "render");
        //bind events
        this.listenTo(globals.cam, "change", this.render);
        this.listenTo(this.model, "change", this.render);
        this.listenTo(globals.lattice, "change", this.render);
    },

    _selectOrigin: function(e){
        e.preventDefault();
        globals.appState.set("manualSelectOrigin", !globals.appState.get("manualSelectOrigin"));
    },

    _save: function(e){
        e.preventDefault();
        globals.cam.save();
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "cam") return;
        if ($("input[type=text]").is(":focus")) return;

        var data = _.extend(this.model.toJSON(), globals.cam.toJSON(), globals.lattice.toJSON(), globals.plist);
        if (globals.cam.get("stockPositionRelative")){
            var relStockPos = {};
            relStockPos.x = data.stockPosition.x - data.originPosition.x;
            relStockPos.y = data.stockPosition.y - data.originPosition.y;
            relStockPos.z = data.stockPosition.z - data.originPosition.z;
            data.stockPosition = relStockPos;
        }
        if (!globals.cam.get("rapidHeightRelative")){
            data.rapidHeight = data.rapidHeight + data.originPosition.z;
        }
        this.$el.html(this.template(data));
    },

    template: _.template('\
        CAM output: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allCamProcesses[machineName][camProcess] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allCamProcesses[machineName]), function(key){ %>\
                        <li><a class="assembler dropdownSelector" data-property="camProcess" data-value="<%= key %>" href="#"><%= allCamProcesses[machineName][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
         <a href="#" id="saveCam" class=" btn btn-block btn-lg btn-default">Process and Save</a><br/>\
         Units: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allUnitTypes[units] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allUnitTypes), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="units" data-value="<%= key %>" href="#"><%= allUnitTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
            Origin (xyz): &nbsp;&nbsp;<input data-property="originPosition" data-key="x" value="<%= originPosition.x %>" placeholder="X" class="form-control floatInput assembler" type="text">\
            &nbsp;<input data-property="originPosition" data-key="y" value="<%= originPosition.y %>" placeholder="Y" class="form-control floatInput assembler" type="text">\
            &nbsp;<input data-property="originPosition" data-key="z" value="<%= originPosition.z %>" placeholder="Z" class="form-control floatInput assembler" type="text">\
            <% if (!(machineName == "handOfGod")){ %>\
            <br/><a id="manualSelectOrigin" class=" btn btn-lg btn-default btn-imageCustom<% if (manualSelectOrigin){ %> btn-selected<% } %>"><img src="assets/imgs/cursor.png"></a>\
            <label>&nbsp;&nbsp;&nbsp;Manually select origin from existing cell</label><br/><br/>\
            Stock (xyz): &nbsp;&nbsp;<input data-property="stockPosition" data-key="x" value="<%= stockPosition.x %>" placeholder="X" class="form-control floatInput assembler" type="text">\
            &nbsp;<input data-property="stockPosition" data-key="y" value="<%= stockPosition.y %>" placeholder="Y" class="form-control floatInput assembler" type="text">\
            &nbsp;<input data-property="stockPosition" data-key="z" value="<%= stockPosition.z %>" placeholder="Z" class="form-control floatInput assembler" type="text"><br/>\
            <label class="checkbox" for="stockPosRel">\
            <input id="stockPosRel" data-property="stockPositionRelative" type="checkbox" <% if (stockPositionRelative){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="assembler custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Stock position relative to Origin</label>\
            <label class="checkbox" for="stockFixed">\
            <input id="stockFixed" data-property="stockFixed" type="checkbox" <% if (stockFixed){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="assembler custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Fix stock relative to to Origin</label>\
            <label class="checkbox" for="multipleStockPositions">\
            <input id="multipleStockPositions" data-property="multipleStockPositions" type="checkbox" <% if (multipleStockPositions){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="assembler custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Multiple stock positions</label>\
            <% if (multipleStockPositions){ %>\
                Stock dimensions (xy): &nbsp;&nbsp;<input data-property="stockArraySize" data-key="x" value="<%= stockArraySize.x %>" placeholder="X" class="form-control intInput assembler" type="text">\
                &nbsp;<input data-property="stockArraySize" data-key="y" value="<%= stockArraySize.y %>" placeholder="Y" class="form-control intInput assembler" type="text"><br/><br/>\
                Stock separation: &nbsp;&nbsp;<input data-property="stockSeparation" value="<%= stockSeparation %>" placeholder="X" class="form-control floatInput assembler" type="text"><br/><br/>\
            <% } %>\
            Clearance Height: &nbsp;&nbsp;<input data-property="rapidHeight" value="<%= rapidHeight %>" placeholder="Z" class="form-control floatInput assembler" type="text"><br/>\
            <label class="checkbox" for="rapidPosRel">\
            <input id="rapidPosRel" data-property="rapidHeightRelative" type="checkbox" <% if (rapidHeightRelative){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="assembler custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Clearance height relative to Origin</label>\
            <% } else { %>\
            <br/><br/>Stock Height: &nbsp;&nbsp;<input data-property="stockPosition" data-key="z" value="<%= stockPosition.z %>" placeholder="Z" class="form-control floatInput assembler" type="text"><br/><br/>\
            <% } %>\
            Approach Height: &nbsp;&nbsp;<input data-property="safeHeight" value="<%= safeHeight %>" placeholder="Z" class="form-control floatInput assembler" type="text"><br/><br/>\
            Speeds (measured in <%= units %> per second):<br/><br/>\
            Rapids (xy, z): &nbsp;&nbsp;<input data-property="rapidSpeeds" data-key="xy" value="<%= rapidSpeeds.xy %>" placeholder="XY" class="form-control floatInput assembler" type="text">\
            &nbsp;<input data-property="rapidSpeeds" data-key="z" value="<%= rapidSpeeds.z %>" placeholder="Z" class="form-control floatInput assembler" type="text"><br/><br/>\
            Feed Rate (xy, z): &nbsp;&nbsp;<input data-property="feedRate" data-key="xy" value="<%= feedRate.xy %>" placeholder="XY" class="form-control floatInput assembler" type="text">\
            &nbsp;<input data-property="feedRate" data-key="z" value="<%= feedRate.z %>" placeholder="Z" class="form-control floatInput assembler" type="text">\
        ')
});


//<% if (machineName == "oneBitBot") {%>Rotate Machine: &nbsp;&nbsp;<a class=" btn btn-lg btn-default btn-machineRotation btn-imageCustom"><img src="assets/imgs/clockwise.png"></a>\
//         &nbsp;&nbsp&nbsp;<a class=" btn btn-lg btn-default btn-machineRotation btn-imageCustom"><img src="assets/imgs/counterClockwise.png"></a><br/><br/><% } %>\