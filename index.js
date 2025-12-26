var Service, Characteristic;
const request = require("request");  // ← SOLO UNA VEZ al inicio

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
    this.deviceType = config.deviceType || "relay";
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
        this.pollStatus();
    }
    
    this.log("[%s] Initializing %s accessory... (initial state: CLOSED)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { return [this.informationService, this.service]; },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState === 0 ? "OPEN" : "CLOSED");
        const toggleData = { id: this.deviceId, channel: this.channel, auth_key: this.authKey, turn: "toggle" };
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { this.log("[%s] Control error: %s", this.name, err.message); callback(err); return; }
            this.log("[%s] Toggle sent to Shelly", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        const currentState = Characteristic.CurrentDoorState.CLOSED;
        callback(null, currentState);
    },


getStatus: function(callback) {
    const statusData = { 
        id: this.deviceId,      // ← Solo ID (sin channel/turn)
        auth_key: this.authKey 
    };
    
    request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
        if (err) { 
            this.log("[%s] Connection error: %s", this.name, err.message);
            callback(null, false);
            return; 
        }
        
        try {
            const json = JSON.parse(body);
            const cloudStatus = json?.data?.device_status?.cloud;
            
            // ✅ Detecta TODAS las variantes de tus Shelly
            const isCloudConnected = cloudStatus?.connected === true || 
                                   cloudStatus?.enabled === true;
            
            if (isCloudConnected) {
                this.log("[%s] Shelly CLOUD CONNECTED ✓", this.name);
                callback(null, true);
            } else {
                this.log("[%s] CLOUD OFFLINE: %s", this.name, JSON.stringify(cloudStatus || 'no cloud data'));
                callback(null, false);
            }
        } catch (e) {
            this.log("[%s] JSON error: %s", this.name, body.substring(0, 100));
            callback(null, false);
        }
    });
},




    pollStatus: function() {
        this.getStatus((err, isOnline) => {
            const currentState = Characteristic.CurrentDoorState.CLOSED;
            this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
            this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
            this.log("[%s] Poll: %s - State: CLOSED", this.name, isOnline ? "ONLINE" : "OFFLINE");
        });
    }
};

