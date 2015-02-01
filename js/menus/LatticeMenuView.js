/**
 * Created by aghassaei on 1/26/15.
 */


LatticeMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
        "click #latticeMenuClearCells":                 "_clearCells",
        "change #latticeScale":                         "_changeScale",
        "click .cellType":                              "_changeCellType",
        "click .connectionType":                        "_changeConnectionType"
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

    _changeCellType: function(e){
        e.preventDefault();
        var cellType = $(e.target).data("type");
        var currentCellType = this.model.get("cellType");
        this.model.set("cellType", cellType, {silent:true});
        if (currentCellType == cellType) return;
        if (currentCellType == "cube") this.model.set("connectionType", "face");
        else if (currentCellType == "octa") this.model.set("connectionType", "face");
    },

    _changeConnectionType: function(e){
        e.preventDefault();
        var connectionType = $(e.target).data("type");
        this.model.set("connectionType", connectionType);
    },

    render: function(){
        if (this.appState.get("currentTab") != "lattice") return;
        this.$el.html(this.template(this.model.attributes));
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
        Scale:&nbsp;&nbsp;<input id="latticeScale" value="<%= scale %>" placeholder="enter scale" class="form-control" type="text"><br/>\
        NumCells:&nbsp;&nbsp;<%= numCells %><br/>\
        <br/>\
        <a href="#" id="latticeMenuClearCells" class=" btn btn-block btn-lg btn-default">Clear All Cells</a><br/>\
        ')

});