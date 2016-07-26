var config = require(__dirname + '/config'),
    lwm2mServer = require('lwm2m-node-lib').server,
    async = require('async'),
    clUtils = require('command-node'),
    globalServerInfo,
    separator = '\n\n\t';

var util = require("./util.js");
var env = require("./env.js");
var nodeMap = {};
connectStatus = 0;
function getDevInfoFromName(name, cb) {

    if(!cb) {
        console.log("must provide cb of getDevIdFromName");
        return;
    }

    console.log("try to get devinfo");

    lwm2mServer.listDevices(function (error, deviceList) {

        console.log("check name :" + name);

        //console.log("get " + JSON.stringify(deviceList));
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nDevice list:\n----------------------------\n');

            for (var i=0; i < deviceList.length; i++) {
                var dev = deviceList[i];
                if (dev.name == name) {
                    console.log("FOUND id" + JSON.stringify(dev));
                    cb(dev);
                    return;
                } 
            }
            cb(null);
        }
    });
}

function verifyProf(prof) {
    return(prof["dev_info"] && prof["dev_info"]["appKey"] != undefined);
}

function addNode(data) {
    var appKey = data.prof.dev_info.appKey;

    console.log("try to map " + appKey);
    if (nodeMap[appKey] === undefined) {
        nodeMap[appKey] = [];
    } 

    nodeMap[appKey].push(data);

    console.log("update node map of " + data.prof.dev_info.name);
    console.log("--------------------------");
    console.log(JSON.stringify(nodeMap));
    callbackEvent('writelist',JSON.stringify(nodeMap));
}

function handleEdgeObserve(data, value) {
    console.log("observed: " + value + " from " + JSON.stringify(data));
    // TODO: to update node map info
    var appKey = data.appKey;

    var nodes = nodeMap[appKey];

    if (nodes == undefined){
        console.log("node map of " + appKey + " should NOT be null")
        //throw "node map of " + appKey + " should NOT be null";
    }
     
    for(idx in nodes) {
        var node = nodes[idx];
        if (node.devInfo.id == data.devInfoId) {
            //continue; 


        console.log(node.devInfo.id +'=='+ data.devInfoId);
        console.log("update " + value + " to devId:" + data.devInfoId + " " + env.well_known.getClientInputUrl());

        var tempValue = JSON.parse(value);
        tempValue.devInfoId = node.devInfo.id;
        tempValue.profId = data.profId;
        value = JSON.stringify(tempValue); 


        callbackEvent('write',value);
        /*lwm2mServer.write(node.devInfo.id,
                          env.well_known.objectType,
                          env.well_known.objectId,
                          env.well_known.clientInputId,
                          value);*/
            break;
        }
        
    }


}

function setToDevice(devInfoId,value){
    console.log('setToDevice'+devInfoId+'|'+value);
    lwm2mServer.write(devInfoId,
                          env.well_known.objectType,
                          env.well_known.objectId,
                          env.well_known.clientInputId,
                          value);
}

function observeAll(devInfo, prof) {
    console.log("observe: " + env.well_known.getClientOutputUrl());

    lwm2mServer.observe(
        devInfo.id, 
        env.well_known.objectType,
        env.well_known.objectId,  
        env.well_known.clientOutputId, 
        function(value) {
            handleEdgeObserve({
                appKey: prof.dev_info.appKey,
                profId: prof.dev_info.id,
                devInfoId: devInfo.id
            },
            value);
        })
}

function registerNode(name) {
    getDevInfoFromName(name, function(devInfo) {
        if (devInfo == null){
            return;
        }

        lwm2mServer.read(devInfo.id, 
                         env.well_known.objectType, 
                         env.well_known.objectId, 
                         env.well_known.queryId, 
                         function (error, result){

            if (error) {
                console.log("can not read device profile");
                return;
            }

            var prof = JSON.parse(result);
            if (verifyProf(prof)) {
                addNode({"prof": prof, "devInfo": devInfo});
                observeAll(devInfo, prof);
            } else {
                console.log("illegal profile");
            }
        });
    })
}

