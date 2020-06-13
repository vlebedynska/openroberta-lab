define(["require", "exports", "simulation.simulation", "interpreter.aRobotBehaviour", "interpreter.constants", "interpreter.util", "jquery", "svgdotjs"], function (require, exports, SIM, interpreter_aRobotBehaviour_1, C, U, $, svgdotjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});

    class RobotMbedBehaviour extends interpreter_aRobotBehaviour_1.ARobotBehaviour {
        constructor(updateBackground) {
            super();
            this.mouseOver = function (line) {
                line.stroke = "rgb(0,255,0)";
            };
            this.hardwareState.motors = {};
            this.updateBackground = updateBackground;
            this.qLearningAlgorithmModule = new QLearningAlgorithmModule(updateBackground);
            this.neuralNetwork = {}; //TODO es kann sein, dass man mehrere Neuronale Netze hat - also muss das hier angepasst werden.
            this.draggingElement = null;
            U.loggingEnabled(true, true);
        }

        getSample(s, name, sensor, port, mode) {
            var robotText = 'robot: ' + name + ', port: ' + port + ', mode: ' + mode;
            U.debug(robotText + ' getsample from ' + sensor);
            var sensorName = sensor;
            if (sensorName == C.TIMER) {
                s.push(this.timerGet(port));
            } else if (sensorName == C.ENCODER_SENSOR_SAMPLE) {
                s.push(this.getEncoderValue(mode, port));
            } else {
                s.push(this.getSensorValue(sensorName, port, mode));
            }
        }

        getEncoderValue(mode, port) {
            const sensor = this.hardwareState.sensors.encoder;
            port = port == C.MOTOR_LEFT ? C.LEFT : C.RIGHT;
            if (port != undefined) {
                const v = sensor[port];
                if (v === undefined) {
                    return "undefined";
                } else {
                    return this.rotation2Unit(v, mode);
                }
            }
            return sensor;
        }

        rotation2Unit(value, unit) {
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
        }

        getSensorValue(sensorName, port, mode) {
            const sensor = this.hardwareState.sensors[sensorName];
            if (sensor === undefined) {
                return "undefined";
            }
            var v;
            if (mode != undefined) {
                if (port != undefined) {
                    v = sensor[port][mode];
                } else {
                    v = sensor[mode];
                }
            } else if (port != undefined) {
                if (mode === undefined) {
                    v = sensor[port];
                }
            } else {
                return sensor;
            }
            if (v === undefined) {
                return false;
            } else {
                return v;
            }
        }

        encoderReset(port) {
            U.debug('encoderReset for ' + port);
            this.hardwareState.actions.encoder = {};
            if (port == C.MOTOR_LEFT) {
                this.hardwareState.actions.encoder.leftReset = true;
            } else {
                this.hardwareState.actions.encoder.rightReset = true;
            }
        }

        timerReset(port) {
            this.hardwareState.timers[port] = Date.now();
            U.debug('timerReset for ' + port);
        }

        timerGet(port) {
            const now = Date.now();
            var startTime = this.hardwareState.timers[port];
            if (startTime === undefined) {
                startTime = this.hardwareState.timers['start'];
            }
            const delta = now - startTime;
            U.debug('timerGet for ' + port + ' returned ' + delta);
            return delta;
        }

        ledOnAction(name, port, color) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led on color ' + color);
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led.color = color;
        }

        statusLightOffAction(name, port) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led off');
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led.mode = C.OFF;
        }

        toneAction(name, frequency, duration) {
            U.debug(name + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            this.hardwareState.actions.tone = {};
            this.hardwareState.actions.tone.frequency = frequency;
            this.hardwareState.actions.tone.duration = duration;
            this.setBlocking(true);
            return 0;
        }

        playFileAction(file) {
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
        }

        setVolumeAction(volume) {
            U.debug('set volume: ' + volume);
            this.hardwareState.actions.volume = Math.max(Math.min(100, volume), 0);
            this.hardwareState.volume = Math.max(Math.min(100, volume), 0);
        }

        getVolumeAction(s) {
            U.debug('get volume');
            s.push(this.hardwareState.volume);
        }

        setLanguage(language) {
            U.debug('set language ' + language);
            this.hardwareState.actions.language = language;
        }

        sayTextAction(text, speed, pitch) {
            if (this.hardwareState.actions.sayText == undefined) {
                this.hardwareState.actions.sayText = {};
            }
            this.hardwareState.actions.sayText.text = text;
            this.hardwareState.actions.sayText.speed = speed;
            this.hardwareState.actions.sayText.pitch = pitch;
            this.setBlocking(true);
            return 0;
        }

        motorOnAction(name, port, duration, speed) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            const durText = duration === undefined ? ' w.o. duration' : (' for ' + duration + ' msec');
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[port] = speed;
            this.hardwareState.motors[port] = speed;
            return 0;
        }

        motorStopAction(name, port) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor stop');
            this.motorOnAction(name, port, 0, 0);
        }

        driveAction(name, direction, speed, distance) {
            const robotText = 'robot: ' + name + ', direction: ' + direction;
            const durText = distance === undefined ? ' w.o. duration' : (' for ' + distance + ' msec');
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
            const rotationPerSecond = C.MAX_ROTATION * Math.abs(speed) / 100.0;
            if (rotationPerSecond == 0.0 || distance === undefined) {
                return 0;
            } else {
                const rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
                return rotations / rotationPerSecond * 1000;
            }
        }

        curveAction(name, direction, speedL, speedR, distance) {
            const robotText = 'robot: ' + name + ', direction: ' + direction;
            const durText = distance === undefined ? ' w.o. duration' : (' for ' + distance + ' msec');
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
            const avgSpeed = 0.5 * (Math.abs(speedL) + Math.abs(speedR));
            const rotationPerSecond = C.MAX_ROTATION * avgSpeed / 100.0;
            if (rotationPerSecond == 0.0 || distance === undefined) {
                return 0;
            } else {
                const rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
                return rotations / rotationPerSecond * 1000;
            }
        }

        turnAction(name, direction, speed, angle) {
            const robotText = 'robot: ' + name + ', direction: ' + direction;
            const durText = angle === undefined ? ' w.o. duration' : (' for ' + angle + ' msec');
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
            const rotationPerSecond = C.MAX_ROTATION * Math.abs(speed) / 100.0;
            if (rotationPerSecond == 0.0 || angle === undefined) {
                return 0;
            } else {
                const rotations = C.TURN_RATIO * (Math.abs(angle) / 720.);
                return rotations / rotationPerSecond * 1000;
            }
        }

        setTurnSpeed(speed, direction) {
            if (direction == C.LEFT) {
                this.hardwareState.actions.motors[C.MOTOR_LEFT] = -speed;
                this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speed;
            } else {
                this.hardwareState.actions.motors[C.MOTOR_LEFT] = speed;
                this.hardwareState.actions.motors[C.MOTOR_RIGHT] = -speed;
            }
        }

        driveStop(name) {
            U.debug('robot: ' + name + ' stop motors');
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = 0;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = 0;
        }

        getMotorSpeed(s, name, port) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor get speed');
            const speed = this.hardwareState.motors[port];
            s.push(speed);
        }

        setMotorSpeed(name, port, speed) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor speed ' + speed);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[port] = speed;
            this.hardwareState.motors[port] = speed;
        }

        showTextAction(text, mode) {
            const showText = "" + text;
            U.debug('***** show "' + showText + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[mode.toLowerCase()] = showText;
            this.setBlocking(true);
            return 0;
        }

        showTextActionPosition(text, x, y) {
            const showText = "" + text;
            U.debug('***** show "' + showText + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.text = showText;
            this.hardwareState.actions.display.x = x;
            this.hardwareState.actions.display.y = y;
        }

        showImageAction(image, mode) {
            const showImage = "" + image;
            U.debug('***** show "' + showImage + '" *****');
            const imageLen = image.length;
            let duration = 0;
            if (mode == C.ANIMATION) {
                duration = imageLen * 200;
            }
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.picture = image;
            if (mode) {
                this.hardwareState.actions.display.mode = mode.toLowerCase();
            }
            return duration;
        }

        displaySetBrightnessAction(value) {
            U.debug('***** set brightness "' + value + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[C.BRIGHTNESS] = value;
            return 0;
        }

        lightAction(mode, color) {
            U.debug('***** light action mode= "' + mode + ' color=' + color + '" *****');
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led[C.MODE] = mode;
            this.hardwareState.actions.led[C.COLOR] = color;
        }

        displaySetPixelBrightnessAction(x, y, brightness) {
            U.debug('***** set pixel x="' + x + ", y=" + y + ", brightness=" + brightness + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[C.PIXEL] = {};
            this.hardwareState.actions.display[C.PIXEL][C.X] = x;
            this.hardwareState.actions.display[C.PIXEL][C.Y] = y;
            this.hardwareState.actions.display[C.PIXEL][C.BRIGHTNESS] = brightness;
            return 0;
        }

        displayGetPixelBrightnessAction(s, x, y) {
            U.debug('***** get pixel x="' + x + ", y=" + y + '" *****');
            const sensor = this.hardwareState.sensors[C.DISPLAY][C.PIXEL];
            s.push(sensor[y][x]);
        }

        clearDisplay() {
            U.debug('clear display');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.clear = true;
        }

        writePinAction(pin, mode, value) {
            this.hardwareState.actions["pin" + pin] = {};
            this.hardwareState.actions["pin" + pin][mode] = {};
            this.hardwareState.actions["pin" + pin][mode] = value;
        }

        gyroReset(_port) {
            throw new Error("Method not implemented.");
        }

        getState() {
            return this.hardwareState;
        }

        debugAction(value) {
            U.debug('***** debug action "' + value + '" *****');
            console.log(value);
        }

        assertAction(_msg, _left, _op, _right, value) {
            U.debug('***** assert action "' + value + ' ' + _msg + ' ' + _left + ' ' + _op + ' ' + _right + '" *****');
            console.assert(value, _msg + " " + _left + " " + _op + " " + _right);
        }

        createLinks(inputLayer, outputLayer) {
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
        }

        processNeuralNetwork(inputLayer, outputLayer) {
            var links;
            if ($.isEmptyObject(this.neuralNetwork)) {
                this.addNodesPosition(inputLayer);
                this.addNodesPosition(outputLayer);
                links = this.createLinks(inputLayer, outputLayer);
                this.neuralNetwork = this.createNeuralNetwork(inputLayer, outputLayer, links);
                //this.changeWeight(this.neuralNetwork);
                this.drawNeuralNetwork(this.neuralNetwork);
            } else {
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
                console.log("Motorspeed" + speed);
            }
        }

        createNeuralNetwork(inputLayer, outputLayer, links) {
            return {
                "inputLayer": inputLayer,
                "outputLayer": outputLayer,
                "links": links
            };
        }

        // changeWeight(neuralNetwork) {
        //     $('#einReglerfuerAlles').html("");
        //     var div = $('<div style="margin:8px 50px; "></div>');
        //     var value = 0;
        //     var range = $('<input type="range" id="myRange" min="0" max="1" value=' + value + ' step="0.05" />');
        //     range.on('input', function () {
        //         $(this).data("link").weight = $(this).val();
        //         var width = $(this).data("link").weight * 4 + 2;
        //         $(this).data("line").stroke({ width: width });
        //     });
        //     div.append(range);
        //     $('#einReglerfuerAlles').append(div);
        //     range.on("mousedown touchstart", function (e) {
        //         e.stopPropagation();
        //     });
        // for (var linkId in neuralNetwork.links) {
        // 	this.setHandler(neuralNetwork.links[linkId]);
        // }
        //}
        // public setHandler(link){
        // 	//var link = neuralNetwork.links[linkId];
        // 	var div = $('<div style="margin:8px 0; "></div>');
        // 	var range = $('<input type="range" min="0" max="1" value="0" step="0.1" />');
        // 	div.append(range);
        // 	$('#simConfigNeuralNetworkContent').append(div);
        // 	range.change(function (e) {
        // 		e.preventDefault();
        // 		//$('#range').html(this.val());
        // 		link.weight = $(this).val();
        // 		e.stopPropagation();
        // 	});
        //
        // }
        addNodesPosition(layer) {
            var i = 0;
            for (var nodePosition in layer) {
                var node = layer[nodePosition];
                node.position = i;
                i++;
            }
        }

        drawNeuralNetwork(neuralNetwork) {
            var that = this;
            //var test = SVG();
            $('#simConfigNeuralNetworkSVG').html('');
            var svg = svgdotjs_1.SVG().addTo('#simConfigNeuralNetworkSVG').size(300, 200);
            svg.mousemove(function (e) {
                e.stopPropagation();
                if (that.draggingElement != null) {
                    that.mousemoved(svg, that, e)

                    var line = $(that.draggingElement).data('line').node;
                    var circleCenter = {"x": that.draggingElement.cx(), "y": that.draggingElement.cy()};
                    var accuracy = 100;
                    var fullWeight = 1;
                    var weight = that.getLengthFromPathStartToPointAndCalculateWeigth(line, circleCenter, accuracy, fullWeight)
                    $($(that.draggingElement).data('line')).data('link').weight = weight;

                    var width = weight * 4 + 2;
                    $(that.draggingElement).data('line').stroke({width: width});

                }
            });
            $(document).mouseup(function (e) {
                if (that.draggingElement != null) {
                    $(that.draggingElement).data('line').stroke('#b5cb5f');
                    that.draggingElement = null;
                    that.speichereStand();
                }

            });
            var positionX1 = 50;
            var positionX2 = 220;
            this.drawLinks(neuralNetwork.links, positionX1, positionX2, svg);
            this.drawLayer(neuralNetwork.inputLayer, positionX1, svg);
            this.drawLayer(neuralNetwork.outputLayer, positionX2, svg);

        }

        drawLayer(layer, startXPosition, svg) {
            for (var nodeID in layer) {
                var node = layer[nodeID];
                var nodePosition = node.position;
                var y = 20 + 70 * nodePosition;
                var circle = svg.circle()
                    .radius(20)
                    .cx(startXPosition)
                    .cy(y)
                    .fill('black');
            }
        }

        drawLinks(links, positionX1, positionX2, svg) {
            let lineAlt;
            for (var linkID in links) {
                var that = this;
                var link = links[linkID];
                var positionY1 = 20 + 70 * link.inputNode.position;
                var positionY2 = 20 + 70 * link.outputNode.position;
                var strokeWidth = link.weight * 4 + 2;
                var colour = '#b5cb5f';
                //var style = "stroke:rgb(255,0,0);stroke-width:" + strokeWidth;
                var line = svg.line(positionX1, positionY1, positionX2, positionY2)
                    .stroke({color: colour, width: strokeWidth})
                    .mouseover(function () {
                        this.stroke('black');
                    })
                    .mouseout(function () {
                        if (lineAlt != this) {
                            this.stroke(colour);
                        }
                    })
                    .click(function () {
                        var link = $(this).data("link");
                        console.log(link);
                        // var regler = $('#myRange');
                        // regler.data("link", link);
                        // regler.data("line", this);
                        // that.changeInputTypeRange(regler);
                        lineAlt = that.changeLineColour(this, lineAlt, null);
                    });
                var pointOnLine = line.node.getPointAtLength(line.node.getTotalLength() * link.weight);
                var circle = svg.circle()
                    .radius(8)
                    .fill('red')
                    .cx(pointOnLine.x + 20) //?
                    .cy(pointOnLine.y)
                    .front() //?
                    .mousedown(function () {
                        console.log("Mouse is down");
                        that.draggingElement = this;
                        lineAlt = that.changeLineColour($(that.draggingElement).data('line').stroke('black'), lineAlt, this);
                    })
                $(circle).data("line", line)
                $(line).data("link", link);
            }
        }

        changeLineColour(line, lineAlt, sliderElement) {
            if (lineAlt != undefined) {
                lineAlt.stroke('#b5cb5f');
                lineAlt.back();
            }
            //line.front();
            sliderElement.front();
            line.stroke('black');
            lineAlt = line;
            return lineAlt;
        }

        changeInputTypeRange(regler) {
            var value = regler.data("link").weight;
            regler.val(value);
        }

        extractColourChannelAndNormalize(node) {
            var colourChannel;
            switch (node.colour) {
                case "R":
                    colourChannel = 0;
                    break;
                case "G":
                    colourChannel = 1;
                    break;
                case "B":
                    colourChannel = 2;
                    break;
                default:
                    throw node.colour + " is not a colour channel. Expected value is 'R', 'G' or 'B'. ";
            }
            var colourChannelValue = node.externalSensor[colourChannel];
            var inputValue = colourChannelValue / 2.55;
            node.externalSensor = inputValue;
        }


        getLengthFromPathStartToPointAndCalculateWeigth(path, point, accuracy, fullWeight) {
            var totalLength = path.getTotalLength();
            var step = totalLength / accuracy;
            var t = 0;
            var currentDistance;
            var minDistanceData = {"t": t, "distance": Number.MAX_VALUE};


            /**
             * <--        totalLength         -->
             * <step> <step> <step> <step> <step>
             * ------|------|------|---*--|------
             *       t-->         cirlceCenter
             *       <--  distance  -->
             *
             */
            for (t = 0; t <= totalLength; t += step) {
                t = this.round(t, 4);
                currentDistance = this.calcDistance(path.getPointAtLength(t), point)
                if (currentDistance < minDistanceData.distance) {
                    minDistanceData = {"t": t, "distance": currentDistance}; //p2 - distance from point at length to circle center
                }
            }
            var weight = minDistanceData.t / step * fullWeight / accuracy;
            return weight;


        }

        round(num, places) {
            var multiplier = Math.pow(10, places);
            return (Math.round(num * multiplier) / multiplier);
        }


        calcDistance(p1, p2) {
            return Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        }


        speichereStand(e) {
            console.log("speichere Stand")
        }

        mousemoved(svg, mbedBehaviour, e) {
            console.log("Start moving!")
            var m = svg.point(e.pageX, e.pageY),
                p = mbedBehaviour.closestPoint($(mbedBehaviour.draggingElement).data("line").node, m);
            //lineTest.attr("x1", p[0]).attr("y1", p[1]).attr("x2", m.x).attr("y2", m.y);
            mbedBehaviour.draggingElement.attr("cx", p[0]).attr("cy", p[1]);
        }


        closestPoint(pathNode, point) {
            var pathLength = pathNode.getTotalLength(),
                precision = 8,
                best,
                bestLength,
                bestDistance = Infinity;

            // linear scan for coarse approximation
            for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
                if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                    best = scan, bestLength = scanLength, bestDistance = scanDistance;
                }
            }
            // binary search for precise estimate
            precision /= 2;
            while (precision > 0.5) {
                var before,
                    after,
                    beforeLength,
                    afterLength,
                    beforeDistance,
                    afterDistance;
                if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                    best = before, bestLength = beforeLength, bestDistance = beforeDistance;
                } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                    best = after, bestLength = afterLength, bestDistance = afterDistance;
                } else {
                    precision /= 2;
                }
            }

            best = [best.x, best.y];
            best.distance = Math.sqrt(bestDistance);
            return best;

            function distance2(p) {
                var dx = p.x - point.x,
                    dy = p.y - point.y;
                return dx * dx + dy * dy;
            }
        }


        //Reinforcement Learning


        createQLearningEnvironment(obstaclesList, startNode, finishNode) {
           return this.qLearningAlgorithmModule.createQLearningEnvironment(obstaclesList, startNode, finishNode);
        }

        setUpQLearningBehaviour(alpha, gamma, nu, rho) {
            this.qLearningAlgorithmModule.setUpQLearningBehaviour(alpha, gamma, nu, rho);
        }

        runQLearner() {
            return this.qLearningAlgorithmModule.runQLearner();
        }

        drawOptimalPath() {
            this.qLearningAlgorithmModule.drawOptimalPath();
        }


        close() {
        }

    }

    exports.RobotMbedBehaviour = RobotMbedBehaviour;
});

