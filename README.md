# Azel's Study Planner

A pastel study planner that works on laptop, phone and iPad: timetable with schedule changes and free-time ideas, to-do list, course folders with flashcards, calendar, IELTS practice with Pita (an AI tutor), vocabulary cards and review, Duolingo-style Grammar and Math courses, chess against Pita, focus timer, and money pockets.

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
| `manifest.webmanifest`, `*.png` | Home-screen name and icons |
| `sw.js` | Lets the app open without internet |
| `ielts.js`, `pita.js` | IELTS menu and Pita, the animated tutor |
| `vocab.js` | Vocabulary menu (word cards, review, "Say it better") |
| `learn.js` | Lesson engine for Grammar and Math (path, strict practice, unit tests) |
| `grammar.js`, `writing.js`, `math.js` | Grammar, Academic Writing and Math courses |
| `pitachess.js` | Chess against Pita |
| `chesslib.js` | Chess rules ([chess.js](https://github.com/jhlywa/chess.js), BSD-2-Clause) |
| `qrcode.js` | QR code for connecting another device ([qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), MIT) |
| `firestore.rules` | Firebase security rules (paste into Firestore → Rules) |
