# Changelog — homebridge-garagedooropenercloud

**Author / Autor:** Yago Torres  
**Repository / Repositorio:** https://github.com/torresyago/homebridge-garagedooropenercloud

---

All notable changes to this project will be documented in this file.  
Todos los cambios relevantes de este proyecto se documentan aquí.

---

## [1.4.2] - 2026-04-01

### Fixed / Corregido
- **EN** Removed unused `jsonpath` dependency which contained a high-severity CVE and used `eval()`.
- **ES** Eliminada dependencia `jsonpath` no utilizada que contenía una CVE de alta gravedad y usaba `eval()`.

---

## [1.4.1] - 2026-04-01

### Changed / Cambios
- **EN** Changelog rewritten in English and Spanish. Author and repository link added to the header.
- **ES** Changelog reescrito en inglés y castellano. Añadidos autor y enlace al repositorio en la cabecera.

---

## [1.4.0] - 2026-04-01

### Changed / Cambios
- **EN** Homebridge v2 compatible: replaced `.on('get', callback)` / `.on('set', callback)` with `.onGet()` / `.onSet()` API.
- **EN** Updated `engines` to `^1.6.0 || ^2.0.0-beta.0` with Node.js 18/20/22 requirement.
- **EN** Fixed `repository`, `bugs` and `homepage` URLs pointing to the correct GitHub account (`torresyago`).
- **EN** Added `homebridge.pluginAlias` field to `package.json` for Config UI X compatibility.
- **ES** Compatible con Homebridge v2: reemplazados `.on('get', callback)` / `.on('set', callback)` por la nueva API `.onGet()` / `.onSet()`.
- **ES** `engines` actualizado a `^1.6.0 || ^2.0.0-beta.0` con requisito de Node.js 18/20/22.
- **ES** Corregidas las URLs de `repository`, `bugs` y `homepage` apuntando a la cuenta GitHub correcta (`torresyago`).
- **ES** Añadido campo `homebridge.pluginAlias` en `package.json` para compatibilidad con Config UI X.

---

## [1.3.12] - 2026-03-28

### Changed / Cambios
- **EN** Replaced deprecated `request` library with native Node.js `https` and `querystring` modules — no new dependencies.
- **ES** Reemplazada la librería deprecated `request` por los módulos nativos `https` y `querystring` de Node.js — sin nuevas dependencias.

---

## [1.2.20] - 2025-12-26

### Fixed / Corregido
- **EN** Rate limiting fix: added random delay (0–30%) to polling to prevent `TOO_MANY_REQUESTS` errors from Shelly Cloud.
- **EN** Cloud status detection now uses `cloud.connected: true` instead of relay/input states.
- **EN** Fixed status polling for all Shelly models Gen1/Plus/Pro (removed `channel` parameter that broke some devices).
- **EN** Initial state: doors always start CLOSED for safety.
- **ES** Anti-rate-limit: añadido retardo aleatorio (0–30%) al polling para evitar errores `TOO_MANY_REQUESTS` de Shelly Cloud.
- **ES** La detección del estado cloud ahora usa `cloud.connected: true` en lugar de estados de relé/entrada.
- **ES** Corregido el polling de estado para todos los modelos Shelly Gen1/Plus/Pro (eliminado el parámetro `channel` que rompía algunos dispositivos).
- **ES** Estado inicial: las puertas siempre arrancan CERRADAS por seguridad.

### Added / Añadido
- **EN** `pollInterval`: configurable polling interval (default: 120s).
- **EN** Anti-rate-limit: automatic staggering between multiple devices.
- **ES** `pollInterval`: intervalo de polling configurable (por defecto: 120s).
- **ES** Anti-rate-limit: escalonado automático entre múltiples dispositivos.

---

## [1.2.19] - 2025-12-22

### Fixed / Corregido
- **EN** Config UI X compatibility (plugin alias detection).
- **EN** Child bridge loading in Docker environments.
- **EN** HomeKit accessory recognition.
- **ES** Compatibilidad con Config UI X (detección del alias del plugin).
- **ES** Carga de child bridge en entornos Docker.
- **ES** Reconocimiento del accesorio en HomeKit.

### Added / Añadido
- **EN** `deviceType: "sensor"` support for Shelly Plus/Gen2 (input:0.state).
- **EN** Full `config.schema.json` for Homebridge Config UI X.
- **ES** Soporte de `deviceType: "sensor"` para Shelly Plus/Gen2 (input:0.state).
- **ES** `config.schema.json` completo para Homebridge Config UI X.

---

## [1.2.18] - 2025-12-22

### Added / Añadido
- **EN** Initial release with Shelly Cloud API integration.
- **EN** Toggle control via `/device/relay/control`.
- **EN** Status polling via `/device/status`.
- **ES** Primera versión con integración de la API Shelly Cloud.
- **ES** Control por toggle via `/device/relay/control`.
- **ES** Polling de estado via `/device/status`.