class RlUtils {

    static generateStatesAndActionsFromSVG(svg, obstaclesList, finishNode) {
        var statesAndActions = [];
        var allPathes = svg.find('.cls-customPathColor');
        var obstaclesArray = [];
        for (var obstacleItem in obstaclesList) {
            let obstacle = obstaclesList[obstacleItem]
            obstaclesArray.push(obstacle.startNode + "-" + obstacle.finishNode);
        }
        allPathes.each(function (item) {
            let obstaclePresent = false;
            let idName = item.attr("id");
            let tokens = idName.split("-");
            let firstValue = tokens[1]; //0
            let secondValue = tokens[2]; //1
            if (statesAndActions[firstValue] == undefined) {
                statesAndActions[firstValue] = [];
            }
            if (obstaclesArray.includes(firstValue + "-" + secondValue)) {

            } else if (secondValue == finishNode) {
                statesAndActions[firstValue][secondValue] = 50;
            } else {
                statesAndActions[firstValue][secondValue] = 0;
            }
        })
        return statesAndActions;
    }


    static file_get_contents(uri, callback) {
        fetch(uri).then(res => res.text()).then(text => callback(text));
    }


    static hideAllPathsExeptTheOptimal(svg) {
        svg.find('.cls-customPathColor').hide();
    }


