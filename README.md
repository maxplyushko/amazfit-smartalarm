# Smart Alarm for Amazfit GTR 4

A Zepp OS Mini Program that wakes you during light sleep for a fresher morning.

## Requirements

- Amazfit GTR 4 with Zepp OS 3.5 (API Level 305)
- Zeus CLI or Zepp Studio
- Zepp app on your phone (Developer Mode enabled)

## Features

- Set alarm time with a scrollable time picker
- Choose wake window (5–30 minutes before alarm)
- Enable/disable alarm with a slide switch
- Wakes via vibration when you're in light sleep phase
- Alarms persist across device reboot

## Build & Install

1. Install Zeus CLI (if not already):
   ```bash
   npm install -g @zeppos/zeus-cli
   ```

2. Build and preview:
   ```bash
   cd smart-alarm
   zeus preview
   ```
   Or use [Zepp Studio](https://developer.zepp.com/os/develop) in the browser if Zeus CLI has issues.

3. Scan the QR code with the Zepp app (Developer Mode > Scan) to install on your watch.

## Usage

1. Open Smart Alarm on your watch
2. Tap the time block to open the time picker — scroll to select, tap the checkmark to confirm
3. Tap the window block to set the wake window (5–30 min)
4. Toggle the alarm on/off with the slide switch
5. Tap the checkmark at the bottom to save and exit

The app checks sleep stages every 5 minutes during the wake window. When it detects light sleep (or reaches the alarm time), it vibrates and shows a wake-up screen.

## Project Structure

```
smart-alarm/
├── app.json                    # App config, permissions, targets
├── app.js                      # Entry point
├── page/config/                # Main config UI
├── page/time-picker/           # Time picker page (WIDGET_PICKER)
├── page/window-picker/         # Wake window picker page
├── page/wake/                  # Wake-up screen with vibration
├── app-service/                # Wake handler, dismiss service
├── utils/storage.js            # Config persistence (@zos/fs)
├── utils/alarm-scheduler.js    # Alarm scheduling (@zos/alarm)
├── utils/picker-confirm.js     # Reusable confirm button component
└── assets/gtr-4/               # Icons and switch images
```

## Permissions

- `device:os.alarm` – Schedule wake-up alarms
- `device:os.notification` – Show wake notification with vibration
- `data:user.hd.sleep` – Read sleep stage data
