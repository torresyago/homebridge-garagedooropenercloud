# Changelog

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

