
;(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.YourModule = factory();
    }

}(this, function () {
    return {
        bla: helloWorld
    };
}));

helloWorld = function () {
    console.log("Ich bins!")
}
