/**
 * Created by aghassaei on 1/26/15.
 */


MenuWrapper = Backbone.View.extend({

    el: "#menuHeader",

    events: {
        "click .nav-tabs>li>a":                     "_tabWasSelected"
    },

    initialize: function(options){

        _.bindAll(this, "render");

        //init all tab view controllers
        this.latticeMenu = new LatticeMenuView({model:options.lattice});
        this.importMenu = new ImportMenuView({lattice:options.lattice});
        this.sketchMenu = new SketchMenuView({model:options.lattice});
        this.partMenu = new PartMenuView({model:options.lattice});
        this.scriptMenu = new ScriptMenuView();

        //data names and titles
        this.designMenuTabs = {lattice:"Lattice", import:"Import", sketch:"Sketch", part:"Part", script:"Script"};
        this.simMenuTabs = {physics:"Physics", part:"Part", material:"Material", optimize:"Optimize"};
        this.assemMenuTabs = {assembler:"Assembler", animate:"Animate"};

        //bind events
        this.listenTo(this.model, "change:currentTab", this._updateCurrentTab);

        this.render();
    },

    _tabWasSelected: function(e){
        e.preventDefault();
        var tabName = $(e.target).parent().data('name');
        this.model.set("currentTab", tabName);
    },

    _updateCurrentTab: function(){
        var tabName = this.model.get("currentTab");
        _.each($(".nav-tabs>li>a"), function(tab){
            var parent = $(tab).parent();
            if (parent.data('name') == tabName){
                parent.addClass("active");
            } else {
                parent.removeClass("active");
            }
        });

        this._deselectAllMenus();

        if (tabName == "lattice"){
            this.latticeMenu.render();
        } else if (tabName == "import"){
            this.importMenu.render();
        } else if (tabName == "sketch"){
            this.sketchMenu.render();
        } else if (tabName == "part"){
            this.partMenu.render();
        } else if (tabName == "script"){
            this.scriptMenu.render();
        } else {
            console.warn("no tab initialized!");
            $("menuContent").html('');//clear out content from menu
        }

    },

    _deselectAllMenus: function(){
        this.latticeMenu.currentlySelected = false;
        this.importMenu.currentlySelected = false;
        this.sketchMenu.currentlySelected = false;
        this.partMenu.currentlySelected = false;
//        this.scriptMenu.currentlySelected = false;
    },

    render: function(){
        this.$el.html(this.template(_.extend(this.model.attributes,
            {designMenuTabs:this.designMenuTabs,
            simMenuTabs:this.simMenuTabs,
            assemMenuTabs:this.assemMenuTabs})));
        this._updateCurrentTab();
        this.show();
    },

    hide: function(){
        this.$el.parent().animate({right: "-400"});
    },

    show: function(){
        this.$el.parent().animate({right: "0"});
    },

    template: _.template('\
        <ul class="nav nav-tabs nav-justified">\
        <% _.each(_.keys(designMenuTabs), function(key){%>\
          <li role="presentation" data-name="<%= key %>"><a href="#"><%= designMenuTabs[key] %></a></li>\
        <% }); %>\
        </ul>\
        ')
});