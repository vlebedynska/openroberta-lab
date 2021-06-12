

Introduction to Machine Learning with Robots and Playful Learning
================
V. Olari, K. Cvejoski, Ø. Eide: Introduction to machine learning with robots and playful learning. AAAI, 2021.

If you would like to observe the Neural Network Playground and the Q-Learning-Playground in use, please follow this link: www.figshare.com/s/9bf7608f9408ea2f8da8

If you would like to test the extensions, you can install the Open Roberta Lab locally on a Raspberry Pi by downloading the prepared image: www.figshare.com/s/e92bb50916b8556eb603

A detailed feature description and documentation of the Neural Network Playground and Q-Learning-Playground, is available in Chapter 5 of my master’s thesis: https://kups.ub.uni-koeln.de/30727/

The learning materials can be found in the Appendix of the master's thesis.

If you want to get the Neural Network Playground and Q-Learning-Playground up and running, please checkout the Open Roberta Lab source code and then change the branch `master` to the `feature/neuralnetworks` branch. The installation procedure for the Open Roberta Lab is described below.

If you need help, do not hesitate to drop me a line: contact(at)viktoriya-olari.com


Open Roberta Lab
================

### Introduction

The source of the OpenRoberta Lab is stored in the Github repository '[openroberta-lab](https://github.com/OpenRoberta/openroberta-lab)'.

The steps below explain how to get started with the sources. If you just want to run the server locally, please have a look into
the [Wiki - Installation](https://github.com/OpenRoberta/openroberta-lab/wiki/Installation). If you want to contribute, please get in touch with us,
see [Wiki - Community](https://github.com/OpenRoberta/openroberta-lab/wiki/Community), before you start.

After a fresh git clone you get the **openroberta-lab** project folder. It includes almost everything you need to setup and extend your own openrobertalab server.
License information is available in the **docs** folder.

Things you need on your computer:

* Java >= 1.8
* Maven >= 3.2
* Git
* Web browser

If you would like your local server to compile code for the different systems, you need to install additional software (crosscompilers, libraries, ...):

on Ubuntu:
* Arduino based robots
  * `sudo apt-get install libusb-0.1-4`
  * `sudo apt-get install binutils-avr gdb-avr avrdude`
  * install [avr-gcc](http://downloads.arduino.cc/tools/avr-gcc-7.3.0-atmel3.6.1-arduino5-x86_64-pc-linux-gnu.tar.bz2)
* NXT
  * `sudo apt-get install nbc`
* Calliope
  * `sudo apt-get install srecord libssl-dev`
  * install the latest [gcc-arm-none-eabi](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
* micro:bit
  * `pip install uflash` (to install pip run `sudo apt install python-pip`)
* EV3 c4ev3
  * `sudo apt-get install g++-arm-linux-gnueabi`
* Edison
  * `sudo apt-get python` (Python 2 is needed, it is called `python` for Ubuntu 18.04)
 
on Windows:
* Arduino based robots
  * install [avr-gcc](http://downloads.arduino.cc/tools/avr-gcc-7.3.0-atmel3.6.1-arduino5-i686-w64-mingw32.zip)
* Calliope
  * install [gcc-arm-none-eabi](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads)
  * install [srecord](http://srecord.sourceforge.net/)
* micro:bit
  * install Python 3
  * `pip install uflash`
* Edison
  * install Python 2
  
The crosscompiler needs resources to work properly (header files, libraries, ...). These resources change little over time and are stored in the '[ora-cc-rsc](https://github.com/OpenRoberta/ora-cc-rsc)' repository.

Please clone that directory. When the openroberta-lab server is started, you have to supply the path to these resources (see below). If the resources are not available,
everything works fine (writing programs, import, export, creating accounts, etc.), but running programs on real robots doesn't work, because the crosscompiler will fail.

Please also check our wiki for detailed installation instructions, development procedure, coding conventions and further reading. We also use the github issue tracking system.
Please file issues in the main project **openroberta-lab**.

### Fast installation with maven

#### Step 1: Clone the repository and compile

    git clone https://github.com/OpenRoberta/openroberta-lab.git # get the repository
    cd openroberta-lab                                           # cd into repository
    mvn clean install                                            # generate the server

Might take some time. The last lines of a successful build looks like:

    ...
    [INFO] ------------------------------------------------------------------------
    [INFO] BUILD SUCCESS
    [INFO] ------------------------------------------------------------------------
    [INFO] Total time: 02:16 min
    [INFO] Finished at: 2018-01-07T13:05:00+02:00
    [INFO] Final Memory: 60M/540M
    [INFO] ------------------------------------------------------------------------
    
#### Step 2: Make sure you have a database
If you have a fresh clone of the server, make sure that the OpenRobertaServer folder has a subfolder **db-x.y.z** with the database inside, where x.y.z is the current version from the server. The actual server version is found in the pom.xml of the OpenRobertaParent project. If you don't have a database, you can create an empty database with

    ./ora.sh create-empty-db

#### Step 3: Starting your own server instance using a unix-like shell (on either lin* or win*).

    ./ora.sh start-from-git [optional-path-to-crosscompiler-resources] # start the server using the default properties

You can also run `./ora.sh help` to see more commands for administration of the server.

#### Step 4: Accessing your programming environment

Start your browser at [http://localhost:1999](http://localhost:1999)

That's it!

### Importing the Project

You can also import the project into IDE's such as [Eclipse](https://github.com/OpenRoberta/openroberta-lab/wiki/Importing-into-Eclipse) and [IntelliJ](https://github.com/OpenRoberta/openroberta-lab/wiki/Importing-into-IntelliJ)!

### Development notes

You can follow the test status [here](https://travis-ci.org/OpenRoberta/).

Development happens in the [develop](https://github.com/OpenRoberta/openroberta-lab/tree/develop) branch. Please sent PRs against that branch.

    git clone https://github.com/OpenRoberta/openroberta-lab.git
    cd openroberta-lab
    git checkout develop
	
The project OpenRobertaServer contains the server logic, that accesses
* a database with Hibernate-based DAO objects
* plugins for various robots which are supported in OpenRoberta
* services for browser-based clients
* services for robots connected to the lab either by Wifi or USB

The server is made of
* an embedded jetty server exposing REST services
* the services are based on jersey
* JSON (sometimes XML or plain text) is used for data exchange between front, robots and server

Furthermore, the project OpenRobertaServer contains in directory staticResources for the browser client
* HTML and CSS
* Javascript libraries based on jquery and bootstrap for the frontend
  * assertions (DBC), ajax-based server calls (COMM), logging (LOG) and
  * javascript resources for [blockly](https://developers.google.com/blockly)
  * controller and models written in Javascript, which implement the GUI

To run tests, use `mvn test`. Running `mvn clean install` will make a stable, reproducible build with all unit tests executed.

To run the integration tests you have to supply an additional flag: `mvn clean install -PrunIT`.

#### Blockly

We are using Blockly, it is located in a separate repository. The build of the blockly is only done in the OpenRoberta/Blockly project and then copied to the OpenRobertaServer/staticResources. You can not build Blockly in OpenRobertaServer project directly.

#### Have a look at the notes in LICENCE and NOTICE

Build status:

* master [![master](https://travis-ci.org/OpenRoberta/openroberta-lab.svg?branch=master)](https://travis-ci.org/OpenRoberta/openroberta-lab/builds)
* develop [![develop](https://travis-ci.org/OpenRoberta/openroberta-lab.svg?branch=develop)](https://travis-ci.org/OpenRoberta/openroberta-lab/builds)

