import { ARobotBehaviour } from "interpreter.aRobotBehaviour";
import { State } from "interpreter.state";
import * as C from "interpreter.constants";
import * as U from "interpreter.util";
import * as $ from "jquery";
import {QLearningAlgorithmModule} from "interpreter.svgPlayground/ts/aiReinforcementLearningModule";
import {AiNeuralNetworkModule} from "./aiNeuralNetworkModule/source/aiNeuralNetworkModule";
import {Node} from "./aiNeuralNetworkModule/source/models";

export class RobotMbedBehaviour extends ARobotBehaviour {

	private neuralNetworkModule: AiNeuralNetworkModule;
	private readonly updateBackground: Function;
	private readonly simSetPause: Function;
	private qLearningAlgorithmModule: QLearningAlgorithmModule;
	private promise;
	private clearingDisplay: boolean;

	constructor(updateBackground, simSetPause: Function) {
		super();
		this.hardwareState.motors = {};
		this.neuralNetworkModule = null;
		this.updateBackground = updateBackground;
		this.simSetPause = simSetPause;
		this.qLearningAlgorithmModule = null;
		this.clearingDisplay = false;


		this.neuralNetwork = {}; //TODO es kann sein, dass man mehrere Neuronale Netze hat - also muss das hier angepasst werden.
		this.promise = undefined;
		U.loggingEnabled(true, false);
	}


