/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #latticeMenuClearCells":                 "_clearCells",
        "change #latticeScale":                         "_changeScale",
        "click .cellType":                              "_changeCellType",
        "click .connectionType":                        "_changeConnectionType",
        "slide #scaleSlider":                           "_sliderDidSlide",
        "slideStop #scaleSlider":                       "_changeScaleSlider",
        "change #preserveCells":                        "_changePreserveCells",
        "change #showInverse":                          "_showInverseCells"
    },


    initialize: function(options){

        this.lattice = options.lattice;

        _.bindAll(this, "render");
//        var self = this;
//        this.listenTo(this.model, "change", function(){
//            var change = false;
//            _.each(_.keys(self.model.changedAttributes()), function(attribute){
//                if (attribute != "currentNav" && attribute != "currentTab") change = true;
//            });
//            if (change) this.render();
//        });
        this.listenTo(this.lattice, "change", this.render);
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

    _sliderDidSlide: function(e){
        var scale = $(e.target)[0].value;
        this.lattice.previewScaleChange(scale);//does not trigger lattice change event - no rerendering of ui
        $("#latticeScale").val(scale);
        dmaGlobals.three.render();
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
        if (newCellType == "cube") {
            if (!newConnectionType){
                newConnectionType = "face";
                this.lattice.set("connectionType", newConnectionType, {silent:true});
            }
            this.model.set("connectionType", newConnectionType, {silent:true});
            if (newConnectionType == "face"){
                this.lattice.set("partType", null, {silent:true});
            }
        }
        else if (newCellType == "octa") {
            if (!newConnectionType){
                newConnectionType = "face";
                this.lattice.set("connectionType", newConnectionType, {silent:true});
            }
            if (newConnectionType == "face"){
                this.lattice.set("partType", "triangle", {silent:true});
            } else if (newConnectionType == "edge"){
                this.lattice.set("partType", "triangle", {silent:true});
            } else if (newConnectionType == "vertex"){
                this.lattice.set("partType", "square", {silent:true});
            }
        }
    },

    _changePreserveCells: function(e){
        this.lattice.set("shouldPreserveCells", $(e.target).prop("checked"));
    },

    _showInverseCells: function(e){
        this.lattice.set("inverseMode", $(e.target).prop("checked"));
    },

    render: function(){
        if (this.model.get("currentTab") != "lattice") return;
        this.$el.html(this.template(_.extend(this.model.attributes, this.lattice.attributes)));

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
            </div><br/>\
        <% if (connectionType != "freeformFace") { %>\
        <label class="checkbox">\
            <input type="checkbox" <% if (shouldPreserveCells) { %> checked="checked" <% } %> value="" id="preserveCells" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Preserve cells on lattice change\
        </label>\
        <% } %>\
        <br/><br/>\
        <label class="checkbox">\
            <input type="checkbox"  <% if (inverseMode) { %> checked="checked" <% } %> value="" id="showInverse" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
            Show Inverse Geometry (hold "i" key)\
        </label><br/><br/>\
        Scale:&nbsp;&nbsp;<input id="scaleSlider" data-slider-id="ex1Slider" type="text" data-slider-min="1" data-slider-max="100" data-slider-step="0.1" data-slider-value="<%= scale %>"/>\
        <br/><input id="latticeScale" value="<%= scale %>" placeholder="enter scale" class="form-control" type="text"><br/>\
        Num Cells:&nbsp;&nbsp;<%= numCells %><br/>\
        <br/>\
        <a href="#" id="latticeMenuClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        hint: click to create cells, shift+drag to create a lot of cells, d+click to delete cells<br/>\
        hold "p" key to see parts\
        ')

//    <label class="checkbox" for="invertGeo">\
//            <input type="checkbox" checked="checked" value="" id="invertGeo" data-toggle="checkbox" class="custom-checkbox"><span class="icons"><span class="icon-unchecked"></span><span class="icon-checked"></span></span>\
//            Show Inverse Geometry\
//        </label>\

});