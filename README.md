# Smart Alarm for Amazfit GTR 4

Zepp OS app that tries to wake you during light sleep instead of jarring you out of deep sleep.
Reads sleep stages + heart rate from the watch sensors and picks the best moment
within a configurable window before your alarm time.

## Requirements

- Amazfit GTR 4 (Zepp OS 2.0+)
- Zeus CLI or Zepp Studio
- Zepp app on your phone with Developer Mode on

## Install

```bash
npm i -g @zeppos/zeus-cli
zeus preview          # scan QR with Zepp app
```

## How it works

You set an alarm time and a wake window (5–45 min). The app schedules per-minute
checkpoint alarms spanning that window. Each checkpoint reads the current sleep stage
and recent heart rate, then decides whether now is a good time to wake you.

Early in the window it only wakes you if you're already awake or in light sleep.
As the deadline approaches, the thresholds relax — eventually it'll wake you no matter what.
HR trend and stage transitions nudge the decision earlier when your body is naturally
coming out of deep sleep.

After dismissing the alarm you get a quick "how do you feel?" prompt. Over time the
ratings shift the wake thresholds slightly (bounded at ±0.10 from defaults, needs 5+
ratings per condition).

## Usage

1. Open the app, tap the time to set your alarm
2. Tap the window row to pick how early the app can wake you
3. Toggle ON, tap the checkmark to save
4. Alarm vibrates with escalating intensity — tap Dismiss to stop

## Permissions

- `device:os.alarm` — checkpoint alarms
- `device:os.notification` — fallback if direct page launch fails
- `data:user.hd.sleep` — sleep stage data
- `data:user.hd.heart_rate` — HR trend detection
