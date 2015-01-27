/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(){

        _.bindAll(this, "render");
    },

    render: function(){
        this.$el.html(this.template());
    },

    template: _.template('\
        Cell Type: <br/>\
        Cell Connection:<br/>\
        Scale:<br/>\
        Column Separation:<br/><br/>\
        <a href="#" class=" btn btn-block btn-lg btn-default">Clear All</a><br/>\
        <span class="btn btn-default btn-file fullWidth">\
            Upload STL<input id="uploadMesh" type="file">\
       </span><br/><br/>\
        <div class="btn-group fullWidth">\
            <button data-toggle="dropdown" class="btn btn-default dropdown-toggle fullWidth" type="button">Select Model <span class="caret"></span></button>\
            <ul role="menu" class="dropdown-menu">\
              <li><a class="selectMesh" data-file="Airbus_A300-600.stl" href="#">Plane</a></li>\
            </ul>\
        </div><!-- /btn-group -->')

});