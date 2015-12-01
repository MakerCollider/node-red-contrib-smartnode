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



digitalPin = {'P0':0,'P1':0,'P2':0,'P3':0,'P4':0,'P5':0,'P6':0,'P7':0,'P8':0,'P9':0,'P10':0,'P11':0,'P12':0,'P13':0};
analogPin = {'P0':0,'P1':0,'P2':0,'P3':0,'P4':0,'P5':0};


var checkPin = module.exports = {
    //DigitalPin
    initDigitalPin: function() {
        for(var key in digitalPin){
            digitalPin[key] = 0;
        } 
    },
    setDigitalPinValue: function(_key,_value) {
        digitalPin[_key] = _value;
    },
    getDigitalPinValue: function(_key) {
        return digitalPin[_key];
    },
    //AnalogPin
    initAnalogPin: function() {
        for(var key in analogPin){
            analogPin[key] = 0;
        }  
    },
    setAnalogPinValue: function(_key,_value) {
        analogPin[_key] = _value;
    },
    getAnalogPinValue: function(_key) {
        return analogPin[_key];
    }
};

