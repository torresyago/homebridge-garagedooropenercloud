# Homebridge GarageDoorOpenerCloud

[![npm version](https://badge.fury.io/js/homebridge-garagedooropenercloud.svg)](https://www.npmjs.com/package/homebridge-garagedooropenercloud)

Homebridge plugin para controlar puertas de garaje vía Shelly Cloud API. Soporta todos los modelos Shelly automáticamente.

## ✨ Características
- Toggle relay desde HomeKit (Abrir/Cerrar)
- Polling automático (cada 30s)
- Soporte universal: Gen1 (relays), Plus/Gen2 (input:0), Gen3
- Config UI X con dropdown Device Type
- Logs detallados para debug

## 📱 Demo Home App
Garage Door 1 → CERRADA (relay OFF)  
Garage Door 2 → ABIERTA (sensor false)  
Garage Door 3 → CERRADA (sensor null)

## 🔧 Instalación
npm install -g homebridge-garagedooropenercloud

## ⚙️ Configuración (Config UI X)

### 1. Determina tu Device Type
curl -s -X POST "https://shelly-38-eu.shelly.cloud/device/status" -d "channel=0&id=TU_DEVICE_ID&auth_key=TU_AUTH_KEY" | jq '.data.device_status | keys | join(", ")'

**Resultados:**
- `relays` → deviceType: "relay" (Gen1, Shelly 1/1PM)
- `input:0, switch:0` → deviceType: "sensor" (Plus/Gen2, Shelly Plus 1)

### 2. Configuración ejemplo
{
    "name": "Garage Door 1",
    "deviceId": "e868e7d2b238",
    "authKey": "MTAzNDEydWlk...",
    "deviceType": "relay",
    "channel": 0,
    "polling": true,
    "debug": true
}

{
    "name": "Garage Door 2", 
    "deviceId": "441793a44db8",
    "authKey": "MTAzNDEydWlk...",
    "deviceType": "sensor",
    "channel": 0,
    "polling": true,
    "debug": true
}

### Campos obligatorios
- name: Nombre en Home App → "Garage Door"
- deviceId: ID del Shelly (minúsculas) → "e868e7d2b238"
- authKey: Clave Shelly Cloud → "MTAzNDEydWlk..."
- deviceType: "relay" o "sensor"

## 📡 Cómo obtener Device ID y Auth Key
1. Shelly App → Tu dispositivo → Device Info
2. Device ID: e868e7d2b238 (sin guiones)
3. Auth Key: MTAzNDEydWlkBAAEEB9DCABD3... (copia completa)

## 🐛 Logs de éxito
[Garage Door 1] Relay relays[0].ison: false → Status: false -> HomeKit: CLOSED (1)  
[Garage Door 2] Sensor input:0.state: false → Status: false -> HomeKit: OPEN (0)

## 🚀 Desarrollo rápido
cd ~/github/homebridge-garagedooropenercloud
npm install -g .
docker restart homebridge
docker logs homebridge -f | grep "Garage Door"

## 📖 Lógica de estados
| Device Type | false/off | true/on | HomeKit |
|-------------|-----------|---------|---------|
| relay       | Relay OFF | Relay ON| CLOSED→OPEN |
| sensor      | Sensor OFF| Sensor ON| OPEN→CLOSED |

## 🔗 Enlaces útiles
- [Shelly Cloud API](https://shelly-api-docs.shelly.cloud/)
- [Homebridge Config UI X](https://github.com/homebridge/homebridge-config-ui-x)

## 🙌 Contribuidores
**Yago** - Desarrollador principal 🇪🇸

**¡Múltiples puertas funcionando simultáneamente!** 🚪🚪🚪✨
