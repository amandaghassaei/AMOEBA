/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    three = Three();
    setupNavBar();
    workers = persistentWorkers(8);

    workers.map([11,12], executable, {}, incrCallback);

    function executable(){
        return arg*arg;
    }

    function incrCallback(result){
        console.log(result);
    }

});
