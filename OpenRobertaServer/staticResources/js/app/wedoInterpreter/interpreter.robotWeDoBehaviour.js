define(["require", "exports", "interpreter.aRobotBehaviour", "interpreter.constants", "interpreter.util"], function (require, exports, interpreter_aRobotBehaviour_1, C, U) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RobotWeDoBehaviour extends interpreter_aRobotBehaviour_1.ARobotBehaviour {
        constructor(btInterfaceFct, toDisplayFct) {
            super();
            this.wedo = {};
            this.tiltMode = {
                UP: '3.0',
                DOWN: '9.0',
                BACK: '5.0',
                FRONT: '7.0',
                NO: '0.0'
            };
            this.btInterfaceFct = btInterfaceFct;
            this.toDisplayFct = toDisplayFct;
            this.timers = {};
            this.timers['start'] = Date.now();
            U.loggingEnabled(true, true);
        }
        // @ts-ignore
        extractColourChannelAndNormalize(node) {
            throw new Error("Method not implemented.");
        }
        processNeuralNetwork(inputLayer, outputLayer) {
            throw new Error("Method not implemented.");
        }
        createQLearningEnvironment(obstaclesList, startNode, finishNode) {
            throw new Error("Method not implemented.");
        }
        setUpQLearningBehaviour(alpha, gamma, nu, rho) {
            throw new Error("Method not implemented.");
        }
        runQLearner() {
            throw new Error("Method not implemented.");
        }
        drawOptimalPath() {
            throw new Error("Method not implemented.");
        }
        update(data) {
            U.info('update type:' + data.type + ' state:' + data.state + ' sensor:' + data.sensor + ' actor:' + data.actuator);
            if (data.target !== "wedo") {
                return;
            }
            switch (data.type) {
                case "connect":
                    if (data.state == "connected") {
                        this.wedo[data.brickid] = {};
                        this.wedo[data.brickid]["brickname"] = data.brickname.replace(/\s/g, '').toUpperCase();
                        // for some reason we do not get the inital state of the button, so here it is hardcoded
                        this.wedo[data.brickid]["button"] = 'false';
                    }
                    else if (data.state == "disconnected") {
                        delete this.wedo[data.brickid];
                    }
                    break;
                case "didAddService":
                    let theWedoA = this.wedo[data.brickid];
                    if (data.state == "connected") {
                        if (data.id && data.sensor) {
                            theWedoA[data.id] = {};
                            theWedoA[data.id][this.finalName(data.sensor)] = '';
                        }
                        else if (data.id && data.actuator) {
                            theWedoA[data.id] = {};
                            theWedoA[data.id][this.finalName(data.actuator)] = '';
                        }
                        else if (data.sensor) {
                            theWedoA[this.finalName(data.sensor)] = '';
                        }
                        else {
                            theWedoA[this.finalName(data.actuator)] = '';
                        }
                    }
                    break;
                case "didRemoveService":
                    if (data.id) {
                        delete this.wedo[data.brickid][data.id];
                    }
                    else if (data.sensor) {
                        delete this.wedo[data.brickid][this.finalName(data.sensor)];
                    }
                    else {
                        delete this.wedo[data.brickid][this.finalName(data.actuator)];
                    }
                    break;
                case "update":
                    let theWedoU = this.wedo[data.brickid];
                    if (data.id) {
                        if (theWedoU[data.id] === undefined) {
                            theWedoU[data.id] = {};
                        }
                        theWedoU[data.id][this.finalName(data.sensor)] = data.state;
                    }
                    else {
                        theWedoU[this.finalName(data.sensor)] = data.state;
                    }
                    break;
                default:
                    // TODO think about what could happen here.
                    break;
            }
            U.info(this.wedo);
        }
        getConnectedBricks() {
            var brickids = [];
            for (var brickid in this.wedo) {
                if (this.wedo.hasOwnProperty(brickid)) {
                    brickids.push(brickid);
                }
            }
            return brickids;
        }
        getBrickIdByName(name) {
            for (var brickid in this.wedo) {
                if (this.wedo.hasOwnProperty(brickid)) {
                    if (this.wedo[brickid].brickname === name.toUpperCase()) {
                        return brickid;
                    }
                }
            }
            return null;
        }
        getBrickById(id) {
            return this.wedo[id];
        }
        clearDisplay() {
            U.debug('clear display');
            this.toDisplayFct({ "clear": true });
        }
        getSample(s, name, sensor, port, slot) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' getsample called for ' + sensor);
            var sensorName;
            switch (sensor) {
                case "infrared":
                    sensorName = "motionsensor";
                    break;
                case "gyro":
                    sensorName = "tiltsensor";
                    break;
                case "buttons":
                    sensorName = "button";
                    break;
                case C.TIMER:
                    s.push(this.timerGet(port));
                    return;
                default:
                    throw 'invalid get sample for ' + name + ' - ' + port + ' - ' + sensor + ' - ' + slot;
            }
            let wedoId = this.getBrickIdByName(name);
            s.push(this.getSensorValue(wedoId, port, sensorName, slot));
        }
        getSensorValue(wedoId, port, sensor, slot) {
            let theWedo = this.wedo[wedoId];
            let thePort = theWedo[port];
            if (thePort === undefined) {
                thePort = theWedo["1"] !== undefined ? theWedo["1"] : theWedo["2"];
            }
            let theSensor = thePort === undefined ? "undefined" : thePort[sensor];
            U.info('sensor object ' + (theSensor === undefined ? "undefined" : theSensor.toString()));
            switch (sensor) {
                case "tiltsensor":
                    if (slot === "ANY") {
                        return parseInt(theSensor) !== parseInt(this.tiltMode.NO);
                    }
                    else {
                        return parseInt(theSensor) === parseInt(this.tiltMode[slot]);
                    }
                case "motionsensor":
                    return parseInt(theSensor);
                case "button":
                    return theWedo.button === "true";
            }
        }
        finalName(notNormalized) {
            if (notNormalized !== undefined) {
                return notNormalized.replace(/\s/g, '').toLowerCase();
            }
            else {
                U.info("sensor name undefined");
                return "undefined";
            }
        }
        timerReset(port) {
            this.timers[port] = Date.now();
            U.debug('timerReset for ' + port);
        }
        timerGet(port) {
            const now = Date.now();
            var startTime = this.timers[port];
            if (startTime === undefined) {
                startTime = this.timers['start'];
            }
            const delta = now - startTime;
            U.debug('timerGet for ' + port + ' returned ' + delta);
            return delta;
        }
        ledOnAction(name, port, color) {
            var brickid = this.getBrickIdByName(name);
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led on color ' + color);
            const cmd = { 'target': 'wedo', 'type': 'command', 'actuator': 'light', 'brickid': brickid, 'color': color };
            this.btInterfaceFct(cmd);
        }
        statusLightOffAction(name, port) {
            var brickid = this.getBrickIdByName(name);
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led off');
            const cmd = { 'target': 'wedo', 'type': 'command', 'actuator': 'light', 'brickid': brickid, 'color': 0 };
            this.btInterfaceFct(cmd);
        }
        toneAction(name, frequency, duration) {
            var brickid = this.getBrickIdByName(name); // TODO: better style
            const robotText = 'robot: ' + name;
            U.debug(robotText + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            const cmd = { 'target': 'wedo', 'type': 'command', 'actuator': 'piezo', 'brickid': brickid, 'frequency': Math.floor(frequency), 'duration': Math.floor(duration) };
            this.btInterfaceFct(cmd);
            return duration;
        }
        motorOnAction(name, port, duration, speed) {
            var brickid = this.getBrickIdByName(name); // TODO: better style
            const robotText = 'robot: ' + name + ', port: ' + port;
            const durText = duration === undefined ? ' w.o. duration' : (' for ' + duration + ' msec');
            U.debug(robotText + ' motor speed ' + speed + durText);
            const cmd = { 'target': 'wedo', 'type': 'command', 'actuator': 'motor', 'brickid': brickid, 'action': 'on', 'id': port, 'direction': speed < 0 ? 1 : 0, 'power': Math.abs(speed) };
            this.btInterfaceFct(cmd);
            return 0;
        }
        motorStopAction(name, port) {
            var brickid = this.getBrickIdByName(name); // TODO: better style
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor stop');
            const cmd = { 'target': 'wedo', 'type': 'command', 'actuator': 'motor', 'brickid': brickid, 'action': 'stop', 'id': port };
            this.btInterfaceFct(cmd);
        }
        showTextAction(text, _mode) {
            const showText = "" + text;
            U.debug('***** show "' + showText + '" *****');
            this.toDisplayFct({ "show": showText });
            return 0;
        }
        showImageAction(_text, _mode) {
            U.debug('***** show image not supported by WeDo *****');
            return 0;
        }
        displaySetBrightnessAction(_value) {
            return 0;
        }
        displaySetPixelAction(_x, _y, _brightness) {
            return 0;
        }
        writePinAction(_pin, _mode, _value) {
        }
        close() {
            var ids = this.getConnectedBricks();
            for (let id in ids) {
                if (ids.hasOwnProperty(id)) {
                    var name = this.getBrickById(ids[id]).brickname;
                    this.motorStopAction(name, 1);
                    this.motorStopAction(name, 2);
                    this.ledOnAction(name, 99, 3);
                }
            }
        }
        encoderReset(_port) {
            throw new Error("Method not implemented.");
        }
        gyroReset(_port) {
            throw new Error("Method not implemented.");
        }
        lightAction(_mode, _color) {
            throw new Error("Method not implemented.");
        }
        playFileAction(_file) {
            throw new Error("Method not implemented.");
        }
        _setVolumeAction(_volume) {
            throw new Error("Method not implemented.");
        }
        _getVolumeAction(_s) {
            throw new Error("Method not implemented.");
        }
        setLanguage(_language) {
            throw new Error("Method not implemented.");
        }
        sayTextAction(_text, _speed, _pitch) {
            throw new Error("Method not implemented.");
        }
        getMotorSpeed(_s, _name, _port) {
            throw new Error("Method not implemented.");
        }
        setMotorSpeed(_name, _port, _speed) {
            throw new Error("Method not implemented.");
        }
        driveStop(_name) {
            throw new Error("Method not implemented.");
        }
        driveAction(_name, _direction, _speed, _distance) {
            throw new Error("Method not implemented.");
        }
        curveAction(_name, _direction, _speedL, _speedR, _distance) {
            throw new Error("Method not implemented.");
        }
        turnAction(_name, _direction, _speed, _angle) {
            throw new Error("Method not implemented.");
        }
        showTextActionPosition(_text, _x, _y) {
            throw new Error("Method not implemented.");
        }
        displaySetPixelBrightnessAction(_x, _y, _brightness) {
            throw new Error("Method not implemented.");
        }
        displayGetPixelBrightnessAction(_s, _x, _y) {
            throw new Error("Method not implemented.");
        }
        setVolumeAction(_volume) {
            throw new Error("Method not implemented.");
        }
        getVolumeAction(_s) {
            throw new Error("Method not implemented.");
        }
        debugAction(_value) {
            this.showTextAction("> " + _value, undefined);
        }
        assertAction(_msg, _left, _op, _right, _value) {
            if (!_value) {
                this.showTextAction("> Assertion failed: " + _msg + " " + _left + " " + _op + " " + _right, undefined);
            }
        }
    }
    exports.RobotWeDoBehaviour = RobotWeDoBehaviour;
});
