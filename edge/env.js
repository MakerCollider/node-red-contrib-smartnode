var Env = {
  "well_known": {
    objectType: "5555",
    objectId: "0",
    queryId: "0",
    clientInputId: "1",
    clientOutputId: "2",
    getWellKnownUrl: function() {
      return "/" + this.objectType + "/" + this.objectId;
    },
    getQueryUrl: function() {
      return this.getWellKnownUrl() + "/" + this.queryId;
    },
    getClientInputUrl: function() {
      return this.getWellKnownUrl() + "/" + this.clientInputId;
    },
    getClientOutputUrl: function() {
      return this.getWellKnownUrl() + "/" + this.clientOutputId;
    }
  }
};

module.exports = Env;
console.log(Env.well_known.getWellKnownUrl());
console.log(Env.well_known.getQueryUrl());
console.log(Env.well_known.getClientInputUrl());
console.log(Env.well_known.getClientOutputUrl());
