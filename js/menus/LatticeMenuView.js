/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #latticeMenuClearCells":                 "_clearCells",
        "change #latticeScale":                         "_changeScale"
    },


    initialize: function(options){

        this.appState = options.appState;

        _.bindAll(this, "render");
        this.listenTo(this.model, "change", function(){
            if(!this.model.hasChanged('cellMode')){//ignore cell mode changes
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

    _formatData: function(){
        var formattedCellType = "Octahedral";
        var formattedConnectionType = "Face-Connected";
        return {formattedCellType:formattedCellType, formattedConnectionType:formattedConnectionType};
    },

    render: function(){
        if (this.appState.get("currentTab") != "lattice") return;
        this.$el.html(this.template(_.extend(this.model.attributes, this._formatData())));
    },

    template: _.template('\
        Cell Type: &nbsp;&nbsp;<%= formattedCellType %><br/>\
        Cell Connection:&nbsp;&nbsp;<%= formattedConnectionType %><br/>\
        Scale:&nbsp;&nbsp;<input id="latticeScale" value="<%= scale %>" placeholder="enter scale" class="form-control" type="text"><br/>\
        NumCells:&nbsp;&nbsp;<%= numCells %><br/>\
        <br/>\
        <a href="#" id="latticeMenuClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});