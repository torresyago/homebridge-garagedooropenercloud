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
    this.deviceType = config.deviceType || "relay";  // relay | sensor
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

    if (this.polling) {
        setInterval(this.pollStatus.bind(this), 30000);
        this.pollStatus();
    }
    this.log("[%s] Initializing %s accessory...", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
    getServices: function() { return [this.informationService, this.service]; },

    setTargetState: function(targetState, callback) {
        this.log("[%s] Target state: %s", this.name, targetState);
        const toggleData = { id: this.deviceId, channel: this.channel, auth_key: this.authKey, turn: "toggle" };
        request.post({ url: this.controlCloudURL, form: toggleData }, (err) => {
            if (err) { this.log("[%s] Control error: %s", this.name, err.message); callback(err); return; }
            this.log("[%s] Toggle sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        this.getStatus((err, status) => {
            if (err) { this.log("[%s] Status error: %s", this.name, err.message); callback(err); return; }
            const currentState = (status === true) ? Characteristic.CurrentDoorState.OPEN : Characteristic.CurrentDoorState.CLOSED;
            this.log("[%s] Status: %s -> HomeKit: %s", this.name, status, currentState === 0 ? "OPEN (0)" : "CLOSED (1)");
            callback(null, currentState);
        });
    },

    getStatus: function(callback) {
        const statusData = { channel: this.channel, id: this.deviceId, auth_key: this.authKey };
        request.post({ url: this.statusCloudURL, form: statusData }, (err, response, body) => {
            if (err) { callback(err); return; }
            try {
                const json = JSON.parse(body);
                const ds = json?.data?.device_status;
                
                let status;
                if (this.deviceType === "sensor") {
                    status = ds?.["input:0"]?.state ?? false;
                    this.log("[%s] Sensor input:0.state: %s", this.name, status);
                } else {
                    status = ds?.relays?.[0]?.ison ?? false;
                    this.log("[%s] Relay relays[0].ison: %s", this.name, status);
                }
                callback(null, status);
            } catch (e) {
                this.log("[%s] JSON parse error: %s", this.name, e.message);
                callback(e);
            }
        });
    },

    pollStatus: function() {
        this.getStatus((err, status) => {
            if (!err && status !== undefined) {
                const currentState = (status === true) ? Characteristic.CurrentDoorState.OPEN : Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(currentState);
            }
        });
    }
};
