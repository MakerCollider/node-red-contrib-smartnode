/**
 * Copyright 2014, 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


_G_inData  = {};
_G_outData = {};
_G_outDataSets = [];
_G_inMultiData = {};
_G_indata_completed = 0;
_G_outdata_completed = 0;
var collect = module.exports = {
    initStatus: function() {
        _G_indata_completed = 0;
        _G_outdata_completed = 0;
    },
    //indata
    setInDataValue: function(_key,_value) {
        _G_inData[_key] = _value;
    },
    getInDataValue: function(_key) {
        return _G_inData[_key];
    },
    setOutDataValue: function(_key,_value) {
        _G_outData[_key] = _value;
    },
    getOutDataValue: function(_key) {
        return _G_outData[_key];
    },
    setMultiDataValue: function(_key,_value) {
        _G_inMultiData[_key] = _value;
    },
    appendData: function(_objData) {
        _G_outDataSets.push(_objData);
    },

    clearInData: function() {
        _G_inData = {}; 
    },
    clearOutData: function() {
        _G_outData = {};
    },
    clearInMultiData: function() {
        _G_inMultiData = {}; 
    },
    clearAllData: function() {
        _G_inData = {}; 
        _G_outData = {};
        _G_inMultiData = {};
        _G_outDataSets = [];
        _G_indata_completed = 0;
        _G_outdata_completed = 0;
    }
};

