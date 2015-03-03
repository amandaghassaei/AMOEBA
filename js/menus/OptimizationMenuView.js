/**
 * Created by aghassaei on 2/25/15.
 */

OptimizationMenuView = Backbone.View.extend({

    el: "#menuContent",

    events: {
    },

    initialize: function(options){

        _.bindAll(this, "render");
    },

    render: function(){
        if (this.model.get("currentTab") != "optimize") return;
        this.$el.html(this.template());
    },

    template: _.template('\
        input stiffness requirements of structure\
        <br/><br/>\
        data representation for structural optimization: <a href="http://www.demo.cs.brandeis.edu/papers/edc98.pdf">lego tree</a>, <a href="http://creativemachines.cornell.edu/sites/default/files/Cheney_MacCurdy_Clune_Lipson--Unshackling_Evolution.pdf">CPPN-NEAT (functional)</a>, octree, some other kind of tree, grammar?\
        <br/><br/>\
        optimization parameters representation may depend on application: <a href="http://en.wikipedia.org/wiki/Evolved_antenna">antenna</a>, <a href="http://2.bp.blogspot.com/-4o29mAWZjag/UURyXoraMKI/AAAAAAAAHyM/HnevUeJ68Sw/s400/yyy.bmp">nike</a>, airbus, assembler/declarative design\
        <br/><br/>\
        active components/structures: <a href="https://www.youtube.com/watch?v=z9ptOeByLA4">voxcad</a>, <a href="http://arxiv.org/pdf/cs/0004003v2.pdf">conway</a> (<a href="http://www.instructables.com/id/OTCA-Metapixel-Conways-Game-of-Life/">instructable</a>)\
        <br/><br/>\
        ')

});