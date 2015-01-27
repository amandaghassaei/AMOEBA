/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");
        this.listenTo(this.model, "change", this.render);
    },

    _formatData: function(){
        var formattedCellType = "Octagon";
        var formattedConnectionType = "Face-Connected";
        return {formattedCellType:formattedCellType, formattedConnectionType:formattedConnectionType};
    },

    render: function(){
        this.$el.html(this.template(_.extend(this.model.attributes, this._formatData())));
    },

    template: _.template('\
        Cell Type: &nbsp;&nbsp;<%= formattedCellType %><br/>\
        Cell Connection:&nbsp;&nbsp;<%= formattedConnectionType %><br/>\
        Scale:&nbsp;&nbsp;<%= scale %><br/>\
        Column Separation:<br/>\
        NumCells:&nbsp;&nbsp;<%= numCells %><br/><br/>\
        <a href="#" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});