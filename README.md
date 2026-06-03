# LinkedIn Profile Hook Analyzer (Chrome Extension)

A Chrome extension for recruiters who want to analyze a LinkedIn profile and create accurate, informal, playful outreach hooks.

This project is only for hook analysis. It reads visible information from the current LinkedIn profile tab and helps the recruiter choose one strong outreach angle at a time.

The extension helps you:

- capture the profile name, URL, headline and current company from the current LinkedIn profile;
- turn the title into a simple opener that matches the profile, for example: “I saw you’re a Fullstack Developer at Acme — how’s that chapter going?”;
- vary message openers with casual, recruiter-aware, playful and leadership-safe styles;
- adjust tone by role family: light sarcasm for engineering/data/cloud profiles, self-aware jokes for recruiters, and calmer copy for leadership profiles;
- show profile photo and banner previews so the recruiter can add a real image observation, such as a city skyline, technology banner, certification graphic, event, sport, pet or funny detail;
- summarize useful About/profile text and suggest a natural follow-up;
- summarize only skills that match the person’s title, so a recruiter profile does not get a frontend pitch and a backend profile does not get a product pitch;
- detect cloud/certification signals and suggest asking how those certifications connect to the person’s actual work;
- detect repeated public activity themes, such as Azure, AI or cloud, without over-focusing on random likes;
- generate an editable message draft that rewrites itself around the selected hook instead of stacking unrelated hooks.

> Important: the extension can display the candidate’s LinkedIn profile photo and banner preview, but it does not perform computer-vision image recognition. Add the visual observation you actually see in the photo/banner field and the draft will use it naturally.

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
4. Review the generated **Conversation hooks**.
5. Click **Use this hook** on the hook you want to use.
6. Look at the profile photo and banner previews, then write any useful visual detail in **Photo or banner comment**.
7. Edit the generated message draft if needed.
8. Click **Copy hooks** or **Copy message**.

---

## Example hooks

```text
Current title
Their headline says Fullstack Developer at Acme.
Tip: “I saw you’re a Fullstack Developer at Acme. How’s that going? Casually curious if something new is on your radar?”

Profile photo
The photo preview looks like it was taken at a conference stage.
Tip: “Random opener: was that photo from a tech event, or is LinkedIn just making you look extra official?”

Banner
The banner preview shows several cloud logos.
Tip: “I saw a few cloud logos in your banner — which one is taking most of your brain space these days?”

Role-matched skills
For a Fullstack Developer profile, the most relevant skills I found are: React, Node.js, AWS.
Tip: “I saw React and Node.js on your profile — is that still a big part of your day-to-day?”

Posts / activity themes
Visible activity points to repeated themes like Azure and AI.
Tip: “I saw a few Azure/AI signals around your activity — is that something you actually enjoy, or is LinkedIn’s algorithm just being LinkedIn?”
```

---

## Example outreach message

```text
Hey Maria 👋

Tiny LinkedIn observation: you’re a Fullstack Developer at Acme, and I was curious how that chapter is going.

Also, had to mention: your banner has a tiny cloud-logo party going on.

How are things going at Acme?

Open to hearing about something new, or are you happily hiding from recruiters these days? 😄
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
