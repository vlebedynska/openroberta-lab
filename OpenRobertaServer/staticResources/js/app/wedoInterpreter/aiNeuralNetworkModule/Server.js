define(["require", "exports", "express"], function (require, exports, express) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Create a new express app instance
    const app = express();
    app.get('/', function (req, res) {
        res.send('Hello World!');
    });
    app.listen(3000, function () {
        console.log('App is listening on port 3000!');
    });
});
