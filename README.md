# homebridge-garagedooropenercloud

[![npm](https://img.shields.io/npm/v/homebridge-garagedooropenercloud.svg)](https://www.npmjs.com/package/homebridge-garagedooropenercloud)
[![GitHub stars](https://img.shields.io/github/stars/torresyago/homebridge-garagedooropenercloud.svg)](https://github.com/torresyago/homebridge-garagedooropenercloud)

**Homebridge plugin para abrir/cerrar garaje usando Shelly Cloud API** 🚪☁️

## Descripción

Fork mejorado de [jmaferreira/homebridge-garage-door-shelly1](https://github.com/jmaferreira/homebridge-garage-door-shelly1)

**Novedades:**
- ✅ Control remoto vía Shelly Cloud (**sin IP local**)
- ✅ Polling de estado real vía Cloud API  
- ✅ Sensor de puerta integrado (reed switch)
- ✅ Compatible Homebridge Config UI X

## 🔧 Instalación

npm install -g torresyago/homebridge-garagedooropenercloud

text

## ⚙️ Configuración

{
"accessory": "GarageDoorOpener",
"name": "Garage Door",
"plugin": "homebridge-garagedooropenercloud",
"deviceId": "441793a44db8",
"authKey": "MTAzNDxxxxx",
"channel": "0",
"openTime": 20,
"closeTime": 20,
"polling": true,
"pollInterval": 30,
"debug": true
}

text

### 📱 Credenciales Shelly Cloud

1. **App Shelly** → Dispositivo → **Settings** → **Cloud** → **Device ID**
2. **App Shelly** → **Perfil** → **Auth Key**

## 📋 Opciones completas

| Parámetro | Descripción | Por defecto |
|-----------|-------------|-------------|
| `deviceId` | **ID dispositivo** | **Obligatorio** |
| `authKey` | **Auth Key** | **Obligatorio** |
| `channel` | Canal relay | `0` |
| `openTime` | Segundos apertura | `10` |
| `closeTime` | Segundos cierre | `10` |
| `polling` | Polling activo | `false` |
| `pollInterval` | Segundos polling | `30` |
| `debug` | Logs detallados | `false` |

## 🔌 Cableado Shelly 1PM

Pulsador garaje:
├── L → Fase pulsador
├── N → Neutro
└── O → Pulsador (Relay)

Sensor reed (SW + L):
├── SW → Terminal reed
└── L → Terminal reed

text

## 🎯 Funcionamiento

Abrir/Cerrar → POST /relay/control?turn=on
Estado → POST /device/status → input:0.state
false → 🚪 ABIERTA
true → 🚪 CERRADA

text

## 🏠 Estados HomeKit

| Estado HomeKit | Valor | Sensor |
|----------------|-------|--------|
| **Abierta** | `0` | `false` |
| **Cerrada** | `1` | `true` |
| **Abriendo** | `2` | Simulado |
| **Cerrando** | `3` | Simulado |

## 👨‍💻 Autor

**torresyago** - [GitHub](https://github.com/torresyago)

**Basado en:**
- [jmaferreira/homebridge-garage-door-shelly1](https://github.com/jmaferreira/homebridge-garage-door-shelly1)
- [andreaseu/homebridge-garage-remote-http](https://github.com/andreaseu/homebridge-garage-remote-http)

## 📄 Licencia

MIT License
