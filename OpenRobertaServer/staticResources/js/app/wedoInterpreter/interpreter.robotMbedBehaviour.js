var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "interpreter.aRobotBehaviour", "interpreter.constants", "interpreter.util", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var interpreter_aRobotBehaviour_1 = require("interpreter.aRobotBehaviour");
    var C = require("interpreter.constants");
    var U = require("interpreter.util");
    var $ = require("jquery");
    var RobotMbedBehaviour = /** @class */ (function (_super) {
        __extends(RobotMbedBehaviour, _super);
        function RobotMbedBehaviour() {
            var _this = _super.call(this) || this;
            _this.hardwareState.motors = {};
            _this.neuralNetwork = {}; //TODO es kann sein, dass man mehrere Neuronale Netze hat - also muss das hier angepasst werden.
            U.loggingEnabled(true, true);
            return _this;
        }
        RobotMbedBehaviour.prototype.getSample = function (s, name, sensor, port, mode) {
            var robotText = 'robot: ' + name + ', port: ' + port + ', mode: ' + mode;
            U.debug(robotText + ' getsample from ' + sensor);
            var sensorName = sensor;
            if (sensorName == C.TIMER) {
                s.push(this.timerGet(port));
            }
            else if (sensorName == C.ENCODER_SENSOR_SAMPLE) {
                s.push(this.getEncoderValue(mode, port));
            }
            else {
                s.push(this.getSensorValue(sensorName, port, mode));
            }
        };
        RobotMbedBehaviour.prototype.getEncoderValue = function (mode, port) {
            var sensor = this.hardwareState.sensors.encoder;
            port = port == C.MOTOR_LEFT ? C.LEFT : C.RIGHT;
            if (port != undefined) {
                var v = sensor[port];
                if (v === undefined) {
                    return "undefined";
                }
                else {
                    return this.rotation2Unit(v, mode);
                }
            }
            return sensor;
        };
        RobotMbedBehaviour.prototype.rotation2Unit = function (value, unit) {
            switch (unit) {
                case C.DEGREE:
                    return value;
                case C.ROTATIONS:
                    return value / 360.0;
                case C.DISTANCE:
                    return value * C.WHEEL_DIAMETER * Math.PI / 360.0;
                default:
                    return 0;
            }
        };
        RobotMbedBehaviour.prototype.getSensorValue = function (sensorName, port, mode) {
            var sensor = this.hardwareState.sensors[sensorName];
            if (sensor === undefined) {
                return "undefined";
            }
            var v;
            if (mode != undefined) {
                if (port != undefined) {
                    v = sensor[port][mode];
                }
                else {
                    v = sensor[mode];
                }
            }
            else if (port != undefined) {
                if (mode === undefined) {
                    v = sensor[port];
                }
            }
            else {
                return sensor;
            }
            if (v === undefined) {
                return false;
            }
            else {
                return v;
            }
        };
        RobotMbedBehaviour.prototype.encoderReset = function (port) {
            U.debug('encoderReset for ' + port);
            this.hardwareState.actions.encoder = {};
            if (port == C.MOTOR_LEFT) {
                this.hardwareState.actions.encoder.leftReset = true;
            }
            else {
                this.hardwareState.actions.encoder.rightReset = true;
            }
        };
        RobotMbedBehaviour.prototype.timerReset = function (port) {
            this.hardwareState.timers[port] = Date.now();
            U.debug('timerReset for ' + port);
        };
        RobotMbedBehaviour.prototype.timerGet = function (port) {
            var now = Date.now();
            var startTime = this.hardwareState.timers[port];
            if (startTime === undefined) {
                startTime = this.hardwareState.timers['start'];
            }
            var delta = now - startTime;
            U.debug('timerGet for ' + port + ' returned ' + delta);
            return delta;
        };
        RobotMbedBehaviour.prototype.ledOnAction = function (name, port, color) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led on color ' + color);
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led.color = color;
        };
        RobotMbedBehaviour.prototype.statusLightOffAction = function (name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led off');
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led.mode = C.OFF;
        };
        RobotMbedBehaviour.prototype.toneAction = function (name, frequency, duration) {
            U.debug(name + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            this.hardwareState.actions.tone = {};
            this.hardwareState.actions.tone.frequency = frequency;
            this.hardwareState.actions.tone.duration = duration;
            this.setBlocking(true);
            return 0;
        };
        RobotMbedBehaviour.prototype.playFileAction = function (file) {
            U.debug('play file: ' + file);
            this.hardwareState.actions.tone = {};
            this.hardwareState.actions.tone.file = file;
            switch (file) {
                case '0':
                    return 1000;
                case '1':
                    return 350;
                case '2':
                    return 700;
                case '3':
                    return 700;
                case '4':
                    return 500;
            }
        };
        RobotMbedBehaviour.prototype.setVolumeAction = function (volume) {
            U.debug('set volume: ' + volume);
            this.hardwareState.actions.volume = Math.max(Math.min(100, volume), 0);
            this.hardwareState.volume = Math.max(Math.min(100, volume), 0);
        };
        RobotMbedBehaviour.prototype.getVolumeAction = function (s) {
            U.debug('get volume');
            s.push(this.hardwareState.volume);
        };
        RobotMbedBehaviour.prototype.setLanguage = function (language) {
            U.debug('set language ' + language);
            this.hardwareState.actions.language = language;
        };
        RobotMbedBehaviour.prototype.sayTextAction = function (text, speed, pitch) {
            if (this.hardwareState.actions.sayText == undefined) {
                this.hardwareState.actions.sayText = {};
            }
            this.hardwareState.actions.sayText.text = text;
            this.hardwareState.actions.sayText.speed = speed;
            this.hardwareState.actions.sayText.pitch = pitch;
            this.setBlocking(true);
            return 0;
        };
        RobotMbedBehaviour.prototype.motorOnAction = function (name, port, duration, speed) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            var durText = duration === undefined ? ' w.o. duration' : (' for ' + duration + ' msec');
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[port] = speed;
            this.hardwareState.motors[port] = speed;
            return 0;
        };
        RobotMbedBehaviour.prototype.motorStopAction = function (name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor stop');
            this.motorOnAction(name, port, 0, 0);
        };
        RobotMbedBehaviour.prototype.driveAction = function (name, direction, speed, distance) {
            var robotText = 'robot: ' + name + ', direction: ' + direction;
            var durText = distance === undefined ? ' w.o. duration' : (' for ' + distance + ' msec');
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            // This is to handle negative values entered in the distance parameter in the drive block
            if ((direction != C.FOREWARD && distance > 0) || (direction == C.FOREWARD && distance < 0) || (direction != C.FOREWARD && !distance)) {
                speed *= -1;
            }
            // This is to handle 0 distance being passed in
            if (distance === 0) {
                speed = 0;
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = speed;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speed;
            this.hardwareState.motors[C.MOTOR_LEFT] = speed;
            this.hardwareState.motors[C.MOTOR_RIGHT] = speed;
            var rotationPerSecond = C.MAX_ROTATION * Math.abs(speed) / 100.0;
            if (rotationPerSecond == 0.0 || distance === undefined) {
                return 0;
            }
            else {
                var rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
                return rotations / rotationPerSecond * 1000;
            }
        };
        RobotMbedBehaviour.prototype.curveAction = function (name, direction, speedL, speedR, distance) {
            var robotText = 'robot: ' + name + ', direction: ' + direction;
            var durText = distance === undefined ? ' w.o. duration' : (' for ' + distance + ' msec');
            U.debug(robotText + ' left motor speed ' + speedL + ' right motor speed ' + speedR + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            // This is to handle negative values entered in the distance parameter in the steer block
            if ((direction != C.FOREWARD && distance > 0) || (direction == C.FOREWARD && distance < 0) || (direction != C.FOREWARD && !distance)) {
                speedL *= -1;
                speedR *= -1;
            }
            // This is to handle 0 distance being passed in
            if (distance === 0) {
                speedR = 0;
                speedL = 0;
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = speedL;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speedR;
            this.hardwareState.motors[C.MOTOR_LEFT] = speedL;
            this.hardwareState.motors[C.MOTOR_RIGHT] = speedR;
            var avgSpeed = 0.5 * (Math.abs(speedL) + Math.abs(speedR));
            var rotationPerSecond = C.MAX_ROTATION * avgSpeed / 100.0;
            if (rotationPerSecond == 0.0 || distance === undefined) {
                return 0;
            }
            else {
                var rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
                return rotations / rotationPerSecond * 1000;
            }
        };
        RobotMbedBehaviour.prototype.turnAction = function (name, direction, speed, angle) {
            var robotText = 'robot: ' + name + ', direction: ' + direction;
            var durText = angle === undefined ? ' w.o. duration' : (' for ' + angle + ' msec');
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            // This is to handle negative values entered in the degree parameter in the turn block 
            if ((direction == C.LEFT && angle < 0) || (direction == C.RIGHT && angle < 0)) {
                speed *= -1;
            }
            // This is to handle an angle of 0 being passed in
            if (angle === 0) {
                speed = 0;
            }
            this.setTurnSpeed(speed, direction);
            var rotationPerSecond = C.MAX_ROTATION * Math.abs(speed) / 100.0;
            if (rotationPerSecond == 0.0 || angle === undefined) {
                return 0;
            }
            else {
                var rotations = C.TURN_RATIO * (Math.abs(angle) / 720.);
                return rotations / rotationPerSecond * 1000;
            }
        };
        RobotMbedBehaviour.prototype.setTurnSpeed = function (speed, direction) {
            if (direction == C.LEFT) {
                this.hardwareState.actions.motors[C.MOTOR_LEFT] = -speed;
                this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speed;
            }
            else {
                this.hardwareState.actions.motors[C.MOTOR_LEFT] = speed;
                this.hardwareState.actions.motors[C.MOTOR_RIGHT] = -speed;
            }
        };
        RobotMbedBehaviour.prototype.driveStop = function (name) {
            U.debug('robot: ' + name + ' stop motors');
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = 0;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = 0;
        };
        RobotMbedBehaviour.prototype.getMotorSpeed = function (s, name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor get speed');
            var speed = this.hardwareState.motors[port];
            s.push(speed);
        };
        RobotMbedBehaviour.prototype.setMotorSpeed = function (name, port, speed) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor speed ' + speed);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[port] = speed;
            this.hardwareState.motors[port] = speed;
        };
        RobotMbedBehaviour.prototype.showTextAction = function (text, mode) {
            var showText = "" + text;
            U.debug('***** show "' + showText + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[mode.toLowerCase()] = showText;
            this.setBlocking(true);
            return 0;
        };
        RobotMbedBehaviour.prototype.showTextActionPosition = function (text, x, y) {
            var showText = "" + text;
            U.debug('***** show "' + showText + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.text = showText;
            this.hardwareState.actions.display.x = x;
            this.hardwareState.actions.display.y = y;
        };
        RobotMbedBehaviour.prototype.showImageAction = function (image, mode) {
            var showImage = "" + image;
            U.debug('***** show "' + showImage + '" *****');
            var imageLen = image.length;
            var duration = 0;
            if (mode == C.ANIMATION) {
                duration = imageLen * 200;
            }
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.picture = image;
            if (mode) {
                this.hardwareState.actions.display.mode = mode.toLowerCase();
            }
            return duration;
        };
        RobotMbedBehaviour.prototype.displaySetBrightnessAction = function (value) {
            U.debug('***** set brightness "' + value + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[C.BRIGHTNESS] = value;
            return 0;
        };
        RobotMbedBehaviour.prototype.lightAction = function (mode, color) {
            U.debug('***** light action mode= "' + mode + ' color=' + color + '" *****');
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led[C.MODE] = mode;
            this.hardwareState.actions.led[C.COLOR] = color;
        };
        RobotMbedBehaviour.prototype.displaySetPixelBrightnessAction = function (x, y, brightness) {
            U.debug('***** set pixel x="' + x + ", y=" + y + ", brightness=" + brightness + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[C.PIXEL] = {};
            this.hardwareState.actions.display[C.PIXEL][C.X] = x;
            this.hardwareState.actions.display[C.PIXEL][C.Y] = y;
            this.hardwareState.actions.display[C.PIXEL][C.BRIGHTNESS] = brightness;
            return 0;
        };
        RobotMbedBehaviour.prototype.displayGetPixelBrightnessAction = function (s, x, y) {
            U.debug('***** get pixel x="' + x + ", y=" + y + '" *****');
            var sensor = this.hardwareState.sensors[C.DISPLAY][C.PIXEL];
            s.push(sensor[y][x]);
        };
        RobotMbedBehaviour.prototype.clearDisplay = function () {
            U.debug('clear display');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.clear = true;
        };
        RobotMbedBehaviour.prototype.writePinAction = function (pin, mode, value) {
            this.hardwareState.actions["pin" + pin] = {};
            this.hardwareState.actions["pin" + pin][mode] = {};
            this.hardwareState.actions["pin" + pin][mode] = value;
        };
        RobotMbedBehaviour.prototype.gyroReset = function (_port) {
            throw new Error("Method not implemented.");
        };
        RobotMbedBehaviour.prototype.getState = function () {
            return this.hardwareState;
        };
        RobotMbedBehaviour.prototype.debugAction = function (value) {
            U.debug('***** debug action "' + value + '" *****');
            console.log(value);
        };
        RobotMbedBehaviour.prototype.assertAction = function (_msg, _left, _op, _right, value) {
            U.debug('***** assert action "' + value + ' ' + _msg + ' ' + _left + ' ' + _op + ' ' + _right + '" *****');
            console.assert(value, _msg + " " + _left + " " + _op + " " + _right);
        };
        RobotMbedBehaviour.prototype.createLinks = function (inputLayer, outputLayer) {
            var links = [];
            var weight = 0;
            for (var inputNodePosition in inputLayer) {
                var inputNode = inputLayer[inputNodePosition];
                for (var outputNodePosition in outputLayer) {
                    var outputNode = outputLayer[outputNodePosition];
                    weight = inputNodePosition == outputNodePosition ? 1 : 0;
                    var link = {
                        "inputNode": inputNode,
                        "outputNode": outputNode,
                        "weight": weight
                    };
                    links.push(link);
                }
            }
            return links;
        };
        RobotMbedBehaviour.prototype.processNeuralNetwork = function (inputLayer, outputLayer) {
            var links;
            if ($.isEmptyObject(this.neuralNetwork)) {
                this.addNodesPosition(inputLayer);
                this.addNodesPosition(outputLayer);
                links = this.createLinks(inputLayer, outputLayer);
                this.neuralNetwork = this.createNeuralNetwork(inputLayer, outputLayer, links);
                this.changeWeight(this.neuralNetwork);
                this.drawNeuralNetwork(this.neuralNetwork);
            }
            else {
                links = this.neuralNetwork.links;
                for (var inputNodeID in inputLayer) {
                    var inputNode = inputLayer[inputNodeID];
                    this.neuralNetwork.inputLayer[inputNodeID].externalSensor = inputNode.externalSensor;
                }
            }
            for (var outputNodePosition in outputLayer) {
                var outputNode = outputLayer[outputNodePosition];
                var speed = 0;
                for (var linkPosition in links) {
                    var link = links[linkPosition];
                    if (outputNode == link.outputNode) {
                        speed = speed + (link.inputNode.externalSensor * link.weight);
                    }
                }
                if (speed > 100) {
                    speed = 100;
                }
                this.setMotorSpeed("ev3", outputNode.port, speed);
            }
        };
        RobotMbedBehaviour.prototype.createNeuralNetwork = function (inputLayer, outputLayer, links) {
            return {
                "inputLayer": inputLayer,
                "outputLayer": outputLayer,
                "links": links
            };
        };
        RobotMbedBehaviour.prototype.changeWeight = function (neuralNetwork) {
            $('#simConfigNeuralNetworkContent').html("");
            for (var linkId in neuralNetwork.links) {
                this.setHandler(neuralNetwork.links[linkId]);
            }
        };
        RobotMbedBehaviour.prototype.setHandler = function (link) {
            //var link = neuralNetwork.links[linkId];
            var div = $('<div style="margin:8px 0; "></div>');
            var range = $('<input type="range" min="0" max="1" value="0" step="0.1" />');
            div.append(range);
            $('#simConfigNeuralNetworkContent').append(div);
            range.change(function (e) {
                e.preventDefault();
                //$('#range').html(this.val());
                link.weight = $(this).val();
                e.stopPropagation();
            });
        };

        RobotMbedBehaviour.prototype.addNodesPosition = function(layer) {
            var i = 0;
            for (var nodePosition in layer) {
                var node = layer[nodePosition];
                node.position = i;
                i++;
            }
        }

        RobotMbedBehaviour.prototype.drawNeuralNetwork = function(neuralNetwork) {
            $('#simConfigNeuralNetworkSVG').html("");
            var div = $('<div style="margin:8px 0; "></div>');
            var svg = $('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 250"></svg>');
            var positionX1 = 50;
            var positionX2 = 120;
            this.drawLinks(neuralNetwork.links, positionX1, positionX2, svg);
            this.drawLayer(neuralNetwork.inputLayer, positionX1, svg);
            this.drawLayer(neuralNetwork.outputLayer, positionX2, svg);
            div.append(svg);
            $('#simConfigNeuralNetworkSVG').append(div);
            $('#simConfigNeuralNetworkSVG').html($('#simConfigNeuralNetworkSVG').html());
        }


        RobotMbedBehaviour.prototype.drawLayer = function(layer, startXPosition, svg) {
            for (const [key,node] of Object.entries( layer )) {
                var nodePosition = node.position;
                var y = 20 + 100 * nodePosition;
                var circle = $('<circle/>')
                    .attr('cx', startXPosition)
                    .attr('cy', y)
                    .attr('r', '20')
                    .attr('fill', 'black')
                svg.append(circle);
            }
        }

        RobotMbedBehaviour.prototype.drawLinks = function (links, positionX1, positionX2, svg) {
            for (var linkID in links) {
                var link = links[linkID];
                var positionY1 = 20 + 100*link.inputNode.position;
                var positionY2 = 20 + 100*link.outputNode.position;
                var strokeWidth = link.weight*4 + 1;
                var style = "stroke:rgb(255,0,0);stroke-width:" + strokeWidth;
                var line = $('<line/>')
                    .attr('x1', positionX1)
                    .attr('y1', positionY1)
                    .attr('x2', positionX2)
                    .attr('y2', positionY2)
                    .attr('style', style)
                svg.append(line);
            }
        }
        //<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
        //<circle cx="50" cy="50" fill="red" r="10"></circle>








        // RobotMbedBehaviour.prototype.drawNeuralNetwork = function(neuralNetwork) {
        //     $('#simConfigNeuralNetworkSVG').html("");
        //     for (var linkId in neuralNetwork.links) {
        //         this.setDrawHandler(neuralNetwork.links[linkId]);
        //     }
        // }
        //
        //
        // RobotMbedBehaviour.prototype.setDrawHandler = function(link) {
        //     var div = $('<div style="margin:8px 0; "></div>');
        //     var x = 50;
        //     var y = 50;
        //     var range = $('<svg xmlns="http://www.w3.org/2000/svg" width="150">\n' +
        //         '<circle cx="' + x +'"cy="' +y +'"r="20" fill="gray"></circle>'+'<line x1="50" y1="50" x2="250" y2="50" style="stroke:rgb(255,0,0);stroke-width:2" />');
        //     div.append(range);
        //     $('#simConfigNeuralNetworkSVG').append(div);
        // }


        RobotMbedBehaviour.prototype.close = function () {
        };
        return RobotMbedBehaviour;
    }(interpreter_aRobotBehaviour_1.ARobotBehaviour));
    exports.RobotMbedBehaviour = RobotMbedBehaviour;
});
