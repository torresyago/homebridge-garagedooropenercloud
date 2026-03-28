var Service, Characteristic;
const https = require("https");
const querystring = require("querystring");

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
    this.pollInterval = config.pollInterval || 120; // segundos (ANTI-RATE-LIMIT)
    this.polling = config.polling !== false;
    
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
        setInterval(this.pollStatus.bind(this), this.pollInterval * 1000);
        this.pollStatus(); // Primera ejecución
    }
    
    this.log("[%s] Initializing %s accessory... (CLOSED, poll: %ds)", this.name, this.deviceType, this.pollInterval);
}

GarageDoorOpener.prototype = {
    getServices: function() { 
        return [this.informationService, this.service]; 
    },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target: %s", this.name, targetState === 0 ? "OPEN" : "CLOSE");
        const toggleData = { 
            id: this.deviceId, 
            channel: this.channel, 
            auth_key: this.authKey, 
            turn: "toggle" 
        };
        const body = querystring.stringify(toggleData);
        const url = new URL(this.controlCloudURL);
        const options = { method: "POST", hostname: url.hostname, path: url.pathname, headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) } };
        const req = https.request(options, () => {
            this.log("[%s] Toggle sent to Shelly", this.name);
            callback(null);
        });
        req.on("error", (err) => { this.log("[%s] Control error: %s", this.name, err.message); callback(err); });
        req.write(body);
        req.end();
    },

    getCurrentState: function(callback) {
        // SIEMPRE devuelve CERRADO
        callback(null, Characteristic.CurrentDoorState.CLOSED);
    },

    getStatus: function(callback) {
        // FORMATO EXACTO de curls manuales (SIN channel)
        const statusData = { 
            id: this.deviceId, 
            auth_key: this.authKey 
        };
        const body = querystring.stringify(statusData);
        const url = new URL(this.statusCloudURL);
        const options = { method: "POST", hostname: url.hostname, path: url.pathname, headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) }, timeout: 10000 };
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    const cloudConnected = json?.data?.device_status?.cloud?.connected === true;
                    callback(null, cloudConnected);
                } catch (e) {
                    callback(null, false);
                }
            });
        });
        req.on("error", () => { callback(null, false); });
        req.on("timeout", () => { req.destroy(); callback(null, false); });
        req.write(body);
        req.end();
    },

    pollStatus: function() {
        // 🔐 DELAY ALEATORIO ANTI-RATE-LIMIT (0-30% del intervalo)
        const randomDelay = Math.floor(Math.random() * 0.3 * this.pollInterval * 1000);
        setTimeout(() => {
            this.getStatus((err, isOnline) => {
                const currentState = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
                this.log("[%s] Poll: %s - CLOSED (next: %ds)", this.name, isOnline ? "ONLINE" : "OFFLINE", this.pollInterval);
            });
        }, randomDelay);
    }
};

