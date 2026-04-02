# homebridge-garagedooropenercloud

Homebridge plugin to control and monitor Shelly garage doors via the Shelly Cloud API, without requiring local network access.

Compatible with **Shelly Gen1, Plus, and Pro** — works with both relay and sensor cloud-only devices.

[![npm version](https://img.shields.io/npm/v/homebridge-garagedooropenercloud)](https://www.npmjs.com/package/homebridge-garagedooropenercloud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Homebridge Verified](https://img.shields.io/badge/homebridge-verification%20pending-yellow)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

> **EN** This plugin has been submitted for **official Homebridge verification**. Once approved, it will appear as a verified plugin in the Homebridge plugin catalogue.
>
> **ES** Este plugin ha sido enviado para **verificación oficial de Homebridge**. Una vez aprobado, aparecerá como plugin verificado en el catálogo de plugins de Homebridge.

---

## Migrating from v1.x / Migración desde v1.x

From v2.0.0 the plugin is a **dynamic platform**. Move your config from `accessories` to `platforms`.

Desde v2.0.0 el plugin es una **dynamic platform**. Mueve la config del bloque `accessories` a `platforms`.

**Before / Antes:**
```json
"accessories": [
  {
    "accessory": "GarageDoorOpenerCloud",
    "name": "Garage East",
    "deviceId": "441793a44130",
    "authKey": "YOUR_AUTH_KEY",
    "deviceType": "sensor",
    "pollInterval": 120
  },
  {
    "accessory": "GarageDoorOpenerCloud",
    "name": "Garage West",
    "deviceId": "441793a44131",
    "authKey": "YOUR_AUTH_KEY",
    "deviceType": "relay",
    "pollInterval": 120
  }
]
```

**After / Después:**
```json
"platforms": [
  {
    "platform": "GarageDoorOpenerCloud",
    "name": "Garage Door Cloud",
    "devices": [
      {
        "name": "Garage East",
        "deviceId": "441793a44130",
        "authKey": "YOUR_AUTH_KEY",
        "deviceType": "sensor",
        "pollInterval": 120
      },
      {
        "name": "Garage West",
        "deviceId": "441793a44131",
        "authKey": "YOUR_AUTH_KEY",
        "deviceType": "relay",
        "pollInterval": 120
      }
    ]
  }
]
```

> **Note:** If you update without changing your config, the plugin will continue to work and log a warning asking you to migrate.
>
> **Nota:** Si actualizas sin cambiar la config, el plugin seguirá funcionando y mostrará un aviso en el log pidiendo que migres.

---

## English

### Finding your Shelly Cloud server URL

Each Shelly account is assigned to a specific regional cloud server. You need to set this URL in the plugin config so it connects to the right server.

1. Open [control.shelly.cloud](https://control.shelly.cloud) in your browser (or the Shelly app)
2. Go to **Settings → User Settings**
3. Scroll down to **Authorization cloud key**
4. Your server URL is shown there — e.g. `https://shelly-38-eu.shelly.cloud`

Copy only the base URL (without any path). Set it as `shellyServer` in the platform config.

### Finding your Shelly Device ID

1. Open [control.shelly.cloud](https://control.shelly.cloud) in your browser
2. Click on your device to open its detail page
3. Click the **Settings** (gear) icon
4. Go to **Device information**
5. The **Device ID** is shown there — e.g. `441793a44130`

Alternatively, the Device ID is usually printed on a sticker on the physical device (it is the last part of the default device name, e.g. `shellyplus1-441793a44130`).

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
"platforms": [
  {
    "platform": "GarageDoorOpenerCloud",
    "name": "Garage Door Cloud",
    "shellyServer": "https://shelly-38-eu.shelly.cloud",
    "devices": [
      {
        "name": "Garage East",
        "deviceId": "441793a44130",
        "authKey": "YOUR_SHELLY_CLOUD_AUTH_KEY",
        "deviceType": "sensor",
        "channel": 0,
        "pollInterval": 120,
        "polling": true
      },
      {
        "name": "Garage West",
        "deviceId": "441793a44131",
        "authKey": "YOUR_SHELLY_CLOUD_AUTH_KEY",
        "deviceType": "relay",
        "pollInterval": 120
      }
    ]
  }
]
```

| Field | Level | Description |
|-------|-------|-------------|
| **shellyServer** | platform | Your Shelly Cloud server URL (see above). Applied to all devices. |
| **name** | device | Display name in HomeKit |
| **deviceId** | device | Shelly device ID |
| **authKey** | device | Shelly Cloud authentication key |
| **deviceType** | device | `relay` or `sensor` |
| **pollInterval** | device | Poll interval in seconds (default: 120) |
| **polling** | device | Enable/disable polling (default: true) |
| **shellyServer** | device | Override the server URL for this specific device only |

### How it works

- At startup the door always shows as **closed** for safety
- Polls `https://shelly.cloud/device/status` every `pollInterval` seconds
- Device is considered online when `cloud.connected == true`
- Adds a random delay (±30%) between polls to avoid rate-limit errors

---

## Español

### Cómo encontrar la URL de tu servidor Shelly Cloud

Cada cuenta Shelly está asignada a un servidor cloud regional específico. Debes configurar esta URL en el plugin para que se conecte al servidor correcto.

1. Abre [control.shelly.cloud](https://control.shelly.cloud) en el navegador (o la app Shelly)
2. Ve a **Ajustes → Ajustes de usuario**
3. Baja hasta **Clave de autorización en la nube**
4. Tu URL de servidor aparece ahí — p.ej. `https://shelly-38-eu.shelly.cloud`

Copia solo la URL base (sin ruta). Ponla como `shellyServer` en la config de la plataforma.

### Cómo encontrar el Device ID de tu Shelly

1. Abre [control.shelly.cloud](https://control.shelly.cloud) en el navegador
2. Haz clic en tu dispositivo para abrir su página de detalle
3. Haz clic en el icono de **Ajustes** (engranaje)
4. Ve a **Información del dispositivo**
5. El **Device ID** aparece ahí — p.ej. `441793a44130`

Alternativamente, el Device ID suele estar impreso en una pegatina en el propio dispositivo físico (es la última parte del nombre por defecto, p.ej. `shellyplus1-441793a44130`).

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
"platforms": [
  {
    "platform": "GarageDoorOpenerCloud",
    "name": "Garage Door Cloud",
    "shellyServer": "https://shelly-38-eu.shelly.cloud",
    "devices": [
      {
        "name": "Garaje",
        "deviceId": "441793a44130",
        "authKey": "TU_CLAVE_SHELLY_CLOUD",
        "deviceType": "sensor",
        "channel": 0,
        "pollInterval": 120,
        "polling": true
      }
    ]
  }
]
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
