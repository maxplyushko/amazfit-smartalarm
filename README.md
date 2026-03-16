# Smart Alarm for Amazfit GTR 4

A Zepp OS Mini Program that wakes you during light sleep for a fresher morning. Uses sleep stage data and heart rate trends to find the optimal wake moment within your chosen window.

## Requirements

- Amazfit GTR 4 with Zepp OS 2.0+ (API Level 2.0, target 3.0)
- Zeus CLI or Zepp Studio
- Zepp app on your phone (Developer Mode enabled)

## Features

- Set alarm time with a scrollable time picker (hours and minutes, zero-padded)
- Choose wake window (5–45 minutes before alarm)
- Enable/disable alarm with a toggle button
- Direct wake page launch with vibration (no notification dialog)
- Screen stays lit while alarm is active
- Alarms persist across device reboot
- Remaining checkpoint alarms are cancelled after wake to save battery

### Smart Wake Algorithm

The app evaluates whether to wake you every 2 minutes during the wake window. The decision uses multiple signals:

- **Sleep stage detection** — reads current sleep stage (light, deep, REM, wake) from the Zepp OS Sleep sensor
- **Heart rate trend** — analyzes the last 10 minutes of HR data to detect rising (lightening sleep) or falling (deepening sleep) patterns
- **Sleep stage trend** — tracks whether recent stages are trending lighter or deeper
- **Stage transition detection** — applies a bonus when you naturally transition from REM/deep into light sleep, the ideal wake moment
- **Time-in-stage stability** — waits for light sleep to be stable (3+ minutes) before triggering, avoiding premature wakes from brief stage classifications
- **Micro-wake filtering** — ignores brief awakenings (< 2 min) that are normal during sleep

The algorithm uses a progressive threshold strategy that relaxes over time:

| Window progress | Allowed wake stages |
|----------------|-------------------|
| 0–20% | Only if already awake |
| 20–55% | Adds light sleep |
| 55–70% | Adds REM |
| 70–90% | Anything except deep sleep |
| 90–100% | Wake regardless (deadline) |

Trend bonuses (HR rising, stages lightening, stage transitions) shift the effective progress forward, making the algorithm more responsive when physiological signals indicate you're naturally surfacing.

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

The alarm vibrates with escalating intensity — gentle at first, more urgent over time if you don't dismiss. Tap Dismiss to stop and return.

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
│   ├── wake_service.js         # Alarm handler, evaluates and triggers wake
│   └── dismiss_service.js      # Clears wake state
├── utils/
│   ├── storage.js              # Config and wake-state persistence
│   ├── alarm-scheduler.js      # Checkpoint alarms via @zos/alarm
│   ├── sleep-evaluator.js      # Multi-signal wake strategy
│   └── picker-confirm.js       # Reusable confirm button
└── assets/gtr-4/               # Icons (icon.png, confirm.png)
```

## Permissions

- `device:os.alarm` – Schedule and cancel wake-up checkpoint alarms
- `device:os.notification` – Fallback wake notification (when direct page launch fails)
- `data:user.hd.sleep` – Read sleep stage data from Zepp OS
- `data:user.hd.heart_rate` – Read heart rate data for trend detection

## Future Enhancements

### User-Adaptive Wake Learning

A feedback loop to personalize wake thresholds per user over time:

- After dismissing the alarm, a "How do you feel?" prompt (Great / Okay / Groggy) collects wake quality feedback
- Wake context (sleep stage, progress, HR trend, reason) is logged alongside each rating
- A threshold adjustment algorithm analyzes the history: if a user consistently feels groggy when woken from REM, the REM threshold is raised for that individual; if light sleep wakes consistently feel great, the light sleep threshold is lowered
- Adjustments are bounded (+/- 0.10 from defaults) to prevent wild swings, with a minimum of 5 rated entries per wake condition before any adjustment applies
- Rolling 30-entry history cap keeps storage minimal

### Centered Wake Window

An alternative window mode ("Around" vs the current "No later than") where the alarm time sits in the middle of the window instead of at the end. For example, with alarm at 8:00 and a 30-minute window, the wake range would be 7:45–8:15 instead of 7:30–8:00. This gives the algorithm more room to find an optimal moment, especially when the user is in deep sleep right before the target time.
