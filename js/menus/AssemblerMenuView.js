/**
 * Created by aghassaei on 2/25/15.
 */


AssemblerMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "assembler") return;
        this.$el.html(this.template());
    },

    template: _.template("\
        <a href='https://www.youtube.com/watch?v=1Cv7qaz63nQ'>Kiva simulation</a><br/><br/>\
        <a href='http://fab.cba.mit.edu/classes/865.15/people/will.langford/2_replicating/index.html'>will's demo</a><br/><br/>\
        <a href='http://www.eecs.harvard.edu/ssr/papers/iros11wksp-werfel.pdf'>asynchronous, multi-agent assembly algorithms</a> (doesn't necessarily have to be swarm-based)\
        <a href='https://www.youtube.com/watch?v=XNoNpjYQN4s'>video</a>\
        <br/><br/>\
        ")

});