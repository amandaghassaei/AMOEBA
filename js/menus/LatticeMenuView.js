/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #latticeMenuClearCells":                 "_clearCells",
        "change #latticeScale":                         "_changeScale",
        "slide #latticeMenuScaleSlider":                "_sliderDidSlide",
        "slideStop #latticeMenuScaleSlider":            "_changeScaleSlider"
    },


    initialize: function(){

        _.bindAll(this, "render");
        //bind events
        this.listenTo(globals.lattice, "change", this.render);
    },

    _updateNumber: function(e, property){
        e.preventDefault();
        var newVal = parseFloat($(e.target).val());
        if (isNaN(newVal)) return;
        var object = globals.lattice.get(property);
        object[$(e.target).data("type")] = newVal;
        globals.lattice.trigger("change:"+property);
    },

    _updateGikLength: function(e){

    },

    _clearCells: function(e){
        e.preventDefault();
        globals.lattice.clearCells();
    },

    _changeScale: function(e){
        e.preventDefault();
        var val = parseFloat($(e.target).val());
        if (isNaN(val)) return;
        globals.lattice.set("scale", val);
    },

    _sliderDidSlide: function(e){
        var scale = $(e.target)[0].value;
        globals.lattice.previewScaleChange(scale);//does not trigger lattice change event - no rerendering of ui
        $("#latticeScale").val(scale);
        globals.three.render();
    },

    _changeScaleSlider: function(e){
        globals.lattice.set("scale", $(e.target)[0].value);
    },

    render: function(){
        if (this.model.changedAttributes()["currentNav"]) return;
        if (this.model.get("currentTab") != "lattice") return;
        this.$el.html(this.template(_.extend(this.model.toJSON(), globals.lattice.toJSON(), globals.plist)));

        $('#latticeMenuScaleSlider').slider({
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
                        <li><a class="lattice dropdownSelector" data-property="cellType" data-value="<%= key %>" href="#"><%= allCellTypes[key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        Cell Connection:&nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allConnectionTypes[cellType][connectionType] %>-Connected<span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allConnectionTypes[cellType]), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="connectionType" data-value="<%= key %>" href="#"><%= allConnectionTypes[cellType][key] %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        <% if (connectionType == "freeformFace") { %>\
        Current Draw Shape:&nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= freeformCellType %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <li><a class="lattice dropdownSelector" data-property="freeformCellType" data-value="octa" href="#">octa</a></li>\
                    <li><a class="lattice dropdownSelector" data-property="freeformCellType" data-value="tetra" href="#">tetra</a></li>\
                </ul>\
            </div>\
            <br/><br/>\
        <% } %>\
        <% if (connectionType == "gik") { %>\
        GIK Length:&nbsp;&nbsp;<input data-property="gikLength" value="<%= gikLength %>" placeholder="GIK length" class="form-control intInput lattice" type="text"><br/>\
        <br/>\
        <% } %>\
        <% if (allMaterialTypes[cellType][connectionType]){ %> \
        Material Type: &nbsp;&nbsp;<div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allMaterialTypes[cellType][connectionType][materialType].name %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allMaterialTypes[cellType][connectionType]), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="materialType" data-value="<%= key %>" href="#"><%= allMaterialTypes[cellType][connectionType][key].name %></a></li>\
                    <% }); %>\
                </ul>\
            </div><br/><br/>\
        <% } %>\
        <br/>\
        Scale:&nbsp;&nbsp;<input id="latticeScale" value="<%= scale %>" placeholder="enter scale" class="form-control numberInput" type="text"><br/>\
        <input id="latticeMenuScaleSlider" data-slider-id="ex1Slider" type="text" data-slider-min="1" data-slider-max="100" data-slider-step="0.1" data-slider-value="<%= scale %>"/>\
        <br/>\
        Units: &nbsp;&nbsp;\
            <div class="btn-group">\
                <button data-toggle="dropdown" class="btn dropdown-toggle" type="button"><%= allUnitTypes[units] %><span class="caret"></span></button>\
                <ul role="menu" class="dropdown-menu">\
                    <% _.each(_.keys(allUnitTypes), function(key){ %>\
                        <li><a class="lattice dropdownSelector" data-property="units" data-value="<%= key %>" href="#"><%= allUnitTypes[key] %></a></li>\
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