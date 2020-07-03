require.config({
    "packages": ["cart"]
});

require(["cart"],
    function (cart) {
        cart.bla();
    });