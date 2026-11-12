# AI_MCQ_N - Lightweight Instant MCQ Solver

An ultra-minimal Chrome extension that answers multiple-choice questions right at your cursor in under a second.

---

## ⚡ How It Works
1. **Highlight any MCQ** (question and options) on any webpage or exam portal.
2. **Press `N`**.
3. A discreet, cursor-sized square badge containing ONLY the correct answer letter (**A**, **B**, **C**, **D**, or **E**) appears right next to your cursor.
4. The badge automatically disappears after **3 seconds** (or press `Esc` to dismiss immediately).

---

## 🚀 Features
- **Instant Response (~1s)** powered by Google Gemini Flash Lite.
- **Round-Wheel Key Pool**: Built-in 3-key round-robin rotation distributes requests and guarantees 100% uptime without manual configuration.
- **Personal Key Support**: Optional support to add your own free Gemini API key via the extension popup.
- **Unlabeled MCQ Support**: Automatically identifies option order even when choices aren't explicitly marked with letters.
- **Portal Selection Unblock**: Works smoothly on exam/quiz portals that attempt to block text selection.
- **Manifest V3 Compliant**: Built strictly to current Chrome Web Store security guidelines.

---

## 📦 Installation & Testing
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** ON (top right).
4. Click **Load unpacked** and select this directory.
5. Highlight an MCQ and press **N**!
