/**
 * Created by ghassaei on 10/11/16.
 */


define(["jquery", "backbone", "plist"], function($, Backbone, plist){

    var AppState = Backbone.Model.extend({

        defaults: {

            currentNav: "navDesign",
            currentTab: "lattice",

            deleteMode: false,

            baseplaneIsVisible: true

        },

        initialize: function(){

            _.bindAll(this, "_handleKeyStroke", "_handleScroll");
            $(document).bind('keydown', {state:true}, this._handleKeyStroke);
            $(document).bind('keyup', {state:false}, this._handleKeyStroke);
            $(document).bind('mousewheel', {}, this._handleScroll);//disable browser back scroll

            var mousePosition = { x: -1, y: -1 };
            $(document).mousemove(function(event) {
                mousePosition.x = event.pageX;
                mousePosition.y = event.pageY;
            });
            this.mousePosition = mousePosition;

            this.downKeys = {};//track keypresses to prevent repeat keystrokes on hold
        },


        _handleKeyStroke: function(e){//receives keyup and keydown

            var hoverEl = document.elementFromPoint(this.mousePosition.x, this.mousePosition.y);
            if (hoverEl && hoverEl.tagName != "CANVAS") {
                if ($("input").is(':focus')) return;//we are typing in an input
                if ($("textarea").is(':focus')) return;//we are typing in an input
            }

            var state = e.data.state;
            var currentTab = this.get("currentTab");

            var shift = e.shiftKey;

            if (e.ctrlKey || e.metaKey){
            } else if (state) {
                if (this.downKeys[e.keyCode]) return;
                this.downKeys[e.keyCode] = true;
            } else this.downKeys[e.keyCode] = false;

            //console.log(e);
            //console.log(e.keyCode);
            switch(e.keyCode){
                case 68://d delete mode
                    var currentNav = this.get("currentNav");
                    if (currentNav === "navDesign" || plist.allMenus[currentNav].parent === "navDesign"){
                        this.set("deleteMode", state);
                    }
                    break;
                case 82://r
                    if (state && (e.ctrlKey || e.metaKey)){
                        if (e.shiftKey){
                            e.preventDefault();
                            location.reload();///refresh
                            return;
                        }
                    }
                    break;
                case 8://delete key - causes back nav in chrome, super annoying
                    e.preventDefault();
                    e.stopPropagation();
                    //also continue to case 46
                default:
                    break;
            }
        },

        _handleScroll: function(e){//disable two finger swipe back
            if (Math.abs(e.originalEvent.deltaX) > Math.abs(e.originalEvent.deltaY)) e.preventDefault();
}


    });
    return new AppState();
});