    static findPathWithID(svg, firstValue, secondValue) {
        const linkIDPrefix = "path-";
        var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue)
        return foundPath;
    }

}


class QLearningAlgorithmModule {

    constructor(updateBackground) {
        this.svg = undefined;
        this.startNode = undefined;
        this.finishNode = undefined;
        this.statesAndActions = undefined;
        this.problem = undefined;
        this.alpha = undefined;
        this.gamma = undefined;
        this.nu = undefined;
        this.rho = undefined;
        this.qValueStore = undefined;
        this.episodes = 150;
        this.timePerEpisode = 600;
        this.updateBackground = updateBackground;

    }

    createQLearningEnvironment(obstaclesList, startNode, finishNode) {
        this.startNode = startNode;
        this.finishNode = finishNode;
        var path = "/js/app/simulation/simBackgrounds/marsTopView.svg";
        this.loadSVG(path, obstaclesList, finishNode);
        return 1000;
    }


    loadSVG(filePath, obstaclesList, finishNode) {
        var that = this;
        RlUtils.file_get_contents(filePath, function (text) {
            that.drawSVG(text);
            that.statesAndActions = RlUtils.generateStatesAndActionsFromSVG(that.svg, obstaclesList, finishNode);
            that.problem = new ReinforcementProblem(that.statesAndActions);
        });

    }

