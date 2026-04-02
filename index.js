'use strict';

const PLUGIN_NAME   = 'homebridge-garagedooropenercloud';
const PLATFORM_NAME = 'GarageDoorOpenerCloud';

module.exports = (api) => {
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, GarageDoorOpenerCloudPlatform);
};

class GarageDoorOpenerCloudPlatform {
  constructor(log, config, api) {
    this.log         = log;
    this.config      = config;
    this.api         = api;
    this.accessories = new Map(); // uuid → PlatformAccessory

    if (!config) return;

    api.on('didFinishLaunching', () => {
      this._discoverDevices();
    });
  }

  configureAccessory(accessory) {
    this.accessories.set(accessory.UUID, accessory);
  }

  _discoverDevices() {
    let devices = this.config.devices || [];

    // Legacy compatibility: single accessory-style config at platform level
    if (devices.length === 0 && this.config.deviceId && this.config.authKey) {
      this.log.warn(`[${PLATFORM_NAME}] Legacy config detected. Please migrate to the new format with a "devices" array. See README for instructions.`);
      devices = [{
        name:           this.config.name || 'Garage Door',
        deviceId:       this.config.deviceId,
        authKey:        this.config.authKey,
        channel:        this.config.channel,
        deviceType:     this.config.deviceType,
        pollInterval:   this.config.pollInterval,
        polling:        this.config.polling,
        shellyServer:   this.config.shellyServer,
        statusCloudURL: this.config.statusCloudURL,
        cloudBaseURL:   this.config.cloudBaseURL,
        manufacturer:   this.config.manufacturer,
        model:          this.config.model,
      }];
    }

    // Propagate platform-level shellyServer to devices that don't override it
    const platformServer = this.config.shellyServer;
    if (platformServer) {
      devices = devices.map(d => ({ shellyServer: platformServer, ...d }));
    }

    const configuredUUIDs = new Set();

    for (const deviceConfig of devices) {
      if (!deviceConfig.name || !deviceConfig.deviceId || !deviceConfig.authKey) {
        this.log.warn(`[${PLATFORM_NAME}] Skipping device with missing required fields: ${deviceConfig.name || '(unnamed)'}`);
        continue;
      }

      const uuid = this.api.hap.uuid.generate(deviceConfig.name + deviceConfig.deviceId);
      configuredUUIDs.add(uuid);

      let accessory = this.accessories.get(uuid);
      if (accessory) {
        this.log.info(`[${deviceConfig.name}] Restoring cached accessory`);
      } else {
        this.log.info(`[${deviceConfig.name}] Adding new accessory`);
        accessory = new this.api.platformAccessory(deviceConfig.name, uuid);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.set(uuid, accessory);
      }

      new GarageDoorHandler(this.log, deviceConfig, accessory, this.api.hap);
    }

    // Remove accessories no longer in config
    for (const [uuid, accessory] of this.accessories) {
      if (!configuredUUIDs.has(uuid)) {
        this.log.info(`[${accessory.displayName}] Removing stale accessory`);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.delete(uuid);
      }
    }
  }
}

class GarageDoorHandler {
  constructor(log, config, accessory, hap) {
    this.log            = log;
    this.accessory      = accessory;
    this.hap            = hap;
    this.name           = config.name;
    this.deviceId       = config.deviceId;
    this.authKey        = config.authKey;
    this.channel        = config.channel        || 0;
    this.deviceType     = config.deviceType     || 'relay';
    this.pollInterval   = config.pollInterval   || 120;
    this.polling        = config.polling        !== false;
    const base           = (config.shellyServer || 'https://shelly-38-eu.shelly.cloud').replace(/\/$/, '');
    this.statusCloudURL  = config.statusCloudURL  || `${base}/device/status`;
    this.controlCloudURL = config.cloudBaseURL    || `${base}/device/relay/control`;

    const { Service, Characteristic } = hap;

    accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, config.manufacturer || 'Shelly Cloud')
      .setCharacteristic(Characteristic.Model,        config.model        || this.deviceType.toUpperCase())
      .setCharacteristic(Characteristic.SerialNumber,  this.deviceId);

    this.service = accessory.getService(Service.GarageDoorOpener)
      || accessory.addService(Service.GarageDoorOpener, this.name);

    this.service.getCharacteristic(Characteristic.TargetDoorState)
      .onSet((value) => this._setTargetState(value));

    this.service.getCharacteristic(Characteristic.CurrentDoorState)
      .onGet(() => Characteristic.CurrentDoorState.CLOSED);

    this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    this.service.updateCharacteristic(Characteristic.TargetDoorState,  Characteristic.TargetDoorState.CLOSED);

    this.log.info(`[${this.name}] Initialized (${this.deviceType}, poll: ${this.pollInterval}s)`);

    if (this.polling) {
      this._pollStatus();
      setInterval(() => this._pollStatus(), this.pollInterval * 1000);
    }
  }

  async _setTargetState(targetState) {
    const { Characteristic } = this.hap;
    this.log.info(`[${this.name}] Target: ${targetState === Characteristic.TargetDoorState.OPEN ? 'OPEN' : 'CLOSE'}`);

    try {
      const body = new URLSearchParams({
        id:       this.deviceId,
        channel:  this.channel,
        auth_key: this.authKey,
        turn:     'toggle',
      });
      const res = await fetch(this.controlCloudURL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
      });
      this.log.info(`[${this.name}] Toggle → ${res.ok ? 'OK' : res.status}`);
    } catch (e) {
      this.log.error(`[${this.name}] Control error: ${e.message}`);
    }
  }

  async _getStatus() {
    try {
      const body = new URLSearchParams({ id: this.deviceId, auth_key: this.authKey });
      const res  = await fetch(this.statusCloudURL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
        signal:  AbortSignal.timeout(10000),
      });
      if (!res.ok) return false;
      const json = await res.json();
      return json?.data?.device_status?.cloud?.connected === true;
    } catch (e) {
      this.log.error(`[${this.name}] Status error: ${e.message}`);
      return false;
    }
  }

  async _pollStatus() {
    const { Characteristic } = this.hap;
    const randomDelay = Math.floor(Math.random() * 0.3 * this.pollInterval * 1000);

    setTimeout(async () => {
      const isOnline = await this._getStatus();
      const closed   = Characteristic.CurrentDoorState.CLOSED;
      this.service.updateCharacteristic(Characteristic.CurrentDoorState, closed);
      this.service.updateCharacteristic(Characteristic.TargetDoorState,  closed);
      this.log.info(`[${this.name}] Poll: ${isOnline ? 'ONLINE' : 'OFFLINE'} - CLOSED (next: ${this.pollInterval}s)`);
    }, randomDelay);
  }
}
