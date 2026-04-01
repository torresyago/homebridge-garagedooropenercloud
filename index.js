'use strict';

const https = require('https');
const querystring = require('querystring');

var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-garagedooropenercloud', 'GarageDoorOpenerCloud', GarageDoorOpener);
};

function GarageDoorOpener(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.authKey = config.authKey;
    this.channel = config.channel || 0;
    this.deviceType = config.deviceType || 'relay';
    this.pollInterval = config.pollInterval || 120;
    this.polling = config.polling !== false;

    this.statusCloudURL = config.statusCloudURL || 'https://shelly-38-eu.shelly.cloud/device/status';
    this.controlCloudURL = config.cloudBaseURL || 'https://shelly-38-eu.shelly.cloud/device/relay/control';

    this.service = new Service.GarageDoorOpener(this.name);
    this.informationService = new Service.AccessoryInformation();

    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, config.manufacturer || 'Shelly Cloud')
        .setCharacteristic(Characteristic.Model, config.model || this.deviceType.toUpperCase())
        .setCharacteristic(Characteristic.SerialNumber, this.deviceId);

    this.service.getCharacteristic(Characteristic.TargetDoorState)
        .onSet(this.setTargetState.bind(this));

    this.service.getCharacteristic(Characteristic.CurrentDoorState)
        .onGet(() => Characteristic.CurrentDoorState.CLOSED);

    this.service.getCharacteristic(Characteristic.CurrentDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);
    this.service.getCharacteristic(Characteristic.TargetDoorState).setValue(Characteristic.CurrentDoorState.CLOSED);

    if (this.polling) {
        setInterval(this.pollStatus.bind(this), this.pollInterval * 1000);
        this.pollStatus();
    }

    this.log('[%s] Initializing %s accessory... (CLOSED, poll: %ds)', this.name, this.deviceType, this.pollInterval);
}

GarageDoorOpener.prototype = {
    getServices: function() {
        return [this.informationService, this.service];
    },

    setTargetState: function(targetState) {
        this.log('[%s] Target: %s', this.name, targetState === 0 ? 'OPEN' : 'CLOSE');
        const toggleData = {
            id: this.deviceId,
            channel: this.channel,
            auth_key: this.authKey,
            turn: 'toggle',
        };
        const body = querystring.stringify(toggleData);
        const url = new URL(this.controlCloudURL);
        const options = {
            method: 'POST',
            hostname: url.hostname,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        };
        const req = https.request(options, () => {
            this.log('[%s] Toggle sent to Shelly', this.name);
        });
        req.on('error', (err) => { this.log('[%s] Control error: %s', this.name, err.message); });
        req.write(body);
        req.end();
    },

    getStatus: function(callback) {
        const statusData = { id: this.deviceId, auth_key: this.authKey };
        const body = querystring.stringify(statusData);
        const url = new URL(this.statusCloudURL);
        const options = {
            method: 'POST',
            hostname: url.hostname,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
            timeout: 10000,
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    callback(null, json?.data?.device_status?.cloud?.connected === true);
                } catch (e) {
                    callback(null, false);
                }
            });
        });
        req.on('error', () => { callback(null, false); });
        req.on('timeout', () => { req.destroy(); callback(null, false); });
        req.write(body);
        req.end();
    },

    pollStatus: function() {
        const randomDelay = Math.floor(Math.random() * 0.3 * this.pollInterval * 1000);
        setTimeout(() => {
            this.getStatus((err, isOnline) => {
                const closed = Characteristic.CurrentDoorState.CLOSED;
                this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(closed);
                this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(closed);
                this.log('[%s] Poll: %s - CLOSED (next: %ds)', this.name, isOnline ? 'ONLINE' : 'OFFLINE', this.pollInterval);
            });
        }, randomDelay);
    },
};
