# DateTime

A lightweight extension that displays the current time, date, and your internet connectivity status right in your status bar.
Perfect for developers who keep their OS toolbar hidden by default.


---
## Features

- **Live Clock**: Displays the current time, ticking perfectly in sync with your system.
- **Internet Connectivity Check**: Shows a globe icon when you're online and another icon when your connection drops.
- **Format Customization**: 
  - Standard (AM/PM) or Military (24-hour) time.
  - Customizable date/time format strings (e.g., `HH:mm:ss`, `h:mm a`).
- **Quick Menu**: Click the status bar item to easily toggle settings on the fly.

## Extension Settings

| Setting | Default | Description |
| --- | --- | --- |
| `datetime.enable` | `true` | Enable or disable the extension's status bar item. |
| `datetime.showDate` | `false` | Show the current date alongside the time. |
| `datetime.militaryTime` | `false` | Display the time in 24-hour military format. |
| `datetime.customTimeFormat` | `""` | Set a custom format (e.g., `HH:mm:ss`). Overrides the default if military time is disabled. |
| `datetime.showInternetConnectionStatus` | `false` | Enable background internet connectivity checking and display the status icon. |

## Commands

- `DateTime: Open Menu` — Opens the Quick Settings menu.
- `DateTime: Toggle Enable` — Quickly turn the extension on/off.
- `DateTime: Toggle Show Date` — Toggle the date display.
- `DateTime: Toggle Military Time` — Toggle 24-hour format.
- `DateTime: Toggle Custom Format` — Enter or clear a custom time format.
- `DateTime: Toggle Internet Connection Status` — Toggle the connectivity indicator.

---
**Hope it helps you stay on time! 🙌**
