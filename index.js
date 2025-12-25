
// index.js — Homebridge Garage Door Opener Cloud (CommonJS, modo simulación)
// Node >= 18 usa fetch nativo; Node < 18 hace dynamic import de node-fetch.
// Estados HomeKit simulados: la puerta arranca CERRADA y solo reporta transiciones
// OPENING → OPEN → CLOSING → CLOSED al abrir/cerrar. El polling únicamente verifica disponibilidad.

let Service, Characteristic;

// --- FETCH COMPATIBLE ---
// Usa fetch nativo si existe; si no, dynamic import de node-fetch (ESM) incluso en CommonJS.
const fetch = globalThis.fetch
  ? globalThis.fetch.bind(globalThis)
  : ((...args) => import("node-fetch").then(m => m.default(...args)));

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory(
    "homebridge-garagedooropenercloud",  // nombre del paquete
    "GarageDoorOpenerCloud",             // pluginAlias (DEBE coincidir con package.json)
    GarageDoorOpener
  );
};

// Utilidades
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function GarageDoorOpener(log, config) {
  this.log = log;

  // --- Config base ---
  this.name = config.name || "Garage Door";
  this.deviceId = (config.deviceId || "").toLowerCase();
  this.authKey = config.authKey;
  this.deviceType = (config.deviceType || "relay").toLowerCase(); // "relay" | "sensor"
  this.channel = Number.isFinite(config.channel) ? config.channel : 0;

  // Tiempos (segundos)
  this.openTime = clamp(Number(config.openTime || 20), 1, 300);
  this.holdOpenTime = clamp(Number(config.holdOpenTime || 2), 0, 60); // tiempo de OPEN simulado
  this.closeTime = clamp(Number(config.closeTime || 20), 1, 300);

  // Modo simulación y cierre automático
  this.simulateOnly = (config.simulateOnly !== false); // por defecto SIMULAR
  this.autoClose = (config.autoClose !== false);       // por defecto cerrar tras holdOpenTime

  // Polling: SOLO disponibilidad
  this.polling = config.polling !== false;
  this.pollIntervalMs = clamp(Number(config.pollInterval || 60), 10, 300) * 1000; // 60s recomendado

  // HTTP
  this.httpTimeoutMs = clamp(Number(config.httpTimeoutMs || 10000), 1000, 60000);

  // Debug
  this.debug = config.debug === true;

  // Endpoints Shelly Cloud
  this.statusCloudURL = config.statusCloudURL || "https://shelly-38-eu.shelly.cloud/device/status";
  this.controlCloudURL = config.controlCloudURL || "https://shelly-38-eu.shelly.cloud/device/relay/control";

  // Estado interno
  this._backoffMs = 0;
  this._statusInFlight = false;
  this._timers = { opening: null, open: null, closing: null };

  // --- Servicios HomeKit ---
  this.service = new Service.GarageDoorOpener(this.name);
  this.informationService = new Service.AccessoryInformation()
    .setCharacteristic(Characteristic.Manufacturer, "Shelly Cloud")
    .setCharacteristic(Characteristic.Model, this.deviceType.toUpperCase())
    .setCharacteristic(Characteristic.SerialNumber, this.deviceId || "UNKNOWN");

  // No pisamos Target en polling
  this.lastTarget = Characteristic.TargetDoorState.CLOSED;

  // Handlers
  this.service.getCharacteristic(Characteristic.TargetDoorState)
    .on("set", this.setTargetState.bind(this));

  this.service.getCharacteristic(Characteristic.CurrentDoorState)
    .on("get", this.getCurrentState.bind(this));

  // -------- INICIALIZACIÓN DE ESTADO A CLOSED --------
  // Arranque: CERRADA (Current y Target)
  this._simState = Characteristic.CurrentDoorState.CLOSED;
  this.service.getCharacteristic(Characteristic.CurrentDoorState)
      .updateValue(Characteristic.CurrentDoorState.CLOSED);
  this.service.getCharacteristic(Characteristic.TargetDoorState)
      .updateValue(Characteristic.TargetDoorState.CLOSED);
  this.lastTarget = Characteristic.TargetDoorState.CLOSED;
  // ----------------------------------------------------

  // Polling: SOLO disponibilidad con offset aleatorio para desincronizar
  if (this.polling) {
    const offset = Math.floor(Math.random() * 8000); // 0–8s
    setTimeout(() => {
      this.pollAvailability();
      setInterval(this.pollAvailability.bind(this), this.pollIntervalMs);
    }, offset);
  }

  this.log(
    "[%s] Inicializado (simulateOnly=%s, autoClose=%s, poll=%ss, timeout=%dms)",
    this.name, this.simulateOnly, this.autoClose, (this.pollIntervalMs / 1000), this.httpTimeoutMs
  );

  if (!this.deviceId || !this.authKey) {
    this.log("[%s] ATENCIÓN: deviceId/authKey no configurados. El control puede fallar.", this.name);
  }
}

