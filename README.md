🧰 README.md - Homebridge GarageDoorOpenerCloud
text
# Homebridge GarageDoorOpenerCloud

![npm](https://img.shields.io/npm/v/homebridge-garagedooropenercloud?color=brightgreen)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)
![Homebridge Verified](https://img.shields.io/badge/homebridge-plugin-blue)

**Homebridge-GarageDoorOpenerCloud** is a [Homebridge](https://github.com/homebridge/homebridge) plugin that allows you to control and monitor **Shelly garage doors via Shelly Cloud API**, without requiring local access.

Compatible with **Shelly Gen1, Plus, and Pro** — works with both **relay** and **sensor** cloud-only devices.

---

## 🇪🇸 Español

### 🚀 Características

- 🔒 Estado inicial siempre **cerrado** (ideal para seguridad)
- ☁️ Chequeo de estado vía **Shelly Cloud API**
- 💤 **Limitador de peticiones (anti rate limit)** con retardo aleatorio
- ⚙️ Configurable en Homebridge UI X
- ⚡ Compatible con `child bridges` y despliegue en Docker
- 🧩 Funciona con Shelly Gen1 y Gen2 (relay/sensor)

---

### 🧮 Ejemplo de configuración

{
"accessory": "GarageDoorOpenerCloud",
"name": "Mauleón",
"deviceId": "441793a44130",
"authKey": "XXXXXXXXXXXXXXX",
"deviceType": "sensor",
"channel": 0,
"pollInterval": 120,
"polling": true,
"manufacturer": "yago",
"model": "GarageDoorOpenerCloud"
}

text

| Campo | Descripción |
|--------|-------------|
| **accessory** | Siempre `GarageDoorOpenerCloud` |
| **name** | Nombre que verá HomeKit |
| **deviceId** | ID Shelly del dispositivo |
| **authKey** | Clave API Shelly Cloud |
| **deviceType** | `relay` o `sensor` |
| **pollInterval** | Intervalo de chequeo (segundos) |
| **polling** | Habilita o desactiva el polling |

---

### 🔧 Instalación

Desde Homebridge UI X:

1. Buscar **Garage Door Opener Cloud**
2. Instalar el plugin
3. Añadir configuración en la UI o en `config.json`

Desde línea de comandos:

sudo npm install -g homebridge-garagedooropenercloud

text

En Docker:

docker exec -it homebridge-bueno npm install -g homebridge-garagedooropenercloud@latest
docker restart homebridge-bueno

text

---

### 🧠 Funcionamiento

- Al arrancar, la puerta se muestra **cerrada** por seguridad.
- Cada `pollInterval` segundos se consulta el **Shelly Cloud**.
- El plugin marca **ONLINE** cuando `cloud.connected == true`.
- Añade un retraso aleatorio (±30%) entre peticiones para evitar `TOO_MANY_REQUESTS`.

---

### 📄 Licencia

Licenciado bajo **MIT**.  
Más información en [LICENSE](./LICENSE).

---

## 🇬🇧 English

### 🚀 Features

- 🔒 Always starts **closed** (safe default)
- ☁️ Uses **Shelly Cloud API** for status checks
- 💤 **Rate limit protection** with random polling delay
- ⚙️ Configurable through Homebridge Config UI X
- ⚡ Works seamlessly with Docker & Child Bridges
- 🧩 Supports both **relay** and **sensor-only** Shelly devices

---

### 🧮 Example configuration

{
"accessory": "GarageDoorOpenerCloud",
"name": "Garage East",
"deviceId": "441793a44130",
"authKey": "XXXXXXXXXXXXXXX",
"deviceType": "sensor",
"channel": 0,
"pollInterval": 120,
"polling": true
}

text

| Field | Description |
|--------|-------------|
| **accessory** | Always `GarageDoorOpenerCloud` |
| **name** | Display name in HomeKit |
| **deviceId** | Shelly device ID |
| **authKey** | Cloud authentication key |
| **deviceType** | `relay` or `sensor` |
| **pollInterval** | Poll interval in seconds |
| **polling** | Enabled/disabled polling |

---

### 🔧 Installation

From Homebridge UI X:

1. Search for **Garage Door Opener Cloud**
2. Install plugin
3. Configure your Shelly devices
  
Command line (global):

sudo npm install -g homebridge-garagedooropenercloud

text

Docker:

docker exec -it homebridge-bueno npm install -g homebridge-garagedooropenercloud@latest
docker restart homebridge-bueno

text

---

### 🧠 How it works

- At startup, the door accessory always shows as **closed**
- The plugin polls `https://shelly.cloud/device/status` every `pollInterval` seconds
- Device is considered **ONLINE** when `cloud.connected == true`
- Adds a **random delay (±30%)** between polls to avoid rate-limit errors

---

### 🧱 Technologies

- Node.js 18+
- Homebridge API 1.6+
- Request.js  
- Shelly Cloud API

---

### 📄 License

Released under the **MIT License**.  
See [LICENSE](./LICENSE) for details.

---

### 💬 Credits & Contact

Developed by **Yago**  
📦 [npmjs.com/package/homebridge-garagedooropenercloud](https://www.npmjs.com/package/homebridge-garagedooropenercloud)  
💬 Issues & support:  
🔗 [github.com/yago/homebridge-garagedooropenercloud/issues](https://github.com/yago/homebridge-garagedooropenercloud/issues)
