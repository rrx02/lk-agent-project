const nameInput = document.getElementById('name');
const headlineInput = document.getElementById('headline');
const locationInput = document.getElementById('profileLocation');
const linkedinUrlInput = document.getElementById('linkedinUrl');
const visualNoteInput = document.getElementById('visualNote');
const outreachMessageInput = document.getElementById('outreachMessage');
const analyzeProfileButton = document.getElementById('analyzeProfile');
const prefillCurrentButton = document.getElementById('prefillCurrent');
const copyHooksButton = document.getElementById('copyHooks');
const copyMessageButton = document.getElementById('copyMessage');
const analysisStatus = document.getElementById('analysisStatus');
const hooksCard = document.getElementById('hooksCard');
const hooksContainer = document.getElementById('hooks');

let currentProfile = null;
let currentHooks = [];

init();

function init() {
  analyzeProfileButton.addEventListener('click', analyzeCurrentProfile);
  prefillCurrentButton.addEventListener('click', prefillFromCurrentTab);
  copyHooksButton.addEventListener('click', () => copyText(formatHooksForClipboard(), 'Hooks copied.'));
  copyMessageButton.addEventListener('click', () => copyText(outreachMessageInput.value, 'Message copied.'));
  visualNoteInput.addEventListener('input', refreshMessageFromInputs);
}

async function analyzeCurrentProfile() {
  setStatus('Reading visible LinkedIn profile details...');
  const activeTab = await getActiveTab();

  if (!isLinkedInProfile(activeTab?.url)) {
    setStatus('Open a linkedin.com/in/... profile before analyzing.');
    return;
  }

  try {
    const profile = await requestProfileExtraction(activeTab.id);
    populateProfile(profile);
    setStatus('Profile analyzed. Review the concrete conversation hooks and add a manual photo/banner observation if useful.');
  } catch (error) {
    setStatus(`Could not analyze this page: ${error.message}`);
  }
}

async function requestProfileExtraction(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_LINKEDIN_PROFILE' });
  } catch (_error) {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    return chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_LINKEDIN_PROFILE' });
  }
}

function populateProfile(profile) {
  currentProfile = profile;
  currentHooks = buildHooks(profile);

  nameInput.value = profile.name || nameInput.value;
  headlineInput.value = profile.headline || headlineInput.value;
  locationInput.value = profile.location || locationInput.value;
  linkedinUrlInput.value = profile.url || linkedinUrlInput.value;

  renderHooks(currentHooks, profile);
  outreachMessageInput.value = buildOutreachMessage(profile, currentHooks, visualNoteInput.value.trim());
}

