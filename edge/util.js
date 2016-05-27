
var Util = {};

Util.getIdxOfElem= function(obj, elem) {

    if(typeof(obj) !== 'object')
        return -1;

    var cnt = 0;
    for(idx in obj) {
        if (idx == elem) {
            return cnt;
        }
        cnt++;
    }

    return -1;
};

Util.getElemByIdx = function(obj, elemIdx) {

    if(typeof(obj) !== 'object')
        return undefined;
    
    var cnt = 0;
    for(idx in obj) {

        if(elemIdx == cnt)
            return obj[idx];

        cnt++;
    }

    return undefined;
}; 

Util.getElemNameByIdx = function(obj, elemIdx) {

    if(typeof(obj) !== 'object')
        return undefined;

    var cnt = 0;
    for(idx in obj) {

        if(elemIdx == cnt)
            return idx;

        cnt++;
    }

    return undefined;  
}

Util.visitAllRes = function(prof, cb) {

    for(var sname in prof) {

        if(sname == "dev_info")
            continue;

        var sidx = this.getIdxOfElem(prof, sname);

        var service = prof[sname];

        for(var rname in service) {
            var ridx = this.getIdxOfElem(service, rname);
            cb(prof.dev_info.id, sidx, ridx);
        }
        //console.log(url);
    }    
}

module.exports = Util;

var prof = {
    "dev_info": {
        "appKey": "abcdefg123456",
        "id": "12345",
        "name": "zliu9",
        "lwm2m" : {
            "server" : {
                "addr": "224.0.0.1",
                "port": "5683"
            }
        }
    },

    "purifier" : {
        "on": 0,
        "pm25": 32,
        "speed": 0,
        "level": 0
    },

    "air_conditioner": {
        "on": 0,
        "temp": 20,
        "mode": "auto"
    }
};

Util.visitAllRes(prof, function(id, sidx, ridx) {
    console.log(id + "/" + sidx + "/" + ridx);
});