    drawSVG(text) {
        $('#qLearningBackgroundArea').html("");
        this.svg = SVG().addTo('#qLearningBackgroundArea').size(3148 / 5, 1764 / 5).viewbox("0 0 3148 1764");
        this.svg.svg(text);
        this.svg.find('.cls-customPathColor').stroke({color: '#fcfcfc', opacity: 0.9, width: 0});
    }


    setUpQLearningBehaviour(alpha, gamma, nu, rho) {
        this.alpha = alpha;
        this.gamma = gamma;
        this.nu = nu;
        this.rho = rho;
    }

    learningEnded(qValueStore, problem) {

    }

    runQLearner() {
        this.qValueStore = new QLearningAlgorithm().qLearner(this.svg, this.problem, this.episodes, 9007199254740991, this.alpha, this.gamma, this.rho, this.nu, this.learningEnded)
        return this.episodes * this.timePerEpisode;
    }

    drawOptimalPath() {
        console.log(this.qValueStore);
        var optimalPathResult = this.qValueStore.createOptimalPath(this.startNode, this.finishNode, this.problem);
        this.drawOptimalPathIntern(optimalPathResult);
        var copyOfSVG = this.svg.clone();
        RlUtils.hideAllPathsExeptTheOptimal(copyOfSVG);

        // var learnedImageHTML = $("#Layer_1").parent().html();
        // var learnedImageHTML = $("#qLearningBackgroundArea").html();
        var learnedImageHTML = copyOfSVG.svg();
        //learnedImageHTML =  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="110"> <rect width="300" height="100"  style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" /> </svg>' ;
        var learnedImage = window.btoa(learnedImageHTML);
        var temp = 'data:image/svg+xml;base64,' + learnedImage;
        this.updateBackground(9, temp);

    }