var cbs = {};
var edgeServer = function() {
   // this.cbs = {};
    var self = this;
    
    if (connectStatus == 0){
        start();
        connectStatus = 2;
    }

    this.set = function(devInfoId,value){  
        setToDevice(devInfoId,value);
    };
};


edgeServer.prototype.on = function(event, cb) {
    console.log('init event '+event);
    cbs[event] = cb;
}

function callbackEvent(event,data){
    var cb = cbs[event];
    if (cb) {
        cb(data);                        
    }  
}


module.exports = edgeServer;


/*====================================================*/

function handleResult(message) {
    return function(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nSuccess: %s\n', message);
            //clUtils.prompt();
            if (message == 'Lightweight M2M Server started'){
                connectStatus = 1;
            }
        }
    };
}

function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    console.log('\nDevice registration:\n----------------------------\n');
    console.log(arguments);
    console.log('Endpoint name: %s\nLifetime: %s\nBinding: %s', endpoint, lifetime, binding);
    registerNode(endpoint);
    //clUtils.prompt();
    callback();
}

function unregistrationHandler(device, callback) {
    console.log('\nDevice unregistration:\n----------------------------\n');
    console.log('Device location: %s', device);
    //clUtils.prompt();
    callback();
}

function setHandlers(serverInfo, callback) {
    globalServerInfo = serverInfo;
    lwm2mServer.setHandler(serverInfo, 'registration', registrationHandler);
    lwm2mServer.setHandler(serverInfo, 'unregistration', unregistrationHandler);
    callback();
}

function start() {
    async.waterfall([
        async.apply(lwm2mServer.start, config.server),
        setHandlers
    ], handleResult('Lightweight M2M Server started'));
}

function stop() {
    if (globalServerInfo) {
        lwm2mServer.stop(globalServerInfo, handleResult('COAP Server stopped.'));
    } else {
        console.log('\nNo server was listening\n');
    }
}

/**
 * Parses a string representing a Resource ID (representing a complete resource ID or a partial one: either the ID of
 * an Object Type or an Object Instance).
 *
 * @param {String} resourceId       Id of the resource.
 * @param {Boolean} incomplete      If present and true, return incomplete resources (Object Type or Instance).
 * @returns {*}
 */
function parseResourceId(resourceId, incomplete) {
    var components = resourceId.split('/'),
        parsed;

    if (incomplete || components.length === 4) {
        parsed = {
            objectType: components[1],
            objectId: components[2],
            resourceId: components[3]
        };
    }

    return parsed;
}

function write(commands) {
    var obj = parseResourceId(commands[1], false);

    if (obj) {
        lwm2mServer.write(
            commands[0],
            obj.objectType,
            obj.objectId,
            obj.resourceId,
            commands[2],
            handleResult('Value written successfully'));
    } else {
        console.log('\nCouldn\'t parse resource URI: ' + commands[1]);
    }
}

function execute(commands) {
    var obj = parseResourceId(commands[1], false);

    if (obj) {
        lwm2mServer.execute(
            commands[0],
            obj.objectType,
            obj.objectId,
            obj.resourceId,
            commands[2],
            handleResult('Command executed successfully'));
    } else {
        console.log('\nCouldn\'t parse resource URI: ' + commands[1]);
    }
}


function discover(commands) {
    lwm2mServer.discover(commands[0], commands[1], commands[2], commands[3], function handleDiscover(error, payload) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nResource attributes:\n----------------------------\n');
            console.log('%s', payload.substr(payload.indexOf(';')).replace(/;/g, '\n').replace('=', ' = '));
            //clUtils.prompt();
        }
    });
}

function parseDiscoveredInstance(payload) {
    var resources = payload.substr(payload.indexOf(',') + 1).replace(/<|>/g, '').split(','),
        instance = {
            resources: resources
        };

    return instance;
}