function buildHooks(profile) {
  const hooks = [];
  const roleLabel = profile.roleCategory || simplifyRole(profile.headline);
  const company = profile.currentCompany;

  if (roleLabel || company) {
    addHook(hooks, {
      type: 'Título atual',
      observation: `Vejo que é ${roleLabel || 'profissional'}${company ? ` na ${company}` : ''}.`,
      suggestion: `Mensagem simples: “Vejo que és ${roleLabel || 'especialista'}${company ? ` na ${company}` : ''}. Como está a correr aí? Estás aberto/a a ouvir algo novo?”`,
      messageLine: `és ${roleLabel || 'especialista'}${company ? ` na ${company}` : ''} e gostava de perceber como está a ser essa experiência`
    });
  }

  if (profile.location) {
    addHook(hooks, {
      type: 'Localização',
      observation: `A localização aparece como ${profile.location}.`,
      suggestion: 'Pode ser útil falar de modelo remoto/híbrido, equipa local ou ligação ao mercado dessa cidade/país.',
      messageLine: `reparei que estás em ${profile.location}, por isso pode fazer sentido falar também do modelo de trabalho`
    });
  }

  if (profile.aboutSummary) {
    addHook(hooks, {
      type: 'About / resumo',
      observation: profile.aboutSummary,
      suggestion: 'Usa isto para mostrar que leste o perfil: pega numa motivação, domínio, indústria ou forma como a pessoa se apresenta.',
      messageLine: `gostei do resumo do teu perfil, sobretudo da parte sobre ${profile.aboutSummary}`
    });
  }

  const technicalSkills = profile.technicalSkills?.slice(0, 8) || [];
  if (technicalSkills.length) {
    addHook(hooks, {
      type: 'Skills técnicas',
      observation: `Aparecem várias skills técnicas: ${formatList(technicalSkills)}.`,
      suggestion: `Dica: escolhe 1 ou 2 destas skills e abre conversa. Ex.: “Vi que trabalhas com ${technicalSkills.slice(0, 2).join(' e ')} — tens feito mais disto no dia a dia?”`,
      messageLine: `tens no perfil várias skills como ${formatList(technicalSkills.slice(0, 3))}`
    });
  }

  const certifications = profile.certifications?.slice(0, 5) || [];
  if (certifications.length) {
    addHook(hooks, {
      type: 'Certificações',
      observation: `Há sinais de certificações/credenciais: ${formatList(certifications)}.`,
      suggestion: 'Boa abordagem: perguntar que ligação estas certificações têm com o trabalho atual ou que áreas quer aprofundar a seguir.',
      messageLine: `reparei nas tuas certificações e fiquei curioso para perceber como as tens usado no trabalho`
    });
  }

  const cloudThemes = profile.cloudSignals?.slice(0, 6) || [];
  if (cloudThemes.length) {
    addHook(hooks, {
      type: 'Cloud / tecnologias',
      observation: `O perfil aponta para temas cloud/tech como ${formatList(cloudThemes)}.`,
      suggestion: 'Em vez de listar buzzwords, pergunta onde tem mais experiência ou qual destas tecnologias prefere usar.',
      messageLine: `tens alguns sinais fortes de cloud/tecnologia no perfil e gostava de perceber em que stack tens trabalhado mais`
    });
  }

  const activityThemes = profile.activityThemes?.slice(0, 5) || [];
  if (activityThemes.length) {
    addHook(hooks, {
      type: 'Publicações / interesses',
      observation: `A atividade visível sugere interesse em ${formatList(activityThemes.map((theme) => `${theme.label} (${theme.count})`))}.`,
      suggestion: `Talvez explore este tema: “Vi que interagiste/falaste algumas vezes sobre ${activityThemes[0].label}. É uma área que gostas mesmo de trabalhar?”`,
      messageLine: `notei alguma atividade à volta de ${activityThemes[0].label} e fiquei curioso para perceber se é uma área que gostas de explorar`
    });
  }

  profile.experience?.slice(0, 3).forEach((item) => {
    addHook(hooks, {
      type: 'Experiência',
      observation: item,
      suggestion: 'Usa como contexto, mas transforma em pergunta: “O que tens gostado mais nessa função/equipa?”',
      messageLine: `tens experiência em ${item}`
    });
  });

  return uniqueHooks(hooks).slice(0, 16);
}

function addHook(hooks, hook) {
  if (!hook.observation && !hook.suggestion) return;
  hooks.push(hook);
}

function renderHooks(hooks, profile) {
  hooksContainer.innerHTML = '';
  renderVisualHooks(profile);

  if (!hooks.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No strong hooks were detected. Try scrolling the LinkedIn profile to load more sections, then analyze again.';
    hooksContainer.appendChild(empty);
    hooksCard.classList.remove('hidden');
    return;
  }

  hooks.forEach((hook) => {
    const card = document.createElement('article');
    card.className = 'hook-card';

    const title = document.createElement('strong');
    title.textContent = hook.type;

    const observation = document.createElement('p');
    observation.textContent = hook.observation;

    const suggestion = document.createElement('small');
    suggestion.textContent = hook.suggestion;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary compact';
    button.textContent = 'Use in message';
    button.addEventListener('click', () => insertHookIntoMessage(hook));

    card.append(title, observation, suggestion, button);
    hooksContainer.appendChild(card);
  });

  hooksCard.classList.remove('hidden');
}

function renderVisualHooks(profile) {
  const wrapper = document.createElement('div');
  wrapper.className = 'visual-grid';

  const profileCard = createVisualCard({
    title: 'Foto de perfil',
    image: profile?.profileImage,
    prompt: 'Olha para a foto: se aparecer uma cidade, evento, medalha, desporto, animal ou algo engraçado, pode ser uma entrada natural. Ex.: “a tua foto parece ser numa cidade fixe — é Lisboa/Porto/Londres?”'
  });

  const bannerCard = createVisualCard({
    title: 'Banner',
    image: profile?.bannerImage,
    prompt: 'Olha para o banner: se tiver várias tecnologias, cloud logos, certificações, arquitetura ou uma cidade, pergunta a ligação. Ex.: “vi várias tecnologias no teu banner — quais são as que mais usas hoje?”'
  });

  wrapper.append(profileCard, bannerCard);
  hooksContainer.appendChild(wrapper);
}

