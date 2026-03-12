# Smart Alarm for Amazfit GTR 4

A Zepp OS Mini Program that wakes you during light sleep for a fresher morning.

## Requirements

- Amazfit GTR 4 with Zepp OS 2.0+ (API Level 2.0, target 3.0)
- Zeus CLI or Zepp Studio
- Zepp app on your phone (Developer Mode enabled)

## Features

- Set alarm time with a scrollable time picker (hours and minutes, zero-padded)
- Choose wake window (5–45 minutes before alarm)
- Enable/disable alarm with a toggle button
- Progressive wake strategy: prefers light sleep early in the window, relaxes to REM and other stages as the deadline approaches, always wakes at the set time
- Direct wake page launch with vibration (no notification dialog)
- Screen stays lit while alarm is active
- Alarms persist across device reboot

## Build & Install

1. Install Zeus CLI (if not already):
   ```bash
   npm install -g @zeppos/zeus-cli
   ```

2. Build and preview:
   ```bash
   cd amazfit-smartalarm
   zeus preview
   ```
   Or use [Zepp Studio](https://developer.zepp.com/os/develop) in the browser if Zeus CLI has issues.

3. Scan the QR code with the Zepp app (Developer Mode > Scan) to install on your watch.

## Usage

1. Open Smart Alarm on your watch
2. Tap the time block to open the time picker — scroll to select hour and minute, tap the checkmark to confirm
3. Tap the window block to set the wake window (5–45 min)
4. Toggle the alarm ON or OFF with the button
5. Tap the checkmark at the bottom to save and apply

The app checks sleep stages every 2 minutes during the wake window. When it detects a favorable stage (light sleep, REM, or approaching deadline), it opens the wake page directly with vibration. Tap Dismiss to stop and return.

## Project Structure

```
amazfit-smartalarm/
├── app.json                    # App config, permissions, targets
├── app.js                      # Entry point, routes to pages
├── page/config/                # Main config UI (time, window, toggle)
├── page/time-picker/           # Time picker (WIDGET_PICKER)
├── page/window-picker/         # Wake window picker (5–45 min)
├── page/wake/                  # Wake-up screen with vibration
├── app-service/
│   ├── wake_service.js         # Alarm handler, sleep evaluation, trigger wake
│   └── dismiss_service.js      # Placeholder
├── utils/
│   ├── storage.js              # Config and wake-state persistence
│   ├── alarm-scheduler.js      # Checkpoint alarms (@zos/alarm)
│   ├── sleep-evaluator.js      # Progressive wake strategy, stage resolution
│   └── picker-confirm.js       # Reusable confirm button
└── assets/gtr-4/               # Icons (icon.png, confirm.png)
```

## Permissions

- `device:os.alarm` – Schedule wake-up alarms
- `device:os.notification` – Fallback wake notification (when direct page launch fails)
- `data:user.hd.sleep` – Read sleep stage data from Zepp OS
