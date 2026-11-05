# Azel's Study Planner

A pastel study planner that works on laptop, phone and iPad: timetable with schedule changes and free-time ideas, to-do list, course folders with flashcards, calendar, focus timer, and money pockets.

## Using it

Open the GitHub Pages link, then add it to your home screen:

- **iPhone / iPad:** Safari → Share → Add to Home Screen
- **Android:** Chrome → ⋮ → Add to Home screen / Install app
- **Laptop:** Chrome or Edge → install icon in the address bar

Open your private planner link once on each device. Or, on a device that already has it, tap **Sync** and scan the QR code with the new device.

## How data is kept

- Data syncs through a Firebase Firestore project, under a long secret planner code.
- The Firebase rules accept only that one code, so nobody else can read the data or make their own planner there.
- The code lives only on your devices and in your private link. Keep that link private.
- The app also works offline; changes sync when the internet comes back.
- **Sync → Download backup** saves everything as a JSON file.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app |
| `manifest.webmanifest`, `icons/` | Home-screen name and icon |
| `sw.js` | Lets the app open without internet |
| `qrcode.js` | QR code for connecting another device ([qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), MIT) |
| `firestore.rules` | Firebase security rules (paste into Firestore → Rules) |
