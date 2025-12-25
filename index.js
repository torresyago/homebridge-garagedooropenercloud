
// index.js (CommonJS)
// Requiere node-fetch v2: "node-fetch": "^2.6.7"

let Service, Characteristic;
const fetch = require("node-fetch"); // v2

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory(
    "homebridge-garagedooropenercloud",
    "GarageDoorOpenerCloud",
    GarageDoorOpener
  );
};

function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

function GarageDoorOpener(log, config) {
  this.log = log;

  // Config básicos
  this.name = config.name;
  this.deviceId = (config.deviceId || "").toLowerCase();
  this.authKey = config.authKey;
  this.channel = Number.isFinite(config.channel) ? config.channel : 0;

  // Tipo: "relay" | "sensor"
  this.deviceType = (config.deviceType || "relay").toLowerCase();

  // Tiempos de movimiento (segundos)
  this.openTime = clamp(Number(config.openTime || 20), 1, 120);
  this.closeTime = clamp(Number(config.closeTime || 20), 1, 120);

  // Polling
  this.polling = config.polling !== false;
  this.pollIntervalMs = clamp(Number(config.pollInterval || 30), 10, 300) * 1000;

  // Logging
  this.debug = config.debug === true;

  // Endpoints (permiten override por config)
  this.statusCloudURL = config.statusCloudURL || "https://shelly-38-eu.shelly.cloud/device/status";
  this.controlCloudURL = config.controlCloudURL || "https://shelly-38-eu.shelly.cloud/device/relay/control";

  // Servicios HomeKit
  this.service = new Service.GarageDoorOpener(this.name);
  this.informationService = new Service.AccessoryInformation()
    .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
    .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
    .setCharacteristic(Characteristic.SerialNumber, this.deviceId);

  // Guardar último Target para no pisarlo en polling
  this.lastTarget = Characteristic.TargetDoorState.CLOSED;

  // Handlers
  this.service.getCharacteristic(Characteristic.TargetDoorState)
    .on("set", this.setTargetState.bind(this));

  this.service.getCharacteristic(Characteristic.CurrentDoorState)
    .on("get", this.getCurrentState.bind(this));

  if (this.polling) {
    setInterval(this.pollStatus.bind(this), this.pollIntervalMs);
    this.pollStatus();
  }

  this.log("[%s] Inicializado (%s)", this.name, this.deviceType);
}

GarageDoorOpener.prototype = {
  getServices() {
    return [this.informationService, this.service];
  },

  async shellyPost(url, form) {
    const params = new URLSearchParams(form);
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "homebridge-garagedooropenercloud/1.0"
      },
      body: params
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json;
  },

  async readStatus() {
    const statusData = { channel: this.channel, id: this.deviceId, auth_key: this.authKey };
    const json = await this.shellyPost(this.statusCloudURL, statusData);
    const ds = json && json.data && json.data.device_status;

    let raw;
    if (this.deviceType === "sensor") {
      raw = ds && ds["input:0"] ? ds["input:0"].state : null;
      if (this.debug) this.log("[%s] Sensor input:0.state=%s", this.name, raw);
      // Sensor: true => puerta CERRADA; false => ABIERTA
      return raw === true ? Characteristic.CurrentDoorState.CLOSED : Characteristic.CurrentDoorState.OPEN;
    } else {
      raw = ds && Array.isArray(ds.relays) ? ds.relays[0] && ds.relays[0].ison : null;
      if (this.debug) this.log("[%s] Relay relays[0].ison=%s", this.name, raw);
      // Relay: ON => interpretamos como ABIERTA; OFF => CERRADA
      return raw === true ? Characteristic.CurrentDoorState.OPEN : Characteristic.CurrentDoorState.CLOSED;
    }
  },

  async setTargetState(targetState, callback) {
    this.lastTarget = targetState;
    try {
      const current = await this.readStatus();
      const wantOpen = (targetState === Characteristic.TargetDoorState.OPEN);
      const isOpen = (current === Characteristic.CurrentDoorState.OPEN);

      if (this.debug) this.log("[%s] Target=%s, Current=%s", this.name, wantOpen ? "OPEN" : "CLOSED", isOpen ? "OPEN" : "CLOSED");

      // Si ya estamos en el estado deseado, no hacemos nada
      if (wantOpen === isOpen) {
        this.service.getCharacteristic(Characteristic.TargetDoorState).updateValue(targetState);
        callback(null);
        return;
      }

      // Comando a Shelly
      const form = { id: this.deviceId, channel: this.channel, auth_key: this.authKey };
      if (this.deviceType === "relay") {
        form.turn = wantOpen ? "on" : "off";
      } else {
        form.turn = "toggle"; // actuamos sobre el relé que acciona la puerta; el estado lo lee el sensor
      }

      // Transición
      this.service.getCharacteristic(Characteristic.CurrentDoorState)
        .updateValue(wantOpen ? Characteristic.CurrentDoorState.OPENING : Characteristic.CurrentDoorState.CLOSING);

      await this.shellyPost(this.controlCloudURL, form);
      this.log("[%s] Comando enviado: %s", this.name, form.turn);

      // Esperar y actualizar estado real
      const ms = (wantOpen ? this.openTime : this.closeTime) * 1000;
      setTimeout(async () => {
        try {
          const now = await this.readStatus();
          this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(now);
        } catch (e) {
          this.log("[%s] Error tras movimiento: %s", this.name, e.message);
        }
      }, ms);

      callback(null);
    } catch (err) {
      this.log("[%s] Control error: %s", this.name, err.message);
      callback(err);
    }
  },

  async getCurrentState(callback) {
    try {
      const current = await this.readStatus();
      this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(current);
      callback(null, current);
    } catch (err) {
      this.log("[%s] Status error: %s", this.name, err.message);
      callback(err);
    }
  },

  async pollStatus() {
    try {
      const current = await this.readStatus();
      this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(current);
      // No tocar Target en polling
    } catch (err) {
      this.log("[%s] Poll error: %s", this.name, err.message);
    }
  }
};