function parseDiscoveredType(payload) {
    var instances = payload.substr(payload.indexOf(',') + 1).replace(/<|>/g, '').split(','),
        type = {
            instances: instances
        };

    return type;
}

function discoverObj(commands) {
    lwm2mServer.discover(commands[0], commands[1], commands[2], function handleDiscover(error, payload) {
        if (error) {
            clUtils.handleError(error);
        } else {
            var parseLoad = parseDiscoveredInstance(payload);

            console.log('\nObject instance\n----------------------------\n');
            console.log('* Resources:')

            for (var i = 0; i < parseLoad.resources.length; i++) {
                console.log('\t- %s', parseLoad.resources[i]);
            }

            console.log('\n');
            //clUtils.prompt();
        }
    });
}

function discoverType(commands) {
    lwm2mServer.discover(commands[0], commands[1], function handleDiscover(error, payload) {
        if (error) {
            clUtils.handleError(error);
        } else {
            var parseLoad = parseDiscoveredType(payload);

            console.log('\nObject type attributes:\n----------------------------\n');
            console.log('* Instances:')

            for (var i = 0; i < parseLoad.instances.length; i++) {
                console.log('\t- %s', parseLoad.instances[i]);
            }

            console.log('\n');
            //clUtils.prompt();
        }
    });
}

function read(commands) {
    var obj = parseResourceId(commands[1], false);

    if (obj) {
        console.log("read obj: " + JSON.stringify(obj) + JSON.stringify(commands));
        lwm2mServer.read(commands[0], obj.objectType, obj.objectId, obj.resourceId, function (error, result) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nResource read:\n----------------------------\n');
                console.log('Id: %s', commands[1]);
                console.log('Value: %s', result);
                //clUtils.prompt();
            }
        });
    } else {
        console.log('\nCouldn\'t parse resource URI: ' + commands[1]);
    }
}

function listClients(commands) {
    lwm2mServer.listDevices(function (error, deviceList) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nDevice list:\n----------------------------\n');

            for (var i=0; i < deviceList.length; i++) {
                console.log('-> Device Id "%s"', deviceList[i].id);
                console.log('\n%s\n', JSON.stringify(deviceList[i], null, 4));
            }

            //clUtils.prompt();
        }
    });
}

function handleValues(value) {
    console.log('\nGot new value: %s\n', value);
    //clUtils.prompt();
}

/*
function observe(commands) {
    lwm2mServer.observe(commands[0], commands[1], commands[2], commands[3], handleValues, function handleObserve(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nObserver stablished over resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
            //clUtils.prompt();
        }
    });
}
*/

function handleValuesFrom(type, obj, resource, val) {
    console.log(JSON.stringify(arguments));
}

function observe(commands) {
    var str = "function(value) { handleValuesFrom (" + commands[1] + ", " + commands[2] + ", " + commands[3] + ", value); }";

    lwm2mServer.observe(commands[0], 
                        commands[1], 
                        commands[2], 
                        commands[3], 
                        eval("(" + str + ")"), 
                        function handleObserve(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nObserver stablished over resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
            //clUtils.prompt();
        }
    });
}

function parseAttributes(payload) {
    function split(pair) {
        return pair.split('=');
    }

    function group(previous, current) {
        if (current && current.length === 2) {
            previous[current[0]] = current[1];
        }

        return previous;
    }

    return payload.split(',').map(split).reduce(group, {});
}

function writeAttributes(commands) {
    var attributes = parseAttributes(commands[4]);

    if (attributes) {
        lwm2mServer.writeAttributes(commands[0], commands[1], commands[2], commands[3], attributes, function handleObserve(error) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nAttributes wrote to resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
                //clUtils.prompt();
            }
        });
    } else {
        console.log('\nAttributes [%s] written for resource [/%s/%s/%s]\n', commands[4], commands[1], commands[2], commands[3]);
    }
}

function cancelObservation(commands) {
    lwm2mServer.cancelObserver(commands[0], commands[1], commands[2], commands[3], function handleCancel(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nObservation cancelled for resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
        }
    });
}
/*====================================================*/