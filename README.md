# homebridge-garagedooropenercloud

Homebridge plugin to control and monitor Shelly garage doors via the Shelly Cloud API, without requiring local network access.

Compatible with **Shelly Gen1, Plus, and Pro** — works with both relay and sensor cloud-only devices.

[![npm version](https://img.shields.io/npm/v/homebridge-garagedooropenercloud)](https://www.npmjs.com/package/homebridge-garagedooropenercloud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## English

### Features

- Always starts **closed** (safe default)
- Uses **Shelly Cloud API** for status checks
- Rate limit protection with random polling delay
- Configurable through Homebridge Config UI X
- Works with Docker and Child Bridges
- Supports both **relay** and **sensor-only** Shelly devices

### Installation

```bash
npm install -g homebridge-garagedooropenercloud
```

Docker:

```bash
docker exec -it homebridge npm install -g homebridge-garagedooropenercloud@latest
docker restart homebridge
```

### Configuration via Config UI X

1. Go to **Plugins → Garage Door Opener Cloud → Add (+)**
2. Fill in the fields and click **Save**

### Manual config.json

```json
{
  "accessory": "GarageDoorOpenerCloud",
  "name": "Garage East",
  "deviceId": "441793a44130",
  "authKey": "YOUR_SHELLY_CLOUD_AUTH_KEY",
  "deviceType": "sensor",
  "channel": 0,
  "pollInterval": 120,
  "polling": true
}
```

| Field | Description |
|-------|-------------|
| **accessory** | Always `GarageDoorOpenerCloud` |
| **name** | Display name in HomeKit |
| **deviceId** | Shelly device ID |
| **authKey** | Shelly Cloud authentication key |
| **deviceType** | `relay` or `sensor` |
| **pollInterval** | Poll interval in seconds (default: 120) |
| **polling** | Enable/disable polling |

### How it works

- At startup the door always shows as **closed** for safety
- Polls `https://shelly.cloud/device/status` every `pollInterval` seconds
- Device is considered online when `cloud.connected == true`
- Adds a random delay (±30%) between polls to avoid rate-limit errors

---

## Español

### Características

- Estado inicial siempre **cerrado** (por seguridad)
- Chequeo de estado vía **Shelly Cloud API**
- Anti rate-limit con retardo aleatorio en el polling
- Configurable en Homebridge Config UI X
- Compatible con Docker y Child Bridges
- Funciona con Shelly Gen1 y Gen2 (relay/sensor)

### Instalación

```bash
npm install -g homebridge-garagedooropenercloud
```

Docker:

```bash
docker exec -it homebridge npm install -g homebridge-garagedooropenercloud@latest
docker restart homebridge
```

### Configuración con Config UI X

1. Ve a **Plugins → Garage Door Opener Cloud → Nuevo (+)**
2. Rellena los campos y haz clic en **Guardar**

### config.json manual

```json
{
  "accessory": "GarageDoorOpenerCloud",
  "name": "Mauleón",
  "deviceId": "441793a44130",
  "authKey": "TU_CLAVE_SHELLY_CLOUD",
  "deviceType": "sensor",
  "channel": 0,
  "pollInterval": 120,
  "polling": true
}
```

### Cómo funciona

- Al arrancar, la puerta se muestra **cerrada** por seguridad
- Cada `pollInterval` segundos se consulta el Shelly Cloud
- El dispositivo se marca online cuando `cloud.connected == true`
- Añade un retraso aleatorio (±30%) para evitar errores `TOO_MANY_REQUESTS`

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License — see [LICENSE](LICENSE)
