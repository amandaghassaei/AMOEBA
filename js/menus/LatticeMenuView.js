/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #latticeMenuClearCells":                 "_clearCells",
        "change #latticeScale":                         "_changeScale",
        "click .units":                                 "_changeUnits",
        "click .cellType":                              "_changeCellType",
        "click .connectionType":                        "_changeConnectionType",
        "slide #scaleSlider":                           "_sliderDidSlide",
        "slideStop #scaleSlider":                       "_changeScaleSlider",
        "click #freeformTetraCell":                     "_setTetraCell",
        "click #freeformOctaCell":                      "_setOctaCell"
    },


    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "render", "_onKeyup");
        //bind events
        this.listenTo(this.lattice, "change", this.render);
        $(document).bind('keyup', {state:false}, this._onKeyup);
    },

    _onKeyup: function(e){
        if (this.model.get("currentTab") != "lattice") return;

        if ($("input").is(":focus") && e.keyCode == 13) {//enter key
            $(e.target).blur();
            this.render();
            return;
        }

        if ($(".cellSeparation").is(":focus")) this._updateNumber(e, "cellSeparation");
        if ($("#gikLength").is(":focus")) this._updateGikLength(e);
    },

    _updateNumber: function(e, property){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        var object = this.lattice.get(property);
        object[$(e.target).data("type")] = newVal;
        this.lattice.trigger("change:"+property);
    },

    _updateGikLength: function(e){
        e.preventDefault();
        var newVal = parseInt($(e.target).val());
        if (isNaN(newVal)) return;
        globals.lattice.set("gikLength", newVal);
    },

    _clearCells: function(e){
        e.preventDefault();
        this.lattice.clearCells();
    },

    _changeScale: function(e){
        e.preventDefault();
        var val = parseFloat($(e.target).val());
        if (isNaN(val)) return;
        this.lattice.set("scale", val);
    },

    _changeUnits: function(e){
        e.preventDefault();
        this.lattice.set("units", $(e.target).data("type"));
    },

    _sliderDidSlide: function(e){
        var scale = $(e.target)[0].value;
        this.lattice.previewScaleChange(scale);//does not trigger lattice change event - no rerendering of ui
        $("#latticeScale").val(scale);
        globals.three.render();
    },

    _changeScaleSlider: function(e){
        this.lattice.set("scale", $(e.target)[0].value);
    },

    _changeCellType: function(e){
        e.preventDefault();
        var cellType = $(e.target).data("type");

        //reset everything to defaults silently
        if (cellType != this.lattice.get("cellType")){
            this._setAppStateToDefaultsSilently(cellType);
        }
        this.lattice.set("cellType", cellType);
    },

    _changeConnectionType: function(e){
        e.preventDefault();
        var connectionType = $(e.target).data("type");
        if (connectionType != this.lattice.get("connectionType")){
            this._setAppStateToDefaultsSilently(this.lattice.get("cellType"), connectionType);
        }
        this.lattice.set("connectionType", connectionType);
    },

    _setAppStateToDefaultsSilently: function(newCellType, newConnectionType){
        if (!newConnectionType){
            newConnectionType = _.keys(globals.appState.get("allConnectionTypes")[newCellType])[0];
            this.lattice.set("connectionType", newConnectionType, {silent:true});
        }
        var partType = _.keys(globals.appState.get("allPartTypes")[newCellType][newConnectionType])[0];
        this.lattice.set("partType", partType, {silent:true});
    },

    //todo get rid of this
    _setTetraCell: function(e){
        e.preventDefault();
        this.lattice.set("freeformCellType", "tetra");
    },

    _setOctaCell: function(e){
        e.preventDefault();
        this.lattice.set("freeformCellType", "octa");
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "lattice") return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), this.lattice.toJSON(), globals.plist)));

        $('#scaleSlider').slider({
            formatter: function(value) {
                return value;
            }
        });
    },

    template: _.template('\
        Cell Type: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allCellTypes[cellType] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allCellTypes), function(key){ %>\
                        <li><a class="cellType" data-type="<%= key %>" href="#"><%= allCellTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Cell Connection:&nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allConnectionTypes[cellType][connectionType] %>-Connected<span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allConnectionTypes[cellType]), function(key){ %>\
                        <li><a class="connectionType" data-type="<%= key %>" href="#"><%= allConnectionTypes[cellType][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        <% if (connectionType == "freeformFace") { %>\
        Current Draw Shape:&nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= freeformCellType %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <li><a id="freeformOctaCell" href="#">octa</a></li>\
                    <li><a id="freeformTetraCell" href="#">tetra</a></li>\
                </ul>\
            </div>\
            <br/><br/>\
        <% } %>\
        <% if (connectionType == "gik") { %>\
        GIK Length:&nbsp;&nbsp;<input id="gikLength" value="<%= gikLength %>" placeholder="GIK length" class="form-control numberInput" type="text"><br/>\
        <br/>\
        <% } %>\
        <% if (allMaterialTypes[cellType][connectionType]){ %> \
        Material Type: &nbsp;&nbsp;<div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMaterialTypes[cellType][connectionType][materialType].name %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allMaterialTypes[cellType][connectionType]), function(key){ %>\
                        <li><a class="materialType" data-type="<%= key %>" href="#"><%= allMaterialTypes[cellType][connectionType][key].name %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        <% } %>\
        <br/>\
        Scale:&nbsp;&nbsp;<input id="latticeScale" value="<%= scale %>" placeholder="enter scale" class="form-control numberInput" type="text"><br/>\
        <input id="scaleSlider" data-slider-id="ex1Slider" type="text" data-slider-min="1" data-slider-max="100" data-slider-step="0.1" data-slider-value="<%= scale %>"/>\
        <br/>\
        Units: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allUnitTypes[units] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allUnitTypes), function(key){ %>\
                        <li><a class="units" data-type="<%= key %>" href="#"><%= allUnitTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Num Cells:&nbsp;&nbsp;<%= numCells %><br/><br/>\
        <br/>\
        <a href="#" id="latticeMenuClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});

//Cell Separation <% if (connectionType != "freeformFace"){ %>(xy, z): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text">\
//&nbsp;<input data-type="z" value="<%= cellSeparation.z %>" placeholder="Z" class="form-control numberInput cellSeparation" type="text">\
//<% } else { %>( radial ): &nbsp;&nbsp;<input data-type="xy" value="<%= cellSeparation.xy %>" placeholder="XY" class="form-control numberInput cellSeparation" type="text"><% } %>\
//<br/><br/>\