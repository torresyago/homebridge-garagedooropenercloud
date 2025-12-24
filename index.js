var Service, Characteristic;
const packageJson = require("./package.json");
const request = require("request");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory(
        "homebridge-garagedooropenercloud",
        "GarageDoorOpenerCloud",
        GarageDoorOpener
    );
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.config = config;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.openTime = config.openTime || 20;
    this.closeTime = config.closeTime || 20;
    this.polling = config.polling !== false;
    this.debug = config.debug !== false;

    this.statusCloudURL = config.statusCloudURL || "https://shelly-38-eu.shelly.cloud/device/status";
    this.controlCloudURL = config.cloudBaseURL || "https://shelly-38-eu.shelly.cloud/device/relay/control";

    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();

    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, config.manufacturer || "Shelly Cloud")
        .setCharacteristic(Characteristic.Model, config.model || "Garage Door Opener")
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);

    this.service
        .getCharacteristic(Characteristic.TargetDoorState)
        .on('set', this.setTargetState.bind(this));

    this.service
        .getCharacteristic(Characteristic.CurrentDoorState)
        .on('get', this.getCurrentState.bind(this));

    if (this.polling) {
        setInterval(this.pollStatus.bind(this), (config.pollInterval || 30) * 1000);
        this.pollStatus();
    }

    this.log("[%s] Initializing GarageDoorOpener accessory...", this.name);
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

        request.post({
            url: this.controlCloudURL,
            form: toggleData
        }, (err, response, body) => {
            if (err) {
                this.log("[%s] Control error: %s", this.name, err.message);
                callback(err);
                return;
            }
            this.log("[%s] Toggle command sent", this.name);
            callback(null);
        });
    },

    getCurrentState: function(callback) {
        this.getStatus((err, status) => {
            if (err) {
                this.log("[%s] Status error: %s", this.name, err.message);
                callback(err);
                return;
            }

            let currentState;
            if (status === undefined || status === null || status === false) {
                currentState = Characteristic.CurrentDoorState.CLOSED;
                this.log("[%s] Status: %s -> HomeKit: CLOSED (1)", this.name, status || "undefined");
            } else if (status === true) {
                currentState = Characteristic.CurrentDoorState.OPEN;
                this.log("[%s] Status: %s -> HomeKit: OPEN (0)", this.name, status);
            } else {
                currentState = Characteristic.CurrentDoorState.STOPPED;
                this.log("[%s] Status: %s -> HomeKit: STOPPED (4)", this.name, status);
            }
            callback(null, currentState);
        });
    },

    getStatus: function(callback) {
        const statusData = {
            channel: this.channel,
            id: this.deviceId,
            auth_key: this.authKey
        };

        request.post({
            url: this.statusCloudURL,
            form: statusData
        }, (err, response, body) => {
            if (err) {
                callback(err);
                return;
            }

            try {
                const json = JSON.parse(body);
                if (this.debug) {
                    this.log("[%s] FULL JSON: %j", this.name, json);
                }

                // UNIVERSAL SHELLY - Detecta automáticamente
                const ds = json && json.data && json.data.device_status ? json.data.device_status : null;
                let status = false;

                if (ds && ds['input:0'] && ds['input:0'].state !== undefined) {
                    status = ds['input:0'].state;
                    this.log("[%s] Using input:0.state: %s", this.name, status);
                } else if (ds && ds.relays && ds.relays[0] && ds.relays[0].ison !== undefined) {
                    status = ds.relays[0].ison;
                    this.log("[%s] Using relays[0].ison: %s", this.name, status);
                } else if (ds && ds['switch:0'] && ds['switch:0'].output !== undefined) {
                    status = ds['switch:0'].output;
                    this.log("[%s] Using switch:0.output: %s", this.name, status);
                }

                this.log("[%s] FINAL STATUS: %s", this.name, status);
                callback(null, status);

            } catch (parseErr) {
                this.log("[%s] Error parsing status JSON: %s", this.name, parseErr.message);
                callback(parseErr);
            }
        });
    },

    pollStatus: function() {
        if (this.debug) {
            this.log("[%s] Getting status...", this.name);
        }
        this.getStatus((err, status) => {
            if (!err && status !== undefined) {
                const currentState = status === true ? Characteristic.CurrentDoorState.OPEN : Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(currentState);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(
                    currentState === Characteristic.CurrentDoorState.OPEN ? 
                    Characteristic.TargetDoorState.OPEN : Characteristic.TargetDoorState.CLOSED
                );
                this.log("[%s] Status: %s -> HomeKit: %s", this.name, status, 
                    currentState === Characteristic.CurrentDoorState.OPEN ? "OPEN (0)" : "CLOSED (1)");
            }
        });
    }
};
