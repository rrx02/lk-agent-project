 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/linkedin-profile-hook-analyzer/README.md b/linkedin-profile-hook-analyzer/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..a25192463d92272dca9fd6229ba8c3bb206b8b63
--- /dev/null
+++ b/linkedin-profile-hook-analyzer/README.md
@@ -0,0 +1,97 @@
+# LinkedIn Profile Hook Analyzer (Chrome Extension)
+
+A Chrome extension for recruiters who want to analyze a LinkedIn profile and identify concrete, human conversation hooks for a personalized first message.
+
+This project is only for hook analysis. It reads visible information from the current LinkedIn profile tab and helps the recruiter choose useful outreach angles.
+
+The extension helps you:
+
+- capture the profile name, URL, headline, current company and location from the current LinkedIn profile;
+- turn the title into a simple opener, for example: “vi que és Fullstack Developer na empresa X — como tem sido aí?”;
+- show profile photo and banner previews so the recruiter can spot a city, technology banner, cloud/certification graphic, event, sport, pet or funny detail;
+- summarize useful About/profile text and suggest how to use it naturally;
+- summarize technical skills that appear on the profile and suggest choosing one or two to start the conversation;
+- detect cloud/certification signals and suggest asking how those certifications connect to the person's current work;
+- detect repeated public activity themes, such as Azure, AI or cloud, and suggest exploring whether those topics are genuine interests;
+- generate an editable outreach example asking whether the person is open to something new near their current role.
+
+> Important: the extension only reads information visible in the current browser tab. It does not use AI image recognition, does not bypass LinkedIn access controls, does not track outreach, and does not send data to an external server.
+
+---
+
+## Install locally in Chrome
+
+1. Download or copy the `linkedin-profile-hook-analyzer` folder.
+2. Open Chrome and go to `chrome://extensions`.
+3. Enable **Developer mode**.
+4. Click **Load unpacked**.
+5. Select the `linkedin-profile-hook-analyzer` folder.
+6. Pin the extension from the Chrome extensions puzzle icon if desired.
+
+---
+
+## How to use it
+
+1. Open a LinkedIn profile page, for example `https://www.linkedin.com/in/...`.
+2. Click the extension icon.
+3. Click **Analyze profile**.
+4. Review the generated **Conversation hooks**.
+5. Look at the profile photo and banner previews, then write any useful visual detail in **Manual photo/banner hook**.
+6. Edit the generated outreach example so it sounds natural.
+7. Click **Copy hooks** or **Copy message**.
+
+---
+
+## Example hooks
+
+```text
+Título atual
+Vejo que é Fullstack Developer na Acme.
+Dica: “Vejo que és Fullstack na Acme. Como está a correr aí? Estás aberto/a a ouvir algo novo?”
+
+Banner
+O banner parece ter várias tecnologias/cloud logos.
+Dica: “Vi várias tecnologias no teu banner — quais são as que mais usas hoje?”
+
+Skills técnicas
+Aparecem várias skills técnicas: React, Node.js, AWS, Terraform.
+Dica: escolhe 1 ou 2 destas skills e pergunta se tem trabalhado mais nisso no dia a dia.
+
+Publicações / interesses
+A atividade visível sugere interesse em Azure e AI.
+Dica: “Vi que tens interagido com temas de Azure/AI. É uma área que gostas mesmo de explorar?”
+```
+
+---
+
+## Example outreach message
+
+```text
+Olá Maria,
+
+Reparei que és Fullstack Developer na Acme e gostava de perceber como está a ser essa experiência. Também achei interessante o teu banner com várias tecnologias cloud.
+
+Como tem sido essa experiência na Acme? Estás aberto/a a ouvir algo novo, numa oportunidade próxima do que já fazes hoje?
+
+Obrigado,
+```
+
+---
+
+## Build a ZIP for Chrome Web Store upload
+
+Run:
+
+```bash
+bash linkedin-profile-hook-analyzer/scripts/build-extension.sh
+```
+
+The ZIP will be created at:
+
+- `linkedin-profile-hook-analyzer/dist/linkedin-profile-hook-analyzer-v1.0.0.zip`
+
+---
+
+## Complete file-by-file project
+
+If you need to copy the project into GitHub manually, see [`PROJECT_FILES.md`](PROJECT_FILES.md). It includes the folder structure, every file name, and the full contents of each file.
 
EOF
)
## Complete file-by-file project

If you need to copy the project into GitHub manually, see [`PROJECT_FILES.md`](PROJECT_FILES.md). It includes the folder structure, every file name, and the full contents of each file.
