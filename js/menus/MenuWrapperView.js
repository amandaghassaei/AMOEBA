/**
 * Created by aghassaei on 1/26/15.
 */


MenuWrapper = Backbone.View.extend({

    el: "#menuHeader",

    events: {
        "click .menuWrapperTab>a":                     "_tabWasSelected"
    },

    initialize: function(options){

        _.bindAll(this, "render", "_updateCurrentTab", "_setVisibility", "_hide", "_show");

        //init all tab view controllers
        this.latticeMenu = new LatticeMenuView({model:options.lattice, appState:this.model});
        this.importMenu = new ImportMenuView({lattice:options.lattice, appState:this.model});
        this.sketchMenu = new SketchMenuView({model:options.lattice, appState:this.model});
        this.partMenu = new PartMenuView({model:options.lattice, appState:this.model});
        this.scriptMenu = new ScriptMenuView({appState:this.model});

        //data names and titles
        this.designMenuTabs = {lattice:"Lattice", import:"Import", sketch:"Sketch", part:"Part", script:"Script"};
        this.simMenuTabs = {physics:"Physics", part:"Part", material:"Material", optimize:"Optimize"};
        this.assemMenuTabs = {assembler:"Assembler", animate:"Animate"};

        //bind events
        this.listenTo(this.model, "change:currentNav", this.render);
        this.listenTo(this.model, "change:currentTab", this._updateCurrentTab);
        this.listenTo(this.model, "change:menuIsVisible", this._setVisibility);

        if (this.model.get("menuIsVisible")) this._populateAndShow();
    },

    _tabWasSelected: function(e){
        e.preventDefault();
        var tabName = $(e.target).parent().data('name');
        this.model.set("currentTab", tabName);
    },

    _updateCurrentTab: function(){
        var tabName = this.model.get("currentTab");
        _.each($(".menuWrapperTab"), function(tab){
            var $tab = $(tab);
            if ($tab.data('name') == tabName){
                $tab.addClass("active");
            } else {
                $tab.removeClass("active");
            }
        });

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
            $("#menuContent").html('Something goes here eventually.');//clear out content from menu
        }

    },

    render: function(){
        var self = this;
        this._hide(function(){
            self._populateAndShow();
        }, true);
    },

    _populateAndShow: function(){
        this.$el.html(this.template(_.extend(this.model.attributes,
            {navDesign:this.designMenuTabs,
            navSim:this.simMenuTabs,
            navAssemble:this.assemMenuTabs})));
        this._updateCurrentTab();
        this._show();
    },

    _setVisibility: function(){
        if(this.model.get("menuIsVisible")){
            this._populateAndShow();
        } else {
            this._hide();
        }
    },

    _hide: function(callback, suppressModelUpdate){
        this.$el.parent().animate({right: "-400"}, {done: callback});
        if (!suppressModelUpdate) this.model.set("menuIsVisible", false);
    },

    _show: function(){
        this.$el.parent().animate({right: "0"});
        this.model.set("menuIsVisible", true);
    },

    template: _.template('\
        <ul class="nav nav-tabs nav-justified">\
        <% var dict = eval(currentNav);\
        _.each(_.keys(dict), function(key){%>\
          <li role="presentation" class="menuWrapperTab" data-name="<%= key %>"><a href="#"><%= dict[key] %></a></li>\
        <% }); %>\
        </ul>\
        ')
});