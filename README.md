# LinkedIn Profile Hook Analyzer (Chrome Extension)

A Chrome extension for recruiters who want to analyze a LinkedIn profile and identify profile-specific hooks for a personalized first message.

This project is only for hook analysis. It reads visible information from the current LinkedIn profile tab and helps the recruiter choose useful outreach angles.

The extension helps you:

- capture the profile name, URL, headline, and location from the current LinkedIn profile;
- surface possible personalization hooks from visible profile text, including experience, skills, certifications, cloud keywords, and profile activity clues;
- remind the recruiter to manually inspect the profile photo and banner for respectful, specific visual hooks such as a city skyline, conference stage, sport, award, pet, or other memorable detail;
- generate an editable outreach example asking whether the person is open to a new role similar to their current title;
- copy the suggested hooks or message without creating any local database.

> Important: the extension only reads information visible in the current browser tab. It does not use AI image recognition, does not bypass LinkedIn access controls, does not track outreach, and does not send data to an external server.

---

## Install locally in Chrome

1. Download or copy the `linkedin-profile-hook-analyzer` folder.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `linkedin-profile-hook-analyzer` folder.
6. Pin the extension from the Chrome extensions puzzle icon if desired.

---

## How to use it

1. Open a LinkedIn profile page, for example `https://www.linkedin.com/in/...`.
2. Click the extension icon.
3. Click **Analyze profile**.
4. Review the generated **Suggested hooks**.
5. Look at the profile photo and banner yourself, then write any useful visual detail in **Manual visual hook**.
6. Edit the generated outreach example so it sounds natural.
7. Click **Copy hooks** or **Copy message**.

---

## Example outreach message

```text
Hi Maria,

I came across your LinkedIn profile. I noticed your AWS certification and current Senior DevOps Engineer role. I also noticed the Lisbon skyline in your banner, which made your profile stand out.

Your background looks relevant to a new position similar to your current role. Would you be open to a short conversation so I can share the opportunity and see if it matches what you want next?

Best,
```

---

## Build a ZIP for Chrome Web Store upload

Run:

```bash
bash linkedin-profile-hook-analyzer/scripts/build-extension.sh
```

The ZIP will be created at:

- `linkedin-profile-hook-analyzer/dist/linkedin-profile-hook-analyzer-v1.0.0.zip`

---

## Complete file-by-file project

If you need to copy the project into GitHub manually, see [`PROJECT_FILES.md`](PROJECT_FILES.md). It includes the folder structure, every file name, and the full contents of each file.
