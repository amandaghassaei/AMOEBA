/**
 * Created by aghassaei on 2/25/15.
 */

define(['jquery', 'underscore', 'menuParent', 'plist', 'cam', 'lattice', 'text!assemblerMenuTemplate'], function($, _, MenuParentView, plist, cam, lattice, template){

    return MenuParentView.extend({
    
        events: {
        },
    
        _initialize: function(){
    
            _.bindAll(this, "_onKeyup");
            this.listenTo(cam, "change", this.render);//todo handle this in wrapper
            $(document).bind('keyup', {}, this._onKeyup);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("assembler")) return cam;
            return null;
        },
    
        _onKeyup: function(e){
            if (this.model.get("currentTab") != "assembler") return;
            if ($(".placementOrder").is(":focus")) this._updatePlacementOrder(e);
        },
    
        _updatePlacementOrder: function(e){
            e.preventDefault();
            var newVal = $(e.target).val();
            if (newVal.length<3) return;//todo this isn't quite right
            cam.set("placementOrder", newVal);
    //        cam.trigger("change:placementOrder");
        },

        _makeTemplateJSON: function(){
            return _.extend(this.model.toJSON(), cam.toJSON(), lattice.toJSON(), plist);
        },
    
        template: _.template(template)
    });
});