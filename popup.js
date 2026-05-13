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
    setStatus('Profile analyzed. Review the hooks and add a manual photo/banner observation if useful.');
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
  currentHooks = buildHooks(profile);

  nameInput.value = profile.name || nameInput.value;
  headlineInput.value = profile.headline || headlineInput.value;
  locationInput.value = profile.location || locationInput.value;
  linkedinUrlInput.value = profile.url || linkedinUrlInput.value;

  renderHooks(currentHooks);
  outreachMessageInput.value = buildOutreachMessage(profile, currentHooks, visualNoteInput.value.trim());
}

function buildHooks(profile) {
  const hooks = [];

  addHook(hooks, 'Current role', profile.headline, 'Use their headline to connect the role you are offering to what they already do.');
  addHook(hooks, 'Location', profile.location, 'Mention local market, remote setup, relocation, or nearby team presence if relevant.');
  addHook(hooks, 'About section', profile.about, 'Reference a motivation, specialty, industry focus, or personal positioning from their summary.');

  profile.certifications?.forEach((item) =>
    addHook(hooks, 'Certification', item, 'Good credibility hook, especially for cloud, security, agile, data, or vendor-specific roles.')
  );

  profile.cloudSignals?.forEach((item) =>
    addHook(hooks, 'Cloud / technical signal', item, 'Use this when the open role needs similar tooling or technical context.')
  );

  profile.experience?.slice(0, 5).forEach((item) =>
    addHook(hooks, 'Experience', item, 'Connect their current or past responsibilities to the new position.')
  );

  profile.skills?.slice(0, 6).forEach((item) =>
    addHook(hooks, 'Skill', item, 'Use as a precise technical or functional keyword in the first message.')
  );

  profile.recentActivity?.slice(0, 5).forEach((item) =>
    addHook(hooks, 'Recent activity / profile clue', item, 'Useful for showing that the message is based on their actual profile, not a generic search result.')
  );

  if (profile.profileImage?.alt) {
    addHook(hooks, 'Profile photo metadata', profile.profileImage.alt, 'Only use if the visible image genuinely supports the observation.');
  }

  if (profile.bannerImage?.alt) {
    addHook(hooks, 'Banner metadata', profile.bannerImage.alt, 'Check the banner manually before mentioning a city, event, logo, or visual theme.');
  }

  return uniqueHooks(hooks).slice(0, 18);
}

function addHook(hooks, type, text, recruiterUse) {
  if (!text) return;
  hooks.push({ type, text, recruiterUse });
}

function renderHooks(hooks) {
  hooksContainer.innerHTML = '';

  const visualReminder = document.createElement('article');
  visualReminder.className = 'hook-card visual';
  visualReminder.innerHTML = '<strong>Manual photo/banner check</strong><p>Look for a city, event, award, sports activity, pet, conference, company branding, or funny detail. Add it above only if it feels natural and respectful.</p>';
  hooksContainer.appendChild(visualReminder);

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

    const text = document.createElement('p');
    text.textContent = hook.text;

    const use = document.createElement('small');
    use.textContent = hook.recruiterUse;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary compact';
    button.textContent = 'Use in message';
    button.addEventListener('click', () => insertHookIntoMessage(hook));

    card.append(title, text, use, button);
    hooksContainer.appendChild(card);
  });

  hooksCard.classList.remove('hidden');
}

function insertHookIntoMessage(hook) {
  const insertion = `\n\nPersonalization idea: I noticed ${hook.text}.`;
  outreachMessageInput.value = `${outreachMessageInput.value.trim()}${insertion}`;
}

function buildOutreachMessage(profile, hooks, visualNote) {
  const firstName = (profile.name || 'there').split(' ')[0];
  const role = profile.headline || 'your current role';
  const strongestHook = hooks.find((hook) => !hook.type.toLowerCase().includes('metadata'));
  const hookSentence = strongestHook ? `I noticed ${lowercaseFirstLetter(strongestHook.text)}.` : `I noticed your experience around ${role}.`;
  const visualSentence = visualNote ? ` I also noticed ${lowercaseFirstLetter(visualNote)}, which made your profile stand out.` : '';
  const locationSentence = profile.location ? ` Your location in ${profile.location} could also be relevant for the team setup.` : '';

  return `Hi ${firstName},\n\nI came across your LinkedIn profile. ${hookSentence}${visualSentence}${locationSentence}\n\nYour background looks relevant to a new position similar to ${role}. Would you be open to a short conversation so I can share the opportunity and see if it matches what you want next?\n\nBest,`;
}

function refreshMessageFromInputs() {
  const profile = {
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
  return currentHooks.map((hook) => `- ${hook.type}: ${hook.text}\n  Recruiter use: ${hook.recruiterUse}`).join('\n');
}

async function copyText(value, successMessage) {
  if (!value.trim()) {
    setStatus('There is nothing to copy yet.');
    return;
  }

  await navigator.clipboard.writeText(value);
  setStatus(successMessage);
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
    const key = `${hook.type}:${hook.text}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
