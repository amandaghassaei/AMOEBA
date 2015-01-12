/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    three = Three();
    setupNavBar();
    workers = persistentWorkers(4);

    workers.map([11,12,13,14,15, 18, 30], executable, {});

    function executable(){
        return arg*arg;
    }

});
