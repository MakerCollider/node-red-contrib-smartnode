/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of iotagent-lwm2m-lib
 *
 * iotagent-lwm2m-lib is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-lwm2m-lib is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-lwm2m-lib.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[contacto@tid.es]
 */
'use strict';

var readline = require('readline'),
    writer = console,
    fs = require('fs'),
    rl;

/**
 * Shows the information of an error in the console.
 *
 * @param {Object} error            Standard error object
 */
function handleError(error) {
    writer.log('\nError:\n--------------------------------\nCode: %s\nMessage: %s\n\n', error.name, error.message);
}

/**
 * Shows the command help created from the commands object.
 *
 * @param {Object} commands         Object containing all the commands available for the interpreter
 */
function showHelp(commands) {
    var keyList = Object.keys(commands);

    writer.log('\n');

    for (var i = 0; i < keyList.length; i++) {
        var parameters = '';

        for (var j = 0; j < commands[keyList[i]].parameters.length; j++) {
            parameters += '<' + commands[keyList[i]].parameters[j] + '> ';
        }

        writer.log('%s %s \n\n%s\n', keyList[i], parameters, commands[keyList[i]].description);
    }
}

/**
 * Executes the given command (the list of words parsed from the command line input) in the context of the commands
 * describe by the object Commands.
 *
 * @param {Object} command          List of strings parsed from the user input
 * @param {Object} commands         Object containing all the commands available for the interpreter
 */
function executeCommander(command, commands) {
    if (command[0] === 'help') {
        showHelp(commands);
    } else if (commands[command[0]]) {
        if (command.length - 1 !== commands[command[0]].parameters.length) {
            writer.log('Wrong number of parameters. Expected: %s', JSON.stringify(commands[command[0]].parameters));
        } else {
            commands[command[0]].handler(command.slice(1));
        }
    } else if (command[0] === '') {
        writer.log('\n');
    } else {
        writer.log('Unrecognized command');
    }
    rl.prompt();
}

/**
 * Creates a function that shows the selected branch (attribute) of the config, formatted with the correct indentation.
 *
 * @param {Object} config           Configuration object
 * @param {String} branch           Branch (attribute) of the configuration object to display
 * @return {Function}               Function that displays the selected branch of the configuration.
 */
function showConfig(config, branch) {
    return function () {
        writer.log('\nConfig:\n--------------------------------\n\n%s', JSON.stringify(config[branch], null, 4));
    };
}

function removeQuotes(item) {
    return item.replace(/"/g, '');
}

function prompt() {
    rl.prompt();
}

/**
 * Initialize the command line client with the given commands and prompt. Each command has the following structure:
 *
 *     'create': {
 *      parameters: ['objectUri'],
 *      description: '\tCreate a new object. The object is specified using the /type/id OMA notation.',
 *      handler: create
 *  }
 *
 * where: the parameters attribute is a list of the needed parameters for the command (if its invoked with a different
 * number of parameters an error will be raised); the description attribute contains the contents that will be shown
 * in the command help; and the handler is the function that will be called when the command is executed.
 *
 * @param {Object} commands         Object containing all the commands of the interpreter indexed by name.
 * @param {String} promptString           Prompt string to shoe in each line
 */
function initialize(commands, promptString) {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.setPrompt(promptString);
    rl.prompt();

    rl.on('line', function (cmd) {
        var groups = cmd.match(/(?:[^\s"]+|"[^"]*")+/g);

        if (groups) {
            executeCommander(groups.map(removeQuotes) || [''], commands);
        } else {
            prompt();
        }
    });
    if (process.argv.length === 3) {
        var lines = fs.readFileSync(process.argv[2], 'utf8').split('\n');

        for (var i in lines) {
            if (lines[i]) {
                rl.write(lines[i] + '\n');
            }
        }
    }
}

function destroy() {
    rl.close();
}

function printName(name) {
    return function () {
        writer.log('Executing: %s', name);
        rl.prompt();
    };
}

function notImplemented() {
    writer.log('This feature has not been fully implemented yet.');
    rl.prompt();
}

function setWriter(newWriter) {
    writer = newWriter;
}

exports.prompt = prompt;
exports.showHelp = showHelp;
exports.executeCommander = executeCommander;
exports.showConfig = showConfig;
exports.initialize = initialize;
exports.destroy = destroy;
exports.printName = printName;
exports.notImplemented = notImplemented;
exports.handleError = handleError;
exports.setWriter = setWriter;