    drawOptimalPathIntern(optimalPathResult) {
        if (optimalPathResult.resultState == ResultState.ERROR) {
            console.log("...")
        } else {
            var combinedPath;
            var combinedPathTestPurpose;
            for (var qValue in optimalPathResult.optimalPath) {
                var firstValue = optimalPathResult.optimalPath[parseInt(qValue)];
                var secondValue = optimalPathResult.optimalPath[parseInt(qValue) + 1];
                if (secondValue !== null) {

                    try {
                        // combinedPathTestPurpose = RlUtils.findPathWithID(this.svg, firstValue, secondValue);
                        // combinedPathTestPurpose.addTo(this.svg);
                        // combinedPathTestPurpose.stroke({width: 20, color: '#1ad274'})

                        if (combinedPath == undefined) {
                            var combinedPath = RlUtils.findPathWithID(this.svg, firstValue, secondValue);
                        } else {
                            var temp = RlUtils.findPathWithID(this.svg, firstValue, secondValue).array();
                            // temp.stroke({linecap: 'round'})
                            temp.splice(0, 1);
                            combinedPath.array().push(...temp)
                            combinedPath.plot(combinedPath.array());
                        }
                    } catch (error) {
                        console.log(combinedPathTestPurpose + " > " + combinedPath);
                    }
                }
            }
            combinedPath.addTo(this.svg);
            combinedPath.removeClass('cls-customPathColor');
            combinedPath.addClass('pink-flower')
            combinedPath.stroke({width: 80, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round'})
                .fill('none');

            var pathCopyBlack = combinedPath.clone();
            pathCopyBlack.addTo(this.svg);
            pathCopyBlack.removeClass('cls-customPathColor')
            pathCopyBlack.addClass('pink-flower')
            pathCopyBlack.stroke({width: 30, color: '#000000'})
                .fill('none');
            console.log(combinedPath.array())
        }

    }
}


//Utils

const ResultState = {
    "SUCCESS": 1,
    "ERROR": 2
}

Object.freeze(ResultState);



class OptimalPathResult {
    constructor(optimalPath, resultState) {
        this.optimalPath = optimalPath;
        this.resultState = resultState;
    }
}

class ReinforcementProblem {

    constructor(statesAndActions) {
        this.statesAndActions = statesAndActions;
        this.states = [];
        for (let state of statesAndActions.keys()) {
            this.states.push(state);
        }
    }

    getRandomState() {
        var indexOfState = Math.floor(Math.random() * this.states.length)
        return this.states[indexOfState];
    }

    getAvailableActions(state) {
        var availableActions = [];
        var actions = this.statesAndActions[state];
        for (var actionIndex in actions) {
            if (actions[actionIndex] !== undefined) {
                availableActions.push(actionIndex);
            }
        }
        return availableActions;
    }

    takeAction(state, action) {
        var actions = this.statesAndActions[state];
        return {
            "reward": actions[action],
            "newState": action
        };
    }

    takeOneOfActions(actions) {
        //TODO Available Actions ?
        return actions[Math.floor(Math.random() * actions.length)];
    }
}


class QValueStore {

    constructor(statesAndActions) {
        this.qMatrix = [];

        for (var statesIndex in statesAndActions) {
            var actions = statesAndActions[statesIndex].slice().fill(0);
            this.qMatrix.push(actions)

        }

    }

    getQValue(state, action) {
        var actions = this.qMatrix[state];
        return actions[action]; //associatedQValue
    }

    getBestAction(state, availableActions) {
        var actionsQMatrix = this.qMatrix[state];
        var bestActionValue = -1;
        var bestAction;
        for (var actionIndex in actionsQMatrix) {
            var action = actionsQMatrix[actionIndex];
            if (action != undefined && availableActions.includes("" + actionIndex) && action > bestActionValue) {
                bestActionValue = actionsQMatrix[actionIndex];
                bestAction = actionIndex
            }
        }
        return bestAction;
    }

    storeQValue(state, action, value) {
        var actions = this.qMatrix[state];
        actions[action] = value; // === this.qMatrix[state][action] = value;
    }

    createOptimalPath(startState, endState, problem) {
        var optimalPath = [startState];
        var currentState = startState;
        var resultState = ResultState.SUCCESS;
        while (currentState !== endState) {
            var nextState = parseInt(this.getBestAction(currentState, problem.getAvailableActions(currentState)));
            currentState = nextState;
            if (optimalPath.includes(currentState)) {
                console.log("Keinen optimalen Pfad von " + startState + " nach " + endState + " gefunden. Zyklus geschlossen bei: " + currentState);
                resultState = ResultState.ERROR;
                break;
            }
            optimalPath.push(nextState);
        }
        return new OptimalPathResult(optimalPath, resultState);
    }
}


class QLearningAlgorithm {

    qLearner(svg, problem, episodes, timeLimit, alpha, gamma, rho, nu, callback) {
        var qValueStore = new QValueStore(problem.statesAndActions);
        var state = problem.getRandomState();
        var action;
        let previousPath;
        var timer = setInterval(function () {
            var startTime = Date.now();
            if (Math.random() < nu) {
                state = problem.getRandomState();
            }
            var actions = problem.getAvailableActions(state);
            if (Math.random() < rho) {
                action = problem.takeOneOfActions(actions);
            } else {
                action = qValueStore.getBestAction(state, actions);
            }
            var rewardAndNewState = problem.takeAction(state, action);
            var reward = rewardAndNewState["reward"];
            var newState = rewardAndNewState["newState"];
            var q = qValueStore.getQValue(state, action);
            var newStateActions = problem.getAvailableActions(newState);
            var maxQ = qValueStore.getQValue(newState, qValueStore.getBestAction(newState, newStateActions));
            q = (1 - alpha) * q + alpha * (reward + gamma * maxQ);
            if (previousPath !== undefined) {
                previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
            }
            previousPath = RlUtils.findPathWithID(svg, state, newState);
            let pathLength = previousPath.length();
            let direction = state > newState ? -1 : 1;
            previousPath.stroke({
                color: '#8fdc5d',
                dasharray: "" + pathLength + ", " + pathLength,
                dashoffset: "" + (pathLength * direction),
                width: q * 2 + 10
            });
            previousPath.animate({
                duration: 400,
                delay: 0,
                when: 'now',
            }).attr("stroke-dashoffset", 0);
            qValueStore.storeQValue(state, action, q);
            console.log("state " + state + " > " + newState + "; reward " + reward + "; q " + q + "; maxQ " + maxQ);
            state = newState;
            timeLimit = timeLimit - (Date.now() - startTime);
            episodes = episodes - 1;
            if (!((timeLimit > 0) && (episodes > 0))) {
                previousPath.stroke({color: '#f8f7f7', dasharray: "0"})
                clearInterval(timer);
                callback(qValueStore, problem);
            }
        }, 500);
        return qValueStore;
    }
}

