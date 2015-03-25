/**
 * Created by aghassaei on 1/26/15.
 */


CamMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click .camProcess":                            "_selectCamProcess",
        "click .units":                                 "_changeUnits",
        "click #saveCam":                               "_save",
        "change input:checkbox":                        "_clickCheckbox",
        "focusout .numberInput":                        "render",
        "click #manualSelectOrigin":                    "_selectOrigin"
    },


    initialize: function(options){

        this.lattice = options.lattice;
        this.assembler = options.assembler;

        _.bindAll(this, "render", "_onKeyup");
        //bind events
        this.listenTo(this.assembler, "change", this.render);
        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.lattice, "change:units", this.render);
        $(document).bind('keyup', {}, this._onKeyup);
    },

    _selectCamProcess: function(e){
        e.preventDefault();
        this.assembler.set("camProcess", $(e.target).data("type"));
    },

    _changeUnits: function(e){
        e.preventDefault();
        this.lattice.set("units", $(e.target).data("type"));
    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "cam") return;

        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this.render();
            return;
        }

        if ($(".wcs").is(":focus")) this._updateNumber(e, "originPosition");
        else if ($(".stockPosition").is(":focus")){
            if (!this.assembler.get("stockPositionRelative")) this._updateNumber(e, "stockPosition");
            else this._updateRelativeStockPosition(e);
        }
        else if ($(".rapidSpeeds").is(":focus")) this._updateNumber(e, "rapidSpeeds");
        else if ($(".feedRate").is(":focus")) this._updateNumber(e, "feedRate");
        else if ($(".safeHeight").is(":focus")) this._updateNumber(e, "safeHeight");
        else if ($(".rapidHeight").is(":focus")) {
            if (this.assembler.get("rapidHeightRelative")) this._updateNumber(e, "rapidHeight");
            else this._updateAbsoluteRapidHeight(e)
        }
        else if ($(".stockArraySize").is(":focus")) this._updateNumber(e, "stockArraySize");
        else if ($(".stockSeparation").is(":focus")) this._updateNumber(e, "stockSeparation");
    },

    _updateNumber: function(e, property){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseFloat(newVal.toFixed(4));
        var object = this.assembler.get(property);
        if ($(e.target).data("type")) {
            object[$(e.target).data("type")] = newVal;
            this.assembler.trigger("change:" + property);
            this.assembler.trigger("change");
        }
        else this.assembler.set(property, newVal);
    },

    _updatePosNumber: function(e, property){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal = parseFloat(newVal.toFixed(4));
        if (newVal <= 0) {
            console.warn("value must be positive");
            return;
        }
        var object = this.assembler.get(property);
        if ($(e.target).data("type")) {
            object[$(e.target).data("type")] = newVal;
            this.assembler.trigger("change:" + property);
            this.assembler.trigger("change");
        }
        else this.assembler.set(property, newVal);
    },

    _updateRelativeStockPosition: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        var dim = $(e.target).data("type");
        newVal = (newVal + this.assembler.get("originPosition")[dim]).toFixed(4);
        this.assembler.get("stockPosition")[dim] = parseFloat(newVal);
        this.assembler.trigger("change:stockPosition");
        this.assembler.trigger("change");
    },

    _updateAbsoluteRapidHeight: function(e){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        newVal -= this.assembler.get("originPosition").z.toFixed(4);//always store relative to origin
        this.assembler.set("rapidHeight", parseFloat(newVal));
    },

    _clickCheckbox: function(e){
        e.preventDefault();
        var $object = $(e.target);
        $object.blur();
        var property = $object.data("property");
        dmaGlobals.assembler.set(property, !dmaGlobals.assembler.get(property));
    },

    _selectOrigin: function(e){
        e.preventDefault();
        dmaGlobals.appState.set("manualSelectOrigin", !dmaGlobals.appState.get("manualSelectOrigin"));
    },

    _save: function(e){
        e.preventDefault();
        this.assembler.save();
    },

    render: function(){
        if (this.model.get("currentTab") != "cam") return;
        if ($("input").is(":focus")) return;
        var data = _.extend(this.model.toJSON(), this.assembler.toJSON(), this.lattice.toJSON());
        if (this.assembler.get("stockPositionRelative")){
            var relStockPos = {};
            relStockPos.x = data.stockPosition.x - data.originPosition.x;
            relStockPos.y = data.stockPosition.y - data.originPosition.y;
            relStockPos.z = data.stockPosition.z - data.originPosition.z;
            data.stockPosition = relStockPos;
        }
        if (!this.assembler.get("rapidHeightRelative")){
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
                        <li><a class="camProcess" data-type="<%= key %>" href="#"><%= allCamProcesses[machineName][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
         <a href="#" id="saveCam" class=" btn btn-block btn-lg btn-default">Process and Save</a><br/>\
         <% if (machineName == "oneBitBot") {%>Rotate Machine: &nbsp;&nbsp;<a class=" btn btn-lg btn-default btn-machineRotation btn-imageCustom"><img src="assets/imgs/clockwise.png"></a>\
         &nbsp;&nbsp&nbsp;<a class=" btn btn-lg btn-default btn-machineRotation btn-imageCustom"><img src="assets/imgs/counterClockwise.png"></a><br/><br/><% } %>\
         Units: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allUnitTypes[units] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allUnitTypes), function(key){ %>\
                        <li><a class="units" data-type="<%= key %>" href="#"><%= allUnitTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
            Origin (xyz): &nbsp;&nbsp;<input data-type="x" value="<%= originPosition.x.toFixed(4) %>" placeholder="X" class="form-control numberInput wcs" type="text">\
            &nbsp;<input data-type="y" value="<%= originPosition.y.toFixed(4) %>" placeholder="Y" class="form-control numberInput wcs" type="text">\
            &nbsp;<input data-type="z" value="<%= originPosition.z.toFixed(4) %>" placeholder="Z" class="form-control numberInput wcs" type="text">\
            <br/><a id="manualSelectOrigin" class=" btn btn-lg btn-default btn-imageCustom<% if (manualSelectOrigin){ %> btn-selected<% } %>"><img src="assets/imgs/cursor.png"></a>\
            <label>&nbsp;&nbsp;&nbsp;Manually select origin from existing cell</label><br/><br/>\
            Stock (xyz): &nbsp;&nbsp;<input data-type="x" value="<%= stockPosition.x.toFixed(4) %>" placeholder="X" class="form-control numberInput stockPosition" type="text">\
            &nbsp;<input data-type="y" value="<%= stockPosition.y.toFixed(4) %>" placeholder="Y" class="form-control numberInput stockPosition" type="text">\
            &nbsp;<input data-type="z" value="<%= stockPosition.z.toFixed(4) %>" placeholder="Z" class="form-control numberInput stockPosition" type="text"><br/>\
            <label class="checkbox" for="stockPosRel">\
            <input id="stockPosRel" data-property="stockPositionRelative" type="checkbox" <% if (stockPositionRelative){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Stock position relative to Origin</label>\
            <label class="checkbox" for="multipleStockPositions">\
            <input id="multipleStockPositions" data-property="multipleStockPositions" type="checkbox" <% if (multipleStockPositions){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Multiple stock positions</label>\
            <% if (multipleStockPositions){ %>\
                Stock dimensions (xy): &nbsp;&nbsp;<input data-type="x" value="<%= stockArraySize.x %>" placeholder="X" class="form-control numberInput stockArraySize" type="text">\
                &nbsp;<input data-type="y" value="<%= stockArraySize.y %>" placeholder="Y" class="form-control numberInput stockArraySize" type="text"><br/><br/>\
                Stock separation: &nbsp;&nbsp;<input value="<%= stockSeparation %>" placeholder="X" class="form-control numberInput stockSeparation" type="text"><br/><br/>\
            <% } %>\
            Clearance Height: &nbsp;&nbsp;<input value="<%= rapidHeight %>" placeholder="Z" class="form-control numberInput rapidHeight" type="text"><br/>\
            <label class="checkbox" for="rapidPosRel">\
            <input id="rapidPosRel" data-property="rapidHeightRelative" type="checkbox" <% if (rapidHeightRelative){ %> checked="checked"<% } %> value="" data-toggle="checkbox" class="custom-checkbox">\
            <span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Clearance height relative to Origin</label>\
            Approach Height: &nbsp;&nbsp;<input value="<%= safeHeight %>" placeholder="Z" class="form-control numberInput safeHeight" type="text"><br/><br/>\
            Speeds (measured in <%= units %> per second):<br/><br/>\
            Rapids (xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= rapidSpeeds.xy %>" placeholder="XY" class="form-control numberInput rapidSpeeds" type="text">\
            &nbsp;<input data-type="z" value="<%= rapidSpeeds.z %>" placeholder="Z" class="form-control numberInput rapidSpeeds" type="text"><br/><br/>\
            Feed Rate (xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= feedRate.xy %>" placeholder="XY" class="form-control numberInput feedRate" type="text">\
            &nbsp;<input data-type="z" value="<%= feedRate.z %>" placeholder="Z" class="form-control numberInput feedRate" type="text">\
        ')

});