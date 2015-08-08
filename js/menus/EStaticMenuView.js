/**
 * Created by aghassaei on 6/30/15.
 */


define(['jquery', 'underscore', 'menuParent', 'plist', 'text!eStaticMenuTemplate', 'eSim'],
    function($, _, MenuParentView, plist, template, eSim){

    return MenuParentView.extend({

        events: {
        },

        _initialize: function(){
            this.listenTo(eSim, "change", this.render);
        },

        getPropertyOwner: function($target){
            if ($target.hasClass("eSim")) return eSim;
            return null;
        },

        _makeTemplateJSON: function(){
            console.log(eSim.get("conductorGroups"));
            return _.extend(this.model.toJSON(), eSim.toJSON());
        },

        template: _.template(template)
    });
});