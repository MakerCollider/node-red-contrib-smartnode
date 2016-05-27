var config = require('./config');
var lwm2mClient = require("lwm2m-node-lib").client;
lwm2mClient.init(config);
var fs = require("fs");
var util = require(__dirname+ "/util.js");

var env = require("./env.js");

function printObject(result) {
    var resourceIds = Object.keys(result.attributes);
    console.log('\nObject:\n--------------------------------\nObjectType: %s\nObjectId: %s\nObjectUri: %s',
        result.objectType, result.objectId, result.objectUri);

    if (resourceIds.length > 0) {
        console.log('\nAttributes:');
        for (var i=0; i < resourceIds.length; i++) {
            console.log('\t-> %s: %s', resourceIds[i], result.attributes[resourceIds[i]]);
        }
        console.log('\n');
    }
}

function handleObjectFunction(error, result) {
    if (error) {
        throw "ERR: " + JSON.stringify(error);
    } else {
        printObject(result);
    }
}

var Edge = function(file) {
    var self = this;
    this.prof = JSON.parse(fs.readFileSync(file));
    this.prof.dev_info.name = this.prof.dev_info.name + (new Date().getTime());
    console.log(JSON.stringify(this.prof));

    this.cbs = {};

    if(!(this.prof["dev_info"] && this.prof.dev_info.id))
        throw "illegal profile";

    this.setInternalChannel();

    for(var sidx in this.prof) {
        if(sidx == "dev_info")
            continue;
        var url = this.service2url(sidx);

        console.log("create " + url);
        lwm2mClient.registry.create(url, handleObjectFunction);

        var service = this.prof[sidx];
        for(var aidx in service) {
            var aid = util.getIdxOfElem(service, aidx);
            lwm2mClient.registry.setResource(url, aid, service[aidx], handleObjectFunction);
        }
        //console.log(url);
    }

    var serv = this.prof.dev_info.lwm2m.server;

    console.log("connect: " + serv.addr + ", " + serv.port + ", " + this.prof.dev_info.name + ", " + "/");

  
    lwm2mClient.register(serv.addr, serv.port, "/", this.prof.dev_info.name, function(error, deviceInfo) {
        if (error) {
            console.log("ERR : " + JSON.stringify(error));
        } else {
            console.log('connected');
            self.deviceInfo = deviceInfo;
            lwm2mClient.setHandler(
                deviceInfo.serverInfo, 
                'write', 
                function(objectType, serviceId, attrId, value, callback){

                    console.log("recv: " + value);
                    console.log('objectType:'+objectType+'serviceId:'+serviceId+'attrId:'+attrId+'value:'+value);

                    // TODO: rewrite below hack codes
                    if(objectType == env.well_known.objectType
                       && serviceId == env.well_known.objectId
                       && attrId == env.well_known.clientInputId) {

                        var obj = JSON.parse(value);

                        console.log("===> " + value);

                        self.set(obj.serviceName, obj.attrName
                            , obj.value, true);

                        var cb = self.cbs['write'];
                        if (cb) {
                            cb(obj.serviceName, obj.attrName, obj.value);                        
                        }

                    } else {
                        return;
                    }
                }
            );

            //var connectCb = self.cbs['connect'];
            //if (connectCb){
            //    connectCb();
            //}
        }        
    });

    
};

Edge.prototype.url2lwm2mAddr = function(url) {
    var str = url.substring(1);
    var numArray = str.split('/');

    if(numArray.length != 3)
        return undefined;

    // checke the device id is valid
    if(numArray[0] != this.prof.dev_info.id)
        return undefined;

    var serviceId = numArray[1];
    var service = util.getElemByIdx(this.prof, numArray[1]);
    var serviceName = util.getElemNameByIdx(this.prof, numArray[1]);

    if(service === undefined)
        return undefined;

    var attrName = util.getElemNameByIdx(service, numArray[2]);

    if(attrName === undefined)
        return undefined;

    return "/" + serviceName + "/" + attrName;
}

