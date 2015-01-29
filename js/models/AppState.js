/**
 * Created by aghassaei on 1/29/15.
 */

//a class to store global app state, model for navbar and menu wrapper
//maybe other things eventually

AppState = Backbone.Model.extend({

    defaults: {
        currentNav:"design",//design, sim, assemble
        currentTab:"lattice",
        menuIsVisible: true
    },

    initialize: function(){

    }
});