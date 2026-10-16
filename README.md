# EduHealth Desktop
> Premium All-in-One Student Productivity & Personal Wellness Desktop Application

EduHealth Desktop is an offline-first academic productivity companion designed to combine an academic planner, deadline manager, exam revision assistant, Pomodoro focus timer, hydration tracker, and wellness reminder system into a cohesive, macOS-inspired desktop experience optimized for Windows 10 & 11.

---

## Key Features

1. **Home Dashboard**
   - At-a-glance overview with personalized greeting, semester progress, and daily task completion gauge.
   - Live countdowns for upcoming assignments and examinations.
   - Quick 1-click hydration logger (+150 ml, +250 ml, +500 ml).
   - Study time and posture break status.

2. **Assignment Manager**
   - Track coursework deliverables with due dates, times, estimated durations, priorities, and custom reminder triggers.
   - Filter by status (*Not Started*, *In Progress*, *Completed*, *Submitted*), subject, priority, and overdue dates.
   - Safety checks: Explicit confirmation modals for institutional submissions and permanent deletions.

3. **Exam Planner & Revision Assistant**
   - Examination countdowns with dates, times, and test room locations.
   - Topic-by-topic syllabus breakdown with confidence grading (*Needs Review*, *Familiar*, *Mastered*).
   - Offline revision strategy recommendations calculating daily study pace based on remaining days.
   - 1-click creation of daily study tasks directly from syllabus topics.

4. **Focus Timer & Study Sessions**
   - 25m/5m Pomodoro, 50m/10m Deep Work, and custom intensive sessions.
   - Timestamp-based timer calculations (`Date.now()`) ensuring 100% accuracy even during window minimization or computer sleep.
   - Synthesized Web Audio chimes without external audio dependencies.
   - Automatic study logs with daily and 7-day cumulative metrics.

5. **Student Health & Wellness**
   - Hydration tracker with daily goal progress bar, undo functionality, and automatic midnight rollover.
   - Ergonomic 20-20-20 eye rest and posture decompression coach.
   - 100% private local sleep and daily energy reflection journal.

6. **Interactive Calendar**
   - Month view and Agenda view with category-color coding (Assignments, Exams, Focus Blocks, Tasks).
   - 1-click scheduling by selecting any calendar date.

7. **Statistics & Analytics**
   - Lightweight native SVG/CSS visualizations for past 7-day study minutes, hydration consistency, and course completion rates.

8. **Privacy, Security & Backups**
   - Zero mandatory accounts, cloud databases, or telemetry.
   - Full JSON backup export and validated restore with error handling.

---

## Desktop Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Audio Engine**: Synthesized Web Audio API bells and chimes.
- **Persistence**: Local offline storage with schema validation.
- **Desktop Runtime**: Configured for Tauri (Rust-based lightweight backend) with Electron fallback.

---

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## Building Standalone Windows 64-bit App

### Option A: Tauri (Recommended — Lightweight < 20 MB)

1. Ensure the Rust toolchain is installed:
   ```powershell
   winget install Rustlang.Rustup
   ```
2. Build the production Windows MSI installer or portable binary:
   ```bash
   npm run build
   npx tauri build
   ```
3. Output location:
   - `src-tauri/target/release/bundle/msi/EduHealth_1.0.0_x64_en-US.msi`
   - `src-tauri/target/release/eduhealth-desktop.exe`

### Option B: Electron

```bash
npm run electron:build
```
Outputs standalone installer in `dist/EduHealth-Setup-1.0.0.exe`.

---

## Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + N` / `Cmd + N` | Open Quick Add Modal (Assignment / Exam / Task / Hydration) |
| `Ctrl + F` / `Cmd + F` | Open Global Search across all records |
| `Ctrl + ,` / `Cmd + ,` | Open Preferences & Settings |
| `Esc` | Close any open modal dialog |

---

## Verification & Testing Checklist

- [x] Application launches with zero runtime errors.
- [x] Navigation across all 9 sidebar sections preserves state.
- [x] Assignments can be created, filtered, marked complete, submitted, and deleted with confirmation.
- [x] Exam countdown accurately calculates days remaining.
- [x] Revision syllabus mastery bar updates dynamically.
- [x] Focus timer continues ticking accurately across background tabs and window minimize.
- [x] Hydration quick-log buttons increment water total and allow undo.
- [x] Theme switching (Light / Dark / System) responds immediately and persists across restarts.
- [x] JSON Backup export downloads valid `.json` file and restore validates schema safely.