Edge.prototype.setInternalChannel = function() {

    // create /12345/0
    lwm2mClient.registry.create(env.well_known.getWellKnownUrl(), handleObjectFunction);

    // set /5555/0/0 "{.......}"
    lwm2mClient.registry.setResource(env.well_known.getWellKnownUrl(), env.well_known.queryId, JSON.stringify(this.prof), handleObjectFunction);


    // set /5555/0/0 "{.......}"
    lwm2mClient.registry.setResource(env.well_known.getWellKnownUrl(), env.well_known.clientInputId, null, handleObjectFunction);

    
    lwm2mClient.registry.setResource(env.well_known.getWellKnownUrl(), env.well_known.clientOutputId, null, handleObjectFunction);    
}

Edge.prototype.name2Id = function(nameArray) {
    var serviceName = nameArray[0];
    var service =this.prof[serviceName];

    if(service === undefined)
        return null;

    var ret = [];

    var serviceId = util.getIdxOfElem(this.prof, serviceName);
    ret.push(serviceId);

    var attrName = nameArray[1];
    if(attrName == undefined)
        return ret;

    var attrId = util.getIdxOfElem(service, attrName);
    if(attrId == -1)
        return ret;

    ret.push(attrId);

    return ret;

}

Edge.prototype.baseUrl = function() {
    return "/" + this.prof.dev_info.id;
}

Edge.prototype.service2url = function(serviceName, attrName) {
    
    var ids = this.name2Id([serviceName, attrName]);
    if(ids === null)
        return null;

    return "/" + this.prof.dev_info.id + "/" + ids.join("/");
}

Edge.prototype.getAttrByUrl = function(url) {
    var split = url.split("/");

    if(url[0] == "/") {
        split.splice(0, 1); 
    }

    var id = parseInt(split[0]);

    if(id != this.prof.dev_info.id) {
        return undefined;
    }

    var sidx = parseInt(split[1]);

    // must specify a service
    if(sidx == undefined)
        return undefined;

    var service = util.getElemByIdx(this.prof, sidx);

    if(service == undefined)
        return undefined;

    var aidx = parseInt(split[2]);
    if(aidx == undefined)
        return service;

    var attr = util.getElemByIdx(service, aidx);
    if(attr == undefined)
        return undefined;

    return attr;

};

Edge.prototype.on = function(event, cb) {
    this.cbs[event] = cb;
}

Edge.prototype.get = function(serviceName, attrName,callback) {
    console.log('get:');
    var service2url = this.service2url(serviceName);
        console.log(this.service2url(serviceName));
    // TODO: fix this unsafe short cut
    //return this.prof.serviceName.attrName;
    lwm2mClient.registry.get(service2url, function(error, result){
        callback(result);
    });
    
}

Edge.prototype.set = function(serviceName, attrName, val, noNotify) {

    var self = this;
    console.log("try to set " + JSON.stringify(arguments));

    //this.prof[serviceName][attrName] = val;

    var url = this.service2url(serviceName);
    if (url == null){
        console.log("can not find serviceName:" + serviceName);
        return;
    }
    var ids = this.name2Id([serviceName, attrName]);

    if(ids.length != 2)
        console.log("can not find /" + serviceName + "/" + attrName);
        return;

    //console.log("set " + url + "  " + JSON.stringify(ids));
    //lwm2mClient.registry.setResource(url, ids[1], val, handleObjectFunction);

    if(noNotify)
        return;

    // dup output
    //objectType, serviceId, attrId, value
    var valObj = {
        serviceName: serviceName,
        attrName: attrName,
        value: val
    };

    console.log("set remote " + env.well_known.getWellKnownUrl() + " " + env.well_known.clientOutputId + " = " + JSON.stringify(valObj));

    lwm2mClient.registry.setResource(
        env.well_known.getWellKnownUrl(),
        env.well_known.clientOutputId,
        JSON.stringify(valObj),
        handleObjectFunction
    );

}

module.exports = Edge;
/*
var edge = new Edge("profile.json");

edge.on('write', function(serviceName, attrName, val){
    console.log("/" + serviceName + "/" + attrName + " => " + val);
});

console.log(edge.service2url("purifier", "pm25aaa"));
console.log(edge.service2url("purifier", "speed"));
console.log(edge.service2url("purifier"));
console.log(edge.getAttrByUrl("/12345/1/1"));
console.log(edge.url2lwm2mAddr("/12345/1/1"));
*/
