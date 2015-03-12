/**
 * Created by aghassaei on 1/26/15.
 */


MenuWrapper = Backbone.View.extend({

    el: "#menuHeader",

    events: {
        "click .menuWrapperTab>a":                     "_tabWasSelected"
    },

    initialize: function(){

        _.bindAll(this, "render", "_updateCurrentTab", "_setVisibility", "_hide", "_show");

        var lattice = dmaGlobals.lattice;

        //init all tab view controllers
        this.latticeMenu = new LatticeMenuView({model:this.model, lattice:lattice});
        this.importMenu = new ImportMenuView({lattice:lattice, appState:this.model});
        this.sketchMenu = new SketchMenuView({model:lattice, appState:this.model});
        this.partMenu = new PartMenuView({model:this.model, lattice:lattice});
        this.scriptMenu = new ScriptMenuView({model:this.model});
        this.physicsMenu = new PhysicsMenuView({model:this.model});
        this.materialMenu = new MaterialMenuView({model:this.model});
        this.optimizeMenu = new OptimizationMenuView({model:this.model});
        this.assemblerMenu = new AssemblerMenuView({model:this.model, assembler: dmaGlobals.assembler});
        this.animationMenu = new AnimationMenuView({model:lattice.get("basePlane"), appState:this.model});
        this.camMenu = new CamMenuView({model:this.model, lattice:lattice, assembler:dmaGlobals.assembler});
        this.sendMenu = new SendMenuView({model:this.model});

        //bind events
        this.listenTo(this.model, "change:currentNav", this.render);
        this.listenTo(lattice, "change:cellType change:connectionType", this._populateAndShow);
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
        } else if (tabName == "physics"){
            this.physicsMenu.render();
        } else if (tabName == "material"){
            this.materialMenu.render();
        } else if (tabName == "optimize"){
            this.optimizeMenu.render();
        } else if (tabName == "assembler"){
            this.assemblerMenu.render();
        } else if (tabName == "animate"){
            this.animationMenu.render();
        } else if (tabName == "cam"){
            this.camMenu.render();
        } else if (tabName == "send"){
            this.sendMenu.render();
        } else {
            console.warn("no tab initialized!");
            $("#menuContent").html('Coming Soon.');//clear out content from menu
        }

    },

    render: function(){
        var self = this;
        this._hide(function(){
            self._populateAndShow();
            self.model.trigger("change:currentTab");//this was updated silently before
        }, true);
    },

    _populateAndShow: function(){
        this.$el.html(this.template(_.extend(this.model.toJSON(), dmaGlobals.lattice.toJSON())));
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
        <% _.each(_.keys(allMenuTabs[currentNav]), function(key){\
            if (key == "part" && !(allPartTypes[cellType][connectionType])) return;  %>\
          <li role="presentation" class="menuWrapperTab" data-name="<%= key %>"><a href="#"><%= allMenuTabs[currentNav][key] %></a></li>\
        <% }); %>\
        </ul>\
        ')
});