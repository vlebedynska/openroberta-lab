define(["require", "exports", "interpreter.aRobotBehaviour", "interpreter.constants", "interpreter.util"], function (require, exports, interpreter_aRobotBehaviour_1, C, U) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RobotWeDoBehaviourTest extends interpreter_aRobotBehaviour_1.ARobotBehaviour {
        constructor(opLog, debug) {
            super();
            this.timers = {};
            this.timers['start'] = Date.now();
            U.loggingEnabled(opLog, debug);
        }
        extractColourChannelAndNormalize(node) {
            throw new Error("Method not implemented.");
        }
        processNeuralNetwork(inputLayer, outputLayer) {
            throw new Error("Method not implemented.");
        }
        clearDisplay() {
            U.debug('clear display');
        }
        getSample(s, name, sensor, port, mode) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' getsample from ' + sensor);
            switch (sensor) {
                case "infrared":
                    s.push(5);
                    break;
                case "gyro":
                    s.push(3);
                    break;
                case "buttons":
                    s.push(true);
                    break;
                case C.TIMER:
                    s.push(this.timerGet(port));
                    break;
                default:
                    throw 'invalid get sample for ' + name + ' - ' + port + ' - ' + sensor + ' - ' + mode;
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
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' led on color ' + color);
        }
        statusLightOffAction(name, port) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' led off');
        }
        toneAction(name, frequency, duration) {
            const robotText = 'robot: ' + name;
            U.info(robotText + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            return duration;
        }
        motorOnAction(name, port, duration, speed) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            const durText = duration === undefined ? ' w.o. duration' : (' for ' + duration + ' msec');
            U.info(robotText + ' motor speed ' + speed + durText);
            return 0;
        }
        motorStopAction(name, port) {
            const robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' motor stop');
        }
        showTextAction(text) {
            const showText = "" + text;
            U.info('show "' + showText + '"');
            return 0;
        }
        writePinAction(_pin, _mode, _value) {
        }
        showImageAction(_1, _2) {
            U.info('show image NYI');
            return 0;
        }
        displaySetBrightnessAction(_value) {
            return 0;
        }
        displaySetPixelAction(_x, _y, _brightness) {
            return 0;
        }
        close() {
            // CI implementation. No real robot. No motor off, etc.
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
            const robotText = "> " + _value;
            U.info(' debug action ' + robotText);
        }
        assertAction(_msg, _left, _op, _right, _value) {
            const robotText = "> Assertion failed: " + _msg + " " + _left + " " + _op + " " + _right;
            U.info(' assert action ' + robotText);
        }
    }
    exports.RobotWeDoBehaviourTest = RobotWeDoBehaviourTest;
});