	public getSample(s: State, name: string, sensor: string, port: any, mode: string) {
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

	private getEncoderValue(mode: string, port: string) {
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

	private rotation2Unit(value: number, unit: string): number {
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

	private getSensorValue(sensorName: string, port: string, mode: string): any {
		const sensor = this.hardwareState.sensors[sensorName];
		if (sensor === undefined) {
			return "undefined";
		}
		var v: string;
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

	public encoderReset(port: string) {
		U.debug('encoderReset for ' + port);
		this.hardwareState.actions.encoder = {};
		if (port == C.MOTOR_LEFT) {
			this.hardwareState.actions.encoder.leftReset = true;
		}
		else {
			this.hardwareState.actions.encoder.rightReset = true;
		}
	}

	public timerReset(port: number) {
		this.hardwareState.timers[port] = Date.now();
		U.debug('timerReset for ' + port);
	}

	public timerGet(port: number) {
		const now = Date.now();
		var startTime = this.hardwareState.timers[port];
		if (startTime === undefined) {
			startTime = this.hardwareState.timers['start'];
		}
		const delta = now - startTime;
		U.debug('timerGet for ' + port + ' returned ' + delta);
		return delta;
	}

	public ledOnAction(name: string, port: number, color: number) {
		const robotText = 'robot: ' + name + ', port: ' + port;
		U.debug(robotText + ' led on color ' + color);
		this.hardwareState.actions.led = {};
		this.hardwareState.actions.led.color = color;
	}

	public 	statusLightOffAction(name: string, port: number) {
		const robotText = 'robot: ' + name + ', port: ' + port;
		U.debug(robotText + ' led off');
		this.hardwareState.actions.led = {};
		this.hardwareState.actions.led.mode = C.OFF;

	}

	public toneAction(name: string, frequency: number, duration: number): number {
		U.debug(name + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
		this.hardwareState.actions.tone = {};
		this.hardwareState.actions.tone.frequency = frequency;
		this.hardwareState.actions.tone.duration = duration;
		this.setBlocking(true);
		return 0;
	}

	public playFileAction(file: string): number {
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

	public setVolumeAction(volume: number): void {
		U.debug('set volume: ' + volume);
		this.hardwareState.actions.volume = Math.max(Math.min(100, volume), 0);
		this.hardwareState.volume = Math.max(Math.min(100, volume), 0);
	}

	public getVolumeAction(s: State): void {
		U.debug('get volume');
		s.push(this.hardwareState.volume);
	}

	public setLanguage(language: string): void {
		U.debug('set language ' + language);
		this.hardwareState.actions.language = language;
	}

	public sayTextAction(text: string, speed: number, pitch: number): number {
		if (this.hardwareState.actions.sayText == undefined) {
			this.hardwareState.actions.sayText = {};
		}
		this.hardwareState.actions.sayText.text = text;
		this.hardwareState.actions.sayText.speed = speed;
		this.hardwareState.actions.sayText.pitch = pitch;
		this.setBlocking(true);
		return 0;
	}

	public motorOnAction(name: string, port: any, duration: number, speed: number): number {
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

	public motorStopAction(name: string, port: any) {
		const robotText = 'robot: ' + name + ', port: ' + port;
		U.debug(robotText + ' motor stop');
		this.motorOnAction(name, port, 0, 0);

	}

	public driveAction(name: string, direction: string, speed: number, distance: number): number {
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

	public curveAction(name: string, direction: string, speedL: number, speedR: number, distance: number): number {
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
		const avgSpeed = 0.5 * (Math.abs(speedL) + Math.abs(speedR))
		const rotationPerSecond = C.MAX_ROTATION * avgSpeed / 100.0;
		if (rotationPerSecond == 0.0 || distance === undefined) {
			return 0;
		} else {
			const rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
			return rotations / rotationPerSecond * 1000;
		}
	}

	public turnAction(name: string, direction: string, speed: number, angle: number): number {
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

	private setTurnSpeed(speed: number, direction: string): void {
		if (direction == C.LEFT) {
			this.hardwareState.actions.motors[C.MOTOR_LEFT] = -speed;
			this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speed;
		} else {
			this.hardwareState.actions.motors[C.MOTOR_LEFT] = speed;
			this.hardwareState.actions.motors[C.MOTOR_RIGHT] = -speed;
		}
	}

	public driveStop(name: string): void {
		U.debug('robot: ' + name + ' stop motors');
		if (this.hardwareState.actions.motors == undefined) {
			this.hardwareState.actions.motors = {};
		}
		this.hardwareState.actions.motors[C.MOTOR_LEFT] = 0;
		this.hardwareState.actions.motors[C.MOTOR_RIGHT] = 0;
	}

	public getMotorSpeed(s: State, name: string, port: any): void {
		const robotText = 'robot: ' + name + ', port: ' + port;
		U.debug(robotText + ' motor get speed');
		const speed = this.hardwareState.motors[port];
		s.push(speed);
	}

	public setMotorSpeed(name: string, port: any, speed: number): void {
		const robotText = 'robot: ' + name + ', port: ' + port;
		U.debug(robotText + ' motor speed ' + speed);
		if (this.hardwareState.actions.motors == undefined) {
			this.hardwareState.actions.motors = {};
		}
		this.hardwareState.actions.motors[port] = speed;
		this.hardwareState.motors[port] = speed;
	}

	public showTextAction(text: any, mode: string): number {
		const showText = "" + text;
		U.debug('***** show "' + showText + '" *****');
		this.hardwareState.actions.display = {};
		this.hardwareState.actions.display[mode.toLowerCase()] = showText;
		this.setBlocking(true);
		return 0;
	}

	public showTextActionPosition(text: any, x: number, y: number, replaceText: boolean = false): void {
		const showText = "" + text;
		U.debug('***** show "' + showText + '" *****');
		this.hardwareState.actions.display = {};
		this.hardwareState.actions.display.text = showText;
		this.hardwareState.actions.display.x = x;
		this.hardwareState.actions.display.y = y;
		if (replaceText) {
			this.hardwareState.actions.display.clear = replaceText;
		}
	}

	public showImageAction(image: any, mode: string): number {
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

	public displaySetBrightnessAction(value: number): number {
		U.debug('***** set brightness "' + value + '" *****');
		this.hardwareState.actions.display = {};
		this.hardwareState.actions.display[C.BRIGHTNESS] = value;
		return 0;
	}

	public lightAction(mode: string, color: string): void {
		U.debug('***** light action mode= "' + mode + ' color=' + color + '" *****');
		this.hardwareState.actions.led = {};
		this.hardwareState.actions.led[C.MODE] = mode;
		this.hardwareState.actions.led[C.COLOR] = color;
	}

	public displaySetPixelBrightnessAction(x: number, y: number, brightness: number): number {
		U.debug('***** set pixel x="' + x + ", y=" + y + ", brightness=" + brightness + '" *****');
		this.hardwareState.actions.display = {};
		this.hardwareState.actions.display[C.PIXEL] = {};
		this.hardwareState.actions.display[C.PIXEL][C.X] = x;
		this.hardwareState.actions.display[C.PIXEL][C.Y] = y;
		this.hardwareState.actions.display[C.PIXEL][C.BRIGHTNESS] = brightness;
		return 0;
	}

	public displayGetPixelBrightnessAction(s: State, x: number, y: number): void {
		U.debug('***** get pixel x="' + x + ", y=" + y + '" *****');
		const sensor = this.hardwareState.sensors[C.DISPLAY][C.PIXEL];
		s.push(sensor[y][x]);
	}

	public clearDisplay(): void {
		U.debug('clear display');
		this.hardwareState.actions.display = {};
		this.hardwareState.actions.display.clear = true;
	}

	public writePinAction(pin: any, mode: string, value: number): void {
		this.hardwareState.actions["pin" + pin] = {};
		this.hardwareState.actions["pin" + pin][mode] = {};
		this.hardwareState.actions["pin" + pin][mode] = value;
	}

	public gyroReset(_port: number): void {
		throw new Error("Method not implemented.");
	}


	public getState(): any {
		return this.hardwareState;
	}

	public debugAction(value: any): void {
		U.debug('***** debug action "' + value + '" *****');
		console.log(value);
	}

	public assertAction(_msg: string, _left: any, _op: string, _right: any, value: boolean): void {
		U.debug('***** assert action "' + value + ' ' + _msg + ' ' + _left + ' ' + _op + ' ' + _right + '" *****');
		console.assert(value, _msg + " " + _left + " " + _op + " " + _right);
	}



	public processNeuralNetwork(inputLayer, outputLayer) {

		if ($.isEmptyObject(this.neuralNetworkModule)) {
			this.neuralNetworkModule = new AiNeuralNetworkModule("#simConfigNeuralNetworkSVG", inputLayer, outputLayer);

			this.neuralNetworkModule.player.isPlaying = true;

			let that = this;
			this.neuralNetworkModule.player.addEventListener("pause", function () {
				that.setBlocking(true);
				that.simSetPause(true);
				that.neuralNetworkModule.player.isPlaying = false;
			})
			this.neuralNetworkModule.player.addEventListener("play", function () {
				that.setBlocking(false);
				that.simSetPause(false);
				that.neuralNetworkModule.player.isPlaying = true;
			});
		}
		//set new Values in InputLayer
		if (!this.neuralNetworkModule.player.isPlaying) {
			return;
		}

		let aiNeuralNetworkInputLayer = this.neuralNetworkModule.aiNeuralNetwork.getInputLayer();
		for (let nodeID in inputLayer) {
			let node: Node = inputLayer[nodeID];
			if (aiNeuralNetworkInputLayer[nodeID].value !== node.value) {
				aiNeuralNetworkInputLayer[nodeID].value = node.value;
			}
		}

		//calculates new network nodes values
		this.neuralNetworkModule.calculateNeuralNetworkOutput();


		//set motor speed according to the new values
		this.clearDisplay();

		let value = 0;
		let textLines: Array<string> = new Array<string>();
		let textLinesPrepared: Array<string> = new Array<string>();
		let ledPrepared: string = "";
		for (let node2 of this.neuralNetworkModule.aiNeuralNetwork.getOutputLayer() ) {

			switch (node2.type) {
				case "motorport":
					if ( node2.value > 100) {
						value = 100;
					} else {
						value = node2.value;
					}
					this.setMotorSpeed("ev3", node2.port, value);
					console.log("Motorspeed" + value);
					break;
				case "text" :
					let textOutput = node2.value > 0 ? node2.name : "leer";
					textLines.push(textOutput);
					textLinesPrepared.push("<tspan x='1' dy='" + (node2.positionY*16+1) + "'>"+textOutput + "</tspan>");
					break;
				case "sound":
					if (node2.value > 0) {
						this.toneAction("outputNodeTon", node2.value*5, node2.duration);
					}
					break;
				case "LED":
					this.statusLightOffAction("ev3", 0);
					if (node2.value > 0) {
						ledPrepared = node2.color;
					}
					break;
			}

		}
		if (textLinesPrepared.length > 0) {
				this.showTextActionPosition( textLinesPrepared.join(""), 0, 0, true);
		}
		if (ledPrepared != "") {
			this.lightAction("on", ledPrepared);
		}

	}

	private static delay(ms) {
		 return new Promise(resolve => setTimeout(resolve, ms));
	}


	public changeInputTypeRange(regler) {
		//var value = slider.value;
		var value = regler.data("link").weight;
		//var line = document.getElementById("testLine");
		regler.val(value);
	}

	public mouseOver = function(line) {
		line.stroke = "rgb(0,255,0)";
	}

	public extractColourChannelAndNormalize(node) {
		var colourChannel;
		switch (node.color) {
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
				throw node.color + " is not a colour channel. Expected value is 'R', 'G' or 'B'. ";
		}
		var colourChannelValue = node.value[colourChannel];
		var inputValue = colourChannelValue/2.55;
		node.value = inputValue;
	}


	extractBasicColoursAndNormalize(node) {
		if (node.value == node.color) {
			node.value = 100;
		} else {
			node.value = 0;
		}
	}




	//Reinforcement Learning

	createQLearningEnvironment(obstaclesList, startNode, finishNode, map) {

		let path = null;
		switch (map) {
			case "MAP_RAILWAY":
				path = "/js/app/simulation/simBackgrounds/Eisenbahn_Design_End.svg";
				break
			case "MAP_FOREST" :
				path = "/js/app/simulation/simBackgrounds/_Wald_Labyrinth_End.svg";
				break;
			case "MAP_CITY":
				path = "/js/app/simulation/simBackgrounds/_Stadt_End.svg";
				break;
		}

		this.qLearningAlgorithmModule =
			new QLearningAlgorithmModule(
				this.updateBackground,
				"#qLearningBackgroundArea",
				$('#simConfigRLQLearningModal'),
				{width: 800, height: 800},
				path
			);

		this.promise = this.qLearningAlgorithmModule.createQLearningEnvironment(obstaclesList, startNode, finishNode);
		return 0;
	}

	setUpQLearningBehaviour(alpha, gamma, nu, rho) {
		// this.promise = this.qLearningAlgorithmModule.setUpQLearningBehaviour(alpha, gamma, nu, rho)

		this.promise = this.promise.then(r => {
			return this.qLearningAlgorithmModule.setUpQLearningBehaviour(alpha, gamma, nu, rho);
		});
	}

	runQLearner(episodes: number, time: number) {
		// this.promise = this.qLearningAlgorithmModule.runQLearner(episodes, time);
		this.setBlocking(true)

		this.promise = this.promise.then( resolve => {
			return this.qLearningAlgorithmModule.runQLearner(episodes, time);
		});

		// this.promise.then(resolve => {this.setBlocking(true);} )
			// this.setBlocking(true);
			// .then(resolve => )
	}

	drawOptimalPath() {
		this.promise
			.then(resolve => this.qLearningAlgorithmModule.drawOptimalPath())
			.then(() => {
				this.setBlocking(false);
			})
	}

	public close() {
	}
}
