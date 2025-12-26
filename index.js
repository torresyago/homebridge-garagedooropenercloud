var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};
var Service, Characteristic;
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-garagedooropenercloud", "GarageDoorOpenerCloud", GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || "relay"; // relay | sensor
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;
    this.statusCloudURL = "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = "https://shelly-38-eu.shelly.cloud/device/relay/control";
    
    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();
    
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);
    
    this.service.getCharacteristic(Characteristic.TargetDoorState).on('set', this.setTargetState.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentDoorState).on('get', this.getCurrentState.bind(this));
    
    // Estado inicial SIEMPRE CERRADO
    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    
    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { 
                this.log("[%s] Control error: %s", this.name, err.message); 
                callback(err); 
                return; 
            }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO (1) independientemente del estado real
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        this.log("[%s] Current state query -> HomeKit: CLOSED (1)", this.name);
        callback(null, currentState);
    },

    getStatus: function(callback) {
        const statusData = { 
            channel: this.channel, 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { 
                this.log("[%s] Connection error: %s", this.name, err.message);
                callback(null, false); // Offline pero no error fatal
                return; 
            }
            
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                // SOLO valida que Shelly responde (no lee relays/input)
                if (json && ds) {
                    this.log("[%s] Shelly ONLINE", this.name);
                    callback(null, true); // Online
                } else {
                    this.log("[%s] Shelly OFFLINE (invalid JSON)", this.name);
                    callback(null, false); // Offline
                }
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(null, false); // Offline
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            if (!err) {
                // Estado SIEMPRE CERRADO, solo log de conectividad
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
            }
        });
    }
};

