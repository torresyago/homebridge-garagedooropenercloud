# Changelog

## [1.4.0] - 2026-04-01

### Changed
- Homebridge v2 compatible: replaced `.on('get', callback)` / `.on('set', callback)` with `.onGet()` / `.onSet()` API
- Updated `engines` to `^1.6.0 || ^2.0.0-beta.0` with Node.js 18/20/22 requirement
- Fixed `repository`, `bugs` and `homepage` URLs to `torresyago`
- Added `homebridge.pluginAlias` field to `package.json` for Config UI X compatibility

## [1.3.12] - 2026-03-28
### Changed
- Replaced deprecated `request` library with native Node.js `https` and `querystring` modules (no new dependencies)

## [1.2.20] - 2025-12-26
### Fixed
- ✅ **Rate limiting fix**: Added random delay (0-30%) to polling requests to prevent `TOO_MANY_REQUESTS` errors from Shelly Cloud API
- ✅ **Cloud status detection**: Now uses `cloud.connected: true` instead of relay/input states
- ✅ **All Shelly models**: Fixed status polling for Gen1/Plus/Pro (removed `channel` parameter that broke some devices)
- ✅ **Initial state**: Doors always start **CLOSED** for safety

### Added
- 🔧 **`pollInterval`**: Configurable polling interval (default: 120s)
- 🛡️ **Anti-rate-limit**: Automatic staggering between multiple devices
- 📊 **Better logging**: Clear `ONLINE/OFFLINE` status with next poll timer

### [1.2.19] - 2025-12-22
### Fixed
- 🐛 Config UI X compatibility (plugin alias detection)
- 🐛 Child bridge loading in Docker environments
- 📱 HomeKit accessory recognition

### Added
- 🔧 `deviceType: "sensor"` support for Shelly Plus/Gen2 (input:0.state)
- 📋 Full `config.schema.json` for Homebridge UI X

## [1.2.18] - 2025-12-22
### Added
- ✨ Initial release with Shelly Cloud API integration
- 🔌 Toggle control via `/device/relay/control`
- 📡 Status polling via `/device/status`

---

## 🔧 Migration Guide

### From v1.2.19 → v1.2.20