GarageDoorOpener.prototype = {
  getServices() {
    return [this.informationService, this.service];
  },

  // --- Shelly POST con manejo de 429 y timeout ---
  async shellyPost(url, form) {
    const params = new URLSearchParams(form);

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), this.httpTimeoutMs);

    let resp;
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "homebridge-garagedooropenercloud/1.0"
        },
        body: params,
        signal: ac.signal
      });
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
    clearTimeout(timer);

    if (resp.status === 429) {
      this._backoffMs = Math.min((this._backoffMs || 1000) * 2, 60000); // hasta 60s
      const jitter = Math.floor(Math.random() * 500);
      const waitMs = this._backoffMs + jitter;
      this.log("[%s] Rate limit (429). Backoff %d ms", this.name, waitMs);
      await sleep(waitMs);

      const ac2 = new AbortController();
      const timer2 = setTimeout(() => ac2.abort(), this.httpTimeoutMs);
      const retry = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "homebridge-garagedooropenercloud/1.0"
        },
        body: params,
        signal: ac2.signal
      }).finally(() => clearTimeout(timer2));

      if (!retry.ok) throw new Error(`HTTP ${retry.status}`);
      this._backoffMs = Math.floor(this._backoffMs * 0.5); // relajamos backoff si OK
      return retry.json();
    }

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    this._backoffMs = 0; // éxito normal
    return resp.json();
  },

  // --- Sólo disponibilidad: ping a Shelly (no usamos device_status para estado) ---
  async checkAvailability() {
    try {
      const statusData = { channel: this.channel, id: this.deviceId, auth_key: this.authKey };
      await this.shellyPost(this.statusCloudURL, statusData);
      if (this.debug) this.log("[%s] Disponibilidad OK", this.name);
      return true;
    } catch (err) {
      this.log("[%s] Disponibilidad ERROR: %s", this.name, err.message);
      return false;
    }
  },

  // Poll: sólo disponibilidad
  async pollAvailability() {
    try {
      await this.checkAvailability();
      // No tocamos CurrentDoorState: permanece CLOSED salvo cuando simulamos apertura/cierre
    } catch (err) {
      this.log("[%s] Poll availability error: %s", this.name, err.message);
    }
  },

  // Estado actual para HomeKit: simulado
  async getCurrentState(callback) {
    try {
      callback(null, this._simState); // por defecto CLOSED
    } catch (err) {
      this.log("[%s] Status get error: %s", this.name, err.message);
      callback(err);
    }
  },

  // Control de objetivo
  async setTargetState(targetState, callback) {
    this.lastTarget = targetState;
    const wantOpen = (targetState === Characteristic.TargetDoorState.OPEN);

    try {
      // Comando real al relé (aunque el estado HomeKit sea simulado)
      const form = { id: this.deviceId, channel: this.channel, auth_key: this.authKey };
      if (this.deviceType === "relay") {
        form.turn = wantOpen ? "on" : "off";
      } else {
        form.turn = "toggle"; // sensor: actuamos el relé; el estado lo mantenemos simulado
      }

      await this.shellyPost(this.controlCloudURL, form);
      this.log("[%s] Comando enviado: %s", this.name, form.turn);

      // Cancelar cualquier simulación previa
      this._clearTimers();

      if (!this.simulateOnly) {
        // Si quisieras volver a estado real, aquí podrías consultar device_status
        // En este modo solicitado, no se usa.
      }

      if (wantOpen) {
        // Simular OPENING → OPEN → (CLOSING) → CLOSED
        this._setSim(Characteristic.CurrentDoorState.OPENING);

        this._timers.opening = setTimeout(() => {
          this._setSim(Characteristic.CurrentDoorState.OPEN);

          if (this.autoClose) {
            this._timers.open = setTimeout(() => {
              this._setSim(Characteristic.CurrentDoorState.CLOSING);

              this._timers.closing = setTimeout(() => {
                this._setSim(Characteristic.CurrentDoorState.CLOSED);
              }, this.closeTime * 1000);
            }, this.holdOpenTime * 1000);
          }
        }, this.openTime * 1000);
      } else {
        // Solicitud de cierre: CLOSING → CLOSED
        this._setSim(Characteristic.CurrentDoorState.CLOSING);
        this._timers.closing = setTimeout(() => {
          this._setSim(Characteristic.CurrentDoorState.CLOSED);
        }, this.closeTime * 1000);
      }

      callback(null);
    } catch (err) {
      this.log("[%s] Control error: %s", this.name, err.message);
      callback(err);
    }
  },

  _setSim(state) {
    this._simState = state;
    this.service.getCharacteristic(Characteristic.CurrentDoorState).updateValue(state);
    if (this.debug) {
      const names = {
        [Characteristic.CurrentDoorState.OPEN]: "OPEN",
        [Characteristic.CurrentDoorState.CLOSED]: "CLOSED",
        [Characteristic.CurrentDoorState.OPENING]: "OPENING",
        [Characteristic.CurrentDoorState.CLOSING]: "CLOSING",
        [Characteristic.CurrentDoorState.STOPPED]: "STOPPED"
      };
      this.log("[%s] Sim state -> %s", this.name, names[state] ?? String(state));
    }
  },

  _clearTimers() {
    for (const k of ["opening", "open", "closing"]) {
      if (this._timers[k]) {
        clearTimeout(this._timers[k]);
        this._timers[k] = null;
      }
    }
  }
};

