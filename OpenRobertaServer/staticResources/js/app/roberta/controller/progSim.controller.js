define([ 'exports', 'message', 'log', 'util', 'simulation.simulation', 'guiState.controller', 'tour.controller', 'program.controller', 'program.model',
        'blocks', 'jquery', 'jquery-validate', 'blocks-msg' ], function(exports, MSG, LOG, UTIL, SIM, GUISTATE_C, TOUR_C, PROG_C, PROGRAM, Blockly, $) {

    const INITIAL_WIDTH = 0.5;
    var blocklyWorkspace;

    function init() {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        initEvents();
    }
    exports.init = init;

    function initEvents() {
        $('#simButton').off('click touchend');
        $('#simButton').on('click touchend', function(event) {
            // Workaround for IOS speech synthesis, speech must be triggered once by a button click explicitly before it can be used programmatically
            if (window.speechSynthesis && GUISTATE_C.getRobot().indexOf("ev3") !== -1) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
            }

            toggleSim();
            return false;
        });

        $('#simRobotModal').removeClass("modal-backdrop");
        $('#simControl').onWrap('click', function(event) {
            if (SIM.getNumRobots() == 1) {
                if ($('#simControl').hasClass('typcn-media-play-outline')) {
                    Blockly.hideChaff();
                    var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
                    var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);

                    var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
                    var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
                    var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;

                    var language = GUISTATE_C.getLanguage();

                    PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function(result) {
                        if (result.rc == "ok") {
                            MSG.displayMessage("MESSAGE_EDIT_START", "TOAST", GUISTATE_C.getProgramName());
                            $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                            setTimeout(function() {
                                SIM.setPause(false);
                            }, 500);
                            //                            runNewInterpreter(result)
                            SIM.init([ result ], false, GUISTATE_C.getRobotGroup());
                        } else {
                            MSG.displayInformation(result, "", result.message, "");
                        }
                        PROG_C.reloadProgram(result);
                    });
                } else {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                    SIM.stopProgram();

                }
            } else {
                if ($('#simControl').hasClass('typcn-media-play-outline')) {
                    MSG.displayMessage("MESSAGE_EDIT_START", "TOAST", "multiple simulation");
                    $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                    SIM.run(false, GUISTATE_C.getRobotGroup());
                    setTimeout(function() {
                        SIM.setPause(false);
                    }, 500);
                } else {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                    SIM.stopProgram();
                }
            }
        });
        $('#simImport').onWrap('click', function(event) {
            SIM.importImage();
        }, 'simImport clicked');

        $('#simButtonsCollapse').collapse({
            'toggle' : false
        });
        $('#simRobotModal').removeClass("modal-backdrop");

        $('.simInfo').onWrap('click', function(event) {
            SIM.setInfo();
            $("#simButtonsCollapse").collapse('hide');
        }, 'simInfo clicked');

        $('#simRobot').on('click', function(event) {
            $("#simRobotModal").modal("toggle");
            var robot = GUISTATE_C.getRobot();
            var position = $("#simDiv").position();
            position.top += 12;
            if (robot == 'calliope' || robot == 'microbit') {
                position.left = $("#blocklyDiv").width() + 12;
                $("#simRobotModal").css({
                    top : position.top,
                    left : position.left
                });
            } else {
                position.left += 48;
                $("#simRobotModal").css({
                    top : position.top,
                    left : position.left
                });
            }
            $('#simRobotModal').draggable();
            $("#simButtonsCollapse").collapse('hide');
        });


        $('#simConfigNeuralNetworkModal').draggable();

        $('#simConfigNeuralNetwork').on('click', function (event) {
            var position = $("#simDiv").position();
            position.top += 12;
            $('#simConfigNeuralNetworkModal').modal("toggle");
            $("#simConfigNeuralNetworkModal").css({
                top : position.top,
                right : 12,
                left : 'initial',
                bottom : 'inherit'
            });
            $("#simButtonsCollapse").collapse('hide');
        });

        $('#simConfigRLQLearningModal').draggable();

        $('#simConfigRLQLearning').on('click', function (event) {
            var position = $("#simDiv").position();
            position.top += 12;
            $('#simConfigRLQLearningModal').modal("toggle");
            $("#simConfigRLQLearningModal").css({
                top : position.top,
                right : 12,
                left : 'initial',
                bottom : 'inherit'
            });
            $("#simButtonsCollapse").collapse('hide');

        });

        // $('#simConfigRLQLearningModal').on('shown.bs.modal', function (event) {
        //     file_get_contents("/js/app/simulation/simBackgrounds/marsTopView.svg", function (text) {
        //         drawSVG(text);
        //         new Test().testStart();
        //     });
        // });
        //
        //
        // $('#simConfigRLQLearningModal').on('hidden.bs.modal', function (event) {
        //     clearInterval(timer);
        //     $('#qLearningBackgroundArea').html("");
        // });
        //
        // $('#simConfigRLQLearningModal').on('hide.bs.modal', function (event) {
        //     clearInterval(timer);
        //     $('#qLearningBackgroundArea').html("");
        // });


        $('#simValues').onWrap('click', function(event) {
            $("#simValuesModal").modal("toggle");
            var position = $("#simDiv").position();
            position.top += 12;
            $("#simValuesModal").css({
                top : position.top,
                right : 12,
                left : 'initial',
                bottom : 'inherit'
            });
            $('#simValuesModal').draggable();

            $("#simButtonsCollapse").collapse('hide');
        }, 'simValues clicked');

        $('#simResetPose').onWrap('click', function(event) {
            SIM.resetPose();
        }, 'simResetPose clicked');
    }

    var svg;

    function file_get_contents(uri, callback) {
        fetch(uri).then(res => res.text()).then(text => callback(text));
    }


    function drawSVG(text) {
        $('#qLearningBackgroundArea').html("");
        svg = SVG().addTo('#qLearningBackgroundArea').size(3148/5, 1764/5).viewbox("0 0 3148 1764");
        svg.svg(text);
        svg.find('.cls-customPathColor').stroke({ color: '#fcfcfc', opacity: 0.9, width: 0 });
    }

    const linkIDPrefix = "path-";
    const finishNode = 7;

    const ResultState = {
        "SUCCESS": 1,
        "ERROR" : 2
    }
    Object.freeze(ResultState);

    var timer;

    function generateStatesAndActionsFromSVG(svg, finishNode) {
        var statesAndActions = [];
        var allPathes = svg.find('.cls-customPathColor');
        allPathes.each(function(item) {
            let idName = item.attr("id");
            let tokens = idName.split("-");
            let firstValue = tokens[1]; //0
            let secondValue = tokens[2]; //1
            if(statesAndActions[firstValue] == undefined) {
                statesAndActions[firstValue] = [];
            } else if (secondValue == finishNode) {
                statesAndActions[firstValue][secondValue] = 50;
            } else {
                statesAndActions[firstValue][secondValue] = 0;
            }
        })
        return statesAndActions;
    }

    class Test {

        testStart() {
            var that = this;
            var statesAndActions = generateStatesAndActionsFromSVG(svg, finishNode);
            // var statesAndActions = [
            //     [undefined, 100, undefined, undefined],
            //     [0, undefined, 0, undefined],
            //     [undefined, 0, undefined, 0],
            //     [undefined, undefined, 0, 0]
            // ];
            var problem = new ReinforcementProblem(statesAndActions);
            new QLearningAlgorithm().qLearner(problem, 150, 9007199254740991, 0.1, 0.8, 1, 0.1, that.qLearnerCallback)

        }

        qLearnerCallback (qValueStore, problem) {
            console.log(qValueStore);
            drawOptimalPath(qValueStore.createOptimalPath(0, finishNode, problem));
            hideAllPathsExeptTheOptimal();

            // var learnedImageHTML = $("#Layer_1").parent().html();
            var learnedImageHTML = $("#qLearningBackgroundArea").html();
            //learnedImageHTML =  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="110"> <rect width="300" height="100"  style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" /> </svg>' ;
            var learnedImage = window.btoa(learnedImageHTML);
            var temp = 'data:image/svg+xml;base64,'+learnedImage;
            SIM.updateBackground(9, temp);

        }
    }

    function hideAllPathsExeptTheOptimal() {
        svg.find('.cls-customPathColor').hide();
    }

    function drawOptimalPath(optimalPathResult) {
        if (optimalPathResult.resultState == ResultState.ERROR) {
            console.log("...")
        } else {
            var combinedPath;
            var combinedPathTestPurpose;
            for (var qValue in optimalPathResult.optimalPath) {
                var firstValue = optimalPathResult.optimalPath[parseInt(qValue)];
                var secondValue = optimalPathResult.optimalPath[parseInt(qValue)+1];
                if (secondValue !== null) {

                    try {
                        combinedPathTestPurpose = findPathWithID(svg, firstValue, secondValue);
                        combinedPathTestPurpose.addTo(svg);
                        combinedPathTestPurpose.stroke({width: 20, color: '#1ad274'})

                        if (combinedPath == undefined) {
                            var combinedPath = findPathWithID(svg, firstValue, secondValue);
                        } else {
                            var temp = findPathWithID(svg, firstValue, secondValue).array();
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
            combinedPath.addTo(svg);
            combinedPath.removeClass('cls-customPathColor');
            combinedPath.addClass('pink-flower')
            combinedPath.stroke({width: 13, color: '#ffffff', opacity: 1, linecap: 'round', linejoin: 'round' })
                .fill('none');



            // var pathCopyBlack = combinedPath.clone();
            // pathCopyBlack.addTo(svg);
            // pathCopyBlack.removeClass('cls-customPathColor')
            // pathCopyBlack.addClass('pink-flower')
            // pathCopyBlack.stroke({width: 30, color: '#000000'})
            //     .fill('none');
            // console.log(combinedPath.array())
        }

    }

    function findPathWithID(svg, firstValue, secondValue) {
        var foundPath = svg.findOne('#' + linkIDPrefix + firstValue + "-" + secondValue)
        return foundPath;
    }

    class QLearningAlgorithm {

        qLearner(problem, episodes, timeLimit, alpha, gamma, rho, nu, callback) {
            var qValueStore = new QValueStore(problem.statesAndActions);
            var state = problem.getRandomState();
            var action;
            let previousPath;
            timer = setInterval(function () {
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
                previousPath = findPathWithID(svg, state, newState);
                let pathLength = previousPath.length();
                let direction = state > newState ? -1 : 1;
                previousPath.stroke({color: '#8fdc5d', dasharray: "" + pathLength + ", " + pathLength , dashoffset: "" + (pathLength*direction), width: q*2 + 10});
                previousPath.animate({
                    duration: 100,
                    delay: 0,
                    when: 'now',
                }).attr( "stroke-dashoffset", 0 );
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
            }, 100);
            return qValueStore;
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
                if (action != undefined && availableActions.includes(""+actionIndex) && action > bestActionValue ) {
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

    class OptimalPathResult {
        constructor(optimalPath, resultState) {
            this.optimalPath = optimalPath;
            this.resultState = resultState;
        }

    }














    function toggleSim() {
        if ($('#simButton').hasClass('rightActive')) {
            SIM.cancel();
            $(".sim").addClass('hide');
            $("#simButtonsCollapse").collapse('hide');
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
            $('#blockly').closeRightView(function() {
                $('#menuSim').parent().addClass('disabled');
                $('.nav > li > ul > .robotType').removeClass('disabled');
                $('.' + GUISTATE_C.getRobot()).addClass('disabled');
            });
        } else {
            var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);
            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
            var language = GUISTATE_C.getLanguage();

            PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function(result) {
                if (result.rc == "ok") {
                    SIM.init([ result ], true, GUISTATE_C.getRobotGroup())
                    //                    runNewInterpreter(result);
                    $(".sim").removeClass('hide');
                    $('#simButtonsCollapse').collapse({
                        'toggle' : false
                    });
                    if (TOUR_C.getInstance() && TOUR_C.getInstance().trigger) {
                        TOUR_C.getInstance().trigger('startSim');
                    }
                    $('#blockly').openRightView('sim', INITIAL_WIDTH);
                } else {
                    MSG.displayInformation(result, "", result.message, "");
                }
                PROG_C.reloadProgram(result);
            });
        }
    }

    function callbackOnTermination() {
        GUISTATE_C.setConnectionState("wait");
        blocklyWorkspace.robControls.switchToStart();
    }

    //    function runNewInterpreter(result) {
    //        if (result.rc === "ok") {
    //            var programSrc = result.javaScriptProgram;
    //            var program = JSON.parse(programSrc);
    //            var ops = program.ops;
    //            var functionDeclaration = program.functionDeclaration;
    //            switch (GUISTATE_C.getRobot()) {
    //            case "calliope2017":
    //                interpreter = new SIM_I.Interpreter();
    //                if (interpreter !== null) {
    //                    GUISTATE_C.setConnectionState("busy");
    //                    blocklyWorkspace.robControls.switchToStop();
    //                    try {
    //                        interpreter.run(program, new MBED_N.NativeMbed(), callbackOnTermination);
    //                    } catch (error) {
    //                        interpreter.terminate();
    //                        interpreter = null;
    //                        alert(error);
    //                    }
    //                }
    //                break;
    //            default:
    //                // TODO
    //            }
    //            MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName());
    //        }
    //    }
});
