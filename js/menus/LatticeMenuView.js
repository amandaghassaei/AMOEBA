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
//        "slideStop #scaleSlider":                       "_changeScaleSlider"
    },


    initialize: function(options){

        this.appState = options.appState;

        _.bindAll(this, "render");
        this.listenTo(this.model, "change", function(){
            if(!this.model.hasChanged('cellMode') && !(this.model.hasChanged('scale'))){//ignore cell mode changes
                this.render();
            };
        });

    },

    _clearCells: function(e){
        e.preventDefault();
        this.model.clearCells();
    },

    _changeScale: function(e){
        e.preventDefault();
        var val = parseFloat($(e.target).val());
        if (isNaN(val)) return;
        this.model.set("scale", val);
    },

    _sliderDidSlide: function(e){
        var scale = $(e.target)[0].value;
        this.model.set("scale", $(e.target)[0].value);
//        this.model.previewScaleChange(scale);//does not trigger lattice change event - no rerendering of ui
        $("#latticeScale").val(scale);
        window.three.render();
    },

//    _changeScaleSlider: function(e){
//        this.model.set("scale", $(e.target)[0].value);
//    },

    _changeCellType: function(e){
        e.preventDefault();
        var cellType = $(e.target).data("type");

        //reset everything to defaults silently
        if (cellType != this.model.get("cellType")){
            this._setLatticeToDefaultsSilently(cellType);
        }
        this.model.set("cellType", cellType);
    },

    _setLatticeToDefaultsSilently: function(newCellType, newConnectionType){
        if (newCellType == "cube") {
            if (!newConnectionType){
                newConnectionType = "face";
                this.model.set("connectionType", newConnectionType, {silent:true});
            }
            this.model.set("connectionType", newConnectionType, {silent:true});
            if (newConnectionType == "face"){
                this.model.set("partType", null, {silent:true});
            }
        }
        else if (newCellType == "octa") {
            if (!newConnectionType){
                newConnectionType = "face";
                this.model.set("connectionType", newConnectionType, {silent:true});
            }
            if (newConnectionType == "face"){
                this.model.set("partType", "triangle", {silent:true});
            } else if (newConnectionType == "edge"){
                this.model.set("partType", "triangle", {silent:true});
            } else if (newConnectionType == "vertex"){
                this.model.set("partType", "square", {silent:true});
            }
        }
    },

    _changeConnectionType: function(e){
        e.preventDefault();
        var connectionType = $(e.target).data("type");
        if (connectionType != this.model.get("connectionType")){
            this._setLatticeToDefaultsSilently(this.model.get("cellType"), connectionType);
        }
        this.model.set("connectionType", connectionType);
    },

    render: function(){
        if (this.appState.get("currentTab") != "lattice") return;
        this.$el.html(this.template(this.model.attributes));

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
        Scale:&nbsp;&nbsp;<input id="scaleSlider" data-slider-id="ex1Slider" type="text" data-slider-min="1" data-slider-max="100" data-slider-step="0.1" data-slider-value="<%= scale %>"/>\
        <br/><input id="latticeScale" value="<%= scale %>" placeholder="enter scale" class="form-control" type="text"><br/>\
        Num Cells:&nbsp;&nbsp;<%= numCells %><br/>\
        <br/>\
        <a href="#" id="latticeMenuClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});