function createVisualCard({ title, image, prompt }) {
  const card = document.createElement('article');
  card.className = 'hook-card visual';

  const heading = document.createElement('strong');
  heading.textContent = title;
  card.appendChild(heading);

  if (image?.src) {
    const preview = document.createElement('img');
    preview.src = image.src;
    preview.alt = image.alt || title;
    preview.className = 'visual-preview';
    card.appendChild(preview);
  }

  const text = document.createElement('p');
  text.textContent = prompt;
  card.appendChild(text);

  if (image?.alt) {
    const alt = document.createElement('small');
    alt.textContent = `Texto/metadata encontrado: ${image.alt}`;
    card.appendChild(alt);
  }

  return card;
}

function insertHookIntoMessage(hook) {
  const insertion = `\n\nIdeia de personalização: ${hook.messageLine || hook.observation}.`;
  outreachMessageInput.value = `${outreachMessageInput.value.trim()}${insertion}`;
}

function buildOutreachMessage(profile, hooks, visualNote) {
  const firstName = (profile.name || '').split(' ')[0];
  const roleHook = hooks.find((hook) => hook.type === 'Título atual');
  const strongestHook = roleHook || hooks.find((hook) => !hook.type.toLowerCase().includes('metadata'));
  const hookSentence = strongestHook ? `Reparei que ${strongestHook.messageLine}.` : `Reparei na tua experiência em ${profile.headline || 'tecnologia'}.`;
  const visualSentence = visualNote ? ` Também achei interessante ${lowercaseFirstLetter(visualNote)}.` : '';

  return `Olá${firstName ? ` ${firstName}` : ''},\n\n${hookSentence}${visualSentence}\n\nComo tem sido essa experiência${profile.currentCompany ? ` na ${profile.currentCompany}` : ''}? Estás aberto/a a ouvir algo novo, numa oportunidade próxima do que já fazes hoje?\n\nObrigado,`;
}

function refreshMessageFromInputs() {
  const profile = {
    ...(currentProfile || {}),
    name: nameInput.value.trim(),
    headline: headlineInput.value.trim(),
    location: locationInput.value.trim()
  };

  outreachMessageInput.value = buildOutreachMessage(profile, currentHooks, visualNoteInput.value.trim());
}

async function prefillFromCurrentTab() {
  const activeTab = await getActiveTab();

  if (!activeTab?.url?.includes('linkedin.com')) {
    setStatus('The current tab is not LinkedIn.');
    return;
  }

  linkedinUrlInput.value = activeTab.url;
  nameInput.value = (activeTab.title || '')
    .replace(/\|\s*LinkedIn.*/i, '')
    .replace(/\(\d+\)\s*/g, '')
    .trim();
  setStatus('Current LinkedIn tab link copied into the summary.');
}

async function getActiveTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return activeTab;
}

function isLinkedInProfile(url = '') {
  return /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\//i.test(url) || /^https:\/\/www\.linkedin\.com\/in\//i.test(url);
}

function formatHooksForClipboard() {
  if (!currentHooks.length) return '';
  return currentHooks.map((hook) => `- ${hook.type}: ${hook.observation}\n  Dica: ${hook.suggestion}`).join('\n');
}

async function copyText(value, successMessage) {
  if (!value.trim()) {
    setStatus('There is nothing to copy yet.');
    return;
  }

  await navigator.clipboard.writeText(value);
  setStatus(successMessage);
}

function simplifyRole(headline = '') {
  const lower = headline.toLowerCase();
  if (/full\s?stack|full-stack/.test(lower)) return 'Fullstack Developer';
  if (/front\s?end|frontend/.test(lower)) return 'Frontend Developer';
  if (/back\s?end|backend/.test(lower)) return 'Backend Developer';
  if (/devops|site reliability|sre/.test(lower)) return 'DevOps Engineer';
  if (/data engineer/.test(lower)) return 'Data Engineer';
  if (/data scientist|machine learning| ml | ai /.test(` ${lower} `)) return 'AI/Data specialist';
  if (/architect/.test(lower)) return 'Software Architect';
  if (/engineer|developer|programmer/.test(lower)) return 'Software Engineer';
  if (/manager|lead|head of/.test(lower)) return 'Tech Lead/Manager';
  return headline.split('|')[0].split(' at ')[0].trim();
}

function formatList(items) {
  return items.filter(Boolean).slice(0, 8).join(', ');
}

function setStatus(message) {
  analysisStatus.textContent = message;
}

function lowercaseFirstLetter(value) {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function uniqueHooks(hooks) {
  const seen = new Set();
  return hooks.filter((hook) => {
    const key = `${hook.type}:${hook.observation}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
