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

> ⚠️ **Important:** This plugin must be added under the `"platforms"` block in `config.json`, using `"platform": "GarageDoorOpenerCloud"`. Using `"accessory"` instead of `"platform"` will cause the plugin to be silently ignored — no devices will appear and no logs will be shown.

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

> ⚠️ **Importante:** Este plugin debe añadirse en el bloque `"platforms"` del `config.json`, usando `"platform": "GarageDoorOpenerCloud"`. Si usas `"accessory"` en lugar de `"platform"`, Homebridge ignorará el plugin silenciosamente — no aparecerá ningún dispositivo ni ningún log.

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

## Troubleshooting — after upgrading to v2.0.0 or later

From v2.0.0 this plugin changed from `accessory` to `platform`. If Config UI X still generates `"accessory"` instead of `"platform"` after updating, follow these steps:

1. **Uninstall the plugin** from Config UI X → Plugins → `homebridge-garagedooropenercloud` → Uninstall
2. **Clear the Homebridge accessory cache**: Config UI X → Settings → scroll down → **Remove All Cached Accessories**
3. **Restart the Homebridge container/service** completely:
   - Docker: `docker restart homebridge`
   - systemd: `sudo systemctl restart homebridge`
4. **Reinstall the plugin** from Config UI X → search `homebridge-garagedooropenercloud` → Install
5. **Add the plugin again** from the Config UI X assistant — it will now generate the correct `"platform"` config

> This is necessary because Config UI X caches the plugin schema. A full restart forces it to reload the schema from the newly installed version.

---

## Solución de problemas — tras actualizar a v2.0.0 o superior

Desde v2.0.0 este plugin cambió de `accessory` a `platform`. Si Config UI X sigue generando `"accessory"` en lugar de `"platform"` tras actualizar, sigue estos pasos:

1. **Desinstala el plugin** desde Config UI X → Plugins → `homebridge-garagedooropenercloud` → Desinstalar
2. **Limpia la caché de accesorios**: Config UI X → Ajustes → baja hasta **Eliminar todos los accesorios en caché**
3. **Reinicia completamente el contenedor/servicio de Homebridge**:
   - Docker: `docker restart homebridge`
   - systemd: `sudo systemctl restart homebridge`
4. **Vuelve a instalar el plugin** desde Config UI X → busca `homebridge-garagedooropenercloud` → Instalar
5. **Añade el plugin de nuevo** desde el asistente de Config UI X — ahora generará la config correcta con `"platform"`

> Esto es necesario porque Config UI X cachea el schema del plugin. Un reinicio completo fuerza la recarga del schema desde la versión recién instalada.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License — see [LICENSE](LICENSE)
