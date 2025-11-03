# Location Testing Guide

## Testing Location Detection with Spoofed Locations

### Using Android Emulator

Set mock location on emulator using `adb`:

```bash
# San Francisco, CA
adb -s emulator-5554 emu geo fix -122.4194 37.7749

# New York, NY
adb -s emulator-5554 emu geo fix -74.0060 40.7128

# London, UK
adb -s emulator-5554 emu geo fix -0.1278 51.5074

# Tokyo, Japan
adb -s emulator-5554 emu geo fix 139.6917 35.6895

# Paris, France
adb -s emulator-5554 emu geo fix 2.3522 48.8566

# Vancouver, BC (default)
adb -s emulator-5554 emu geo fix -123.1207 49.2827
```

Then restart the app or trigger location refresh.

### Using Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   
2. Enable Mock Locations:
   - Go to Settings → Developer Options
   - Enable "Mock location app" or "Select mock location app"
   
3. Install a mock location app from Play Store:
   - "Fake GPS Location" by Lexa
   - "Mock Location" by Various developers

4. Use the app to set a mock location

### Testing on Web

1. Open browser DevTools (F12)
2. Open Console
3. Override geolocation:
```javascript
navigator.geolocation.getCurrentPosition = function(callback) {
  callback({
    coords: {
      latitude: 37.7749,  // San Francisco
      longitude: -122.4194
    }
  });
};
```

### Popular Test Locations

| City | Latitude | Longitude | Command |
|------|----------|-----------|---------|
| San Francisco, CA | 37.7749 | -122.4194 | `adb -s emulator-5554 emu geo fix -122.4194 37.7749` |
| New York, NY | 40.7128 | -74.0060 | `adb -s emulator-5554 emu geo fix -74.0060 40.7128` |
| London, UK | 51.5074 | -0.1278 | `adb -s emulator-5554 emu geo fix -0.1278 51.5074` |
| Tokyo, Japan | 35.6895 | 139.6917 | `adb -s emulator-5554 emu geo fix 139.6917 35.6895` |
| Paris, France | 48.8566 | 2.3522 | `adb -s emulator-5554 emu geo fix 2.3522 48.8566` |
| Vancouver, BC | 49.2827 | -123.1207 | `adb -s emulator-5554 emu geo fix -123.1207 49.2827` |

### Notes

- After setting location, restart the app or trigger a location refresh
- The reverse geocoding might take a moment to fetch the city name
- If location isn't updating, try clearing app data and restarting

