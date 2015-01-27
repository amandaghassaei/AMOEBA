/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #latticeMenuClearCells":                "_clearCells"

    },

    currentlySelected: false,

    initialize: function(){

        _.bindAll(this, "render");
        this.listenTo(this.model, "change", function(){
            if (!this.currentlySelected) return;
            if(!this.model.hasChanged('cellMode')){//I want to ignore cellMode changes and listen to everything else
                this.render();
            }
        });
    },

    _clearCells: function(e){
        e.preventDefault();
        this.model.clearCells();
    },

    _formatData: function(){
        var formattedCellType = "Octagon";
        var formattedConnectionType = "Face-Connected";
        return {formattedCellType:formattedCellType, formattedConnectionType:formattedConnectionType};
    },

    render: function(){
        this.currentlySelected = true;//if this causes a change, render must have been called from menu wrapper
        this.$el.html(this.template(_.extend(this.model.attributes, this._formatData())));
        this.model.set("cellMode", "cell");
    },

    template: _.template('\
        Cell Type: &nbsp;&nbsp;<%= formattedCellType %><br/>\
        Cell Connection:&nbsp;&nbsp;<%= formattedConnectionType %><br/>\
        Scale:&nbsp;&nbsp;<%= scale %><br/>\
        Column Separation:<br/>\
        NumCells:&nbsp;&nbsp;<%= numCells %><br/><br/>\
        <a href="#" id="latticeMenuClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});