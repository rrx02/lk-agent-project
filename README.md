# lk-agent-project
 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/linkedin-contact-tracker/README.md b/linkedin-contact-tracker/README.md
index 74d9632d6122c01a31a7b56eddce5921bf03feb3..657157ce6b94f2b78024795618ab5f8f6157fdad 100644
--- a/linkedin-contact-tracker/README.md
+++ b/linkedin-contact-tracker/README.md
@@ -1,128 +1,79 @@
-# LinkedIn Contact Tracker (Chrome Extension)
+# LinkedIn Recruiter Profile Assistant (Chrome Extension)
 
-Extensão Chrome simples para guardar contactos do LinkedIn e acompanhar o estado de cada contacto (ex: contactado, respondeu, entrevista, submissão).
+A Chrome extension for recruiters who want to turn a LinkedIn profile into a more personal outreach message instead of sending a generic template.
 
----
+The extension helps you:
 
-## Para quem é este guia?
+- capture the candidate name, profile URL, headline, and location from the current LinkedIn profile;
+- surface possible personalization hooks from visible profile text, including experience, skills, certifications, cloud keywords, and activity clues;
+- remind the recruiter to add a human observation from the profile photo or banner, such as a city skyline, funny image, conference photo, sport, pet, award, or other visual curiosity;
+- generate an editable outreach message asking whether the candidate is open to a new role similar to their current title;
+- save candidates locally and track outreach status, responses, interviews, and submissions.
 
-Para pessoas **non-tech**: sem programação, sem terminal, só com passos práticos.
+> Important: the extension only reads information visible in the current browser tab. It does not use AI image recognition, does not bypass LinkedIn access controls, and stores data locally in Chrome storage.
 
 ---
 
-## Opção A — Instalar no teu Chrome (uso pessoal, sem publicar)
-
-> Esta é a forma mais rápida para começares já.
-
-### Passo 1: Descarregar os ficheiros
-
-Pede ao teu developer (ou colega técnico) a pasta chamada:
-
-- `linkedin-contact-tracker`
-
-Guarda essa pasta num local fácil de encontrar (ex: Desktop).
-
-### Passo 2: Abrir as extensões do Chrome
-
-1. Abre o Google Chrome.
-2. Na barra de endereço escreve: `chrome://extensions`
-3. Carrega Enter.
-
-### Passo 3: Ativar modo de programador
-
-1. No canto superior direito, ativa o botão **Developer mode**.
-
-### Passo 4: Carregar a extensão
-
-1. Clica em **Load unpacked**.
-2. Escolhe a pasta `linkedin-contact-tracker`.
-3. Clica em **Select folder**.
-
-Pronto: a extensão fica instalada no teu browser.
+## Install locally in Chrome
 
-### Passo 5: Fixar a extensão (opcional, mas recomendado)
-
-1. Clica no ícone de puzzle (extensões) no Chrome.
-2. Procura **LinkedIn Contact Tracker**.
-3. Clica no alfinete (pin) para ficar sempre visível.
+1. Download or copy the `linkedin-contact-tracker` folder.
+2. Open Chrome and go to `chrome://extensions`.
+3. Enable **Developer mode**.
+4. Click **Load unpacked**.
+5. Select the `linkedin-contact-tracker` folder.
+6. Pin the extension from the Chrome extensions puzzle icon if desired.
 
 ---
 
-## Como usar (muito simples)
+## How to use it
 
-1. Clica no ícone da extensão.
-2. Preenche:
-   - **Nome** da pessoa
-   - **Link LinkedIn**
-3. Clica **Adicionar**.
-4. Vai mudando o estado (Novo, Contactado, Respondeu, Entrevista, Submissão, etc.).
-5. Vê as métricas no topo para perceber resultados:
-   - Taxa de resposta
-   - Taxa de entrevistas
-   - Taxa de submissões
+1. Open a LinkedIn profile page, for example `https://www.linkedin.com/in/...`.
+2. Click the extension icon.
+3. Click **Analyze LinkedIn profile**.
+4. Review the generated **Personalization choices**.
+5. Look at the candidate's photo and banner yourself, then write any useful visual detail in **Photo or banner curiosity**.
+6. Edit the generated outreach message so it sounds like you.
+7. Click **Copy message** to paste it into LinkedIn or email.
+8. Click **Save candidate** to keep the profile, notes, message, and status in your local pipeline.
 
 ---
 
-## Opção B — Publicar na Chrome Web Store (para partilhar com equipa)
+## Example outreach message
+
+```text
+Hi Maria,
 
-> Eu não consigo publicar na tua conta Google por ti, mas este é o processo passo-a-passo.
+I came across your LinkedIn profile and noticed your AWS certification and current Senior DevOps Engineer role. I also saw the Lisbon skyline in your banner, so I guessed you may be connected to the local tech community there.
 
-### Antes de começar
+Your background looks relevant to a new position similar to your current role. Would you be open to a brief conversation so I can share the role and see if it matches what you want next?
 
-Precisas de:
+Best,
+```
 
-- Conta Google
-- Conta de developer da Chrome Web Store (normalmente tem taxa única de registo)
+---
 
-### Passo 1: Criar o ficheiro ZIP da extensão
+## Build a ZIP for Chrome Web Store upload
 
-Pede ao teu developer para executar este comando:
+Ask a technical teammate to run:
 
 ```bash
 bash linkedin-contact-tracker/scripts/build-extension.sh
 ```
 
-Esse comando cria um ZIP pronto a publicar em:
-
-- `linkedin-contact-tracker/dist/linkedin-contact-tracker-v1.0.0.zip`
-
-### Passo 2: Entrar no portal de developer
-
-1. Vai a: https://chrome.google.com/webstore/devconsole
-2. Faz login com a conta Google de developer.
-
-### Passo 3: Criar novo item
-
-1. Clica em **New Item**.
-2. Faz upload do ficheiro ZIP.
-
-### Passo 4: Preencher os campos obrigatórios
-
-No formulário da Web Store, adiciona:
-
-- Nome da extensão
-- Descrição curta e longa
-- Capturas de ecrã
-- Categoria
-- Email/site de suporte
-- Política de privacidade (se aplicável)
-
-### Passo 5: Submeter para revisão
+The ZIP will be created at:
 
-1. Clica em **Submit for review**.
-2. Aguarda aprovação da equipa da Google.
+- `linkedin-contact-tracker/dist/linkedin-contact-tracker-v1.1.0.zip`
 
-Depois de aprovada, já podes partilhar o link da extensão com outras pessoas.
+If you publish to the Chrome Web Store, update the store listing and privacy disclosure to explain that candidate notes are stored locally with `chrome.storage.local`.
 
 ---
 
-## Resumo rápido
+## Data storage
 
-- Queres usar só para ti? → **Opção A (Load unpacked)**.
-- Queres distribuir para equipa/clientes? → **Opção B (Web Store)**.
+All saved candidates are stored locally in the recruiter's browser using `chrome.storage.local`. The extension does not send candidate data to an external server.
 
 ---
 
-## Armazenamento dos dados
+## Complete file-by-file project
 
-Os dados dos contactos ficam guardados localmente no browser através de `chrome.storage.local`.
+If you need to copy the project into GitHub manually, see [`PROJECT_FILES.md`](PROJECT_FILES.md). It includes the folder structure, every file name, and the full contents of each file.
 
EOF
)
