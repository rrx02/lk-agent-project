const ROLE_FAMILIES = {
  SOFTWARE: 'software',
  DATA: 'data',
  CLOUD: 'cloud',
  PRODUCT: 'product',
  RECRUITING: 'recruiting',
  DESIGN: 'design',
  LEADERSHIP: 'leadership',
  GENERAL: 'general'
};

const FAMILY_SKILL_HINTS = {
  [ROLE_FAMILIES.SOFTWARE]: ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Java', 'Python', 'C#', '.NET', 'SQL', 'API', 'Microservices'],
  [ROLE_FAMILIES.DATA]: ['Python', 'SQL', 'Spark', 'Databricks', 'Snowflake', 'Machine Learning', 'AI', 'LLM', 'Analytics'],
  [ROLE_FAMILIES.CLOUD]: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'DevOps', 'Cloud'],
  [ROLE_FAMILIES.PRODUCT]: ['Product', 'Roadmap', 'Discovery', 'Analytics', 'Stakeholders', 'Strategy'],
  [ROLE_FAMILIES.RECRUITING]: ['Recruiting', 'Talent Acquisition', 'Sourcing', 'Stakeholder Management', 'Employer Branding'],
  [ROLE_FAMILIES.DESIGN]: ['UX', 'UI', 'Research', 'Figma', 'Design Systems'],
  [ROLE_FAMILIES.LEADERSHIP]: ['Leadership', 'Strategy', 'Team Management', 'Delivery', 'Stakeholders']
};

// ── TONE TEMPLATES ────────────────────────────────────────────────────────────

const TONE_TEMPLATES = {
  playful: {
    intros: (name) => [
      `Hi ${name},`,
      `Hi ${name} 👋`,
      `Hey ${name},`,
      `Hey ${name} — quick one.`
    ],
    openers: [
      'Something on your profile caught my attention:',
      'Not to be that recruiter, but',
      'Quick observation from your profile:',
      'Had to reach out because',
      'Your profile stood out — specifically',
      'One thing I noticed:'
    ],
    hookWrap: {
      skills: (line) => `the ${line} combo is the kind of stack that usually means you have survived a production incident or two.`,
      activity: (line) => `${line} — and that kind of engagement on LinkedIn is actually rare.`,
      certifications: (line) => `the ${line} credentials made me want to understand how those connect to your actual day-to-day.`,
      about: (line) => `your About section felt genuinely written, which is rarer than it should be.`,
      role: (line) => `${line}.`,
      experience: (line) => `your background in ${line} is exactly the kind of experience I was looking for.`,
      default: (line) => `${line}.`
    },
    endings: (profile) => {
      if (profile.roleFamily === ROLE_FAMILIES.RECRUITING) return [
        'Would it be completely weird if one recruiter messaged another about an opportunity?',
        'Open to hearing about something new, or are we both pretending these messages are totally normal?',
        'Curious if you are open to new things, or fully in "not another recruiter DM" mode.'
      ];
      if (profile.roleFamily === ROLE_FAMILIES.LEADERSHIP) return [
        'Would it be worth sharing a bit more context, or is the timing not right?',
        'Open to a quick conversation about a role that might be relevant?',
        'Curious if something new would be worth a brief chat.'
      ];
      return [
        'Open to hearing about something new, or happily settled where you are?',
        'Would it be crazy timing to mention a role, or worth a quick look?',
        'Any openness to a new opportunity, or should I leave you in peace? 👀'
      ];
    },
    companyQ: (company) => company && !looksLikeLocation(company)
      ? `How are things going at ${company}?`
      : 'How is the current role treating you?'
  },

  formal: {
    intros: (name) => [
      `Hello ${name},`,
      `Dear ${name},`,
      `Hi ${name},`,
      `Good morning ${name},`
    ],
    openers: [
      'I came across your profile and wanted to reach out regarding',
      'After reviewing your background, I noticed',
      'Your profile caught my attention, specifically',
      'I took some time to review your experience and was drawn to',
      'I would like to reach out in relation to'
    ],
    hookWrap: {
      skills: (line) => `your expertise in ${line}, which is directly relevant to a position I am currently working on.`,
      activity: (line) => `your professional interest in ${line}, which aligns closely with the role in question.`,
      certifications: (line) => `your credentials in ${line}, which reflect a strong technical foundation.`,
      about: (line) => `your professional summary, which conveys a clear sense of your approach and values.`,
      role: (line) => `${line}, and I believe your background warrants a brief conversation.`,
      experience: (line) => `your experience in ${line}, which is highly relevant to a current opening.`,
      default: (line) => `${line}, which is relevant to an opportunity I have available.`
    },
    endings: (profile) => {
      if (profile.roleFamily === ROLE_FAMILIES.LEADERSHIP) return [
        'Should this be of interest, I would be glad to provide more context. Would a brief call be possible?',
        'I would appreciate the opportunity to share further details at your convenience.',
        'If the timing is right, I am available for a short call at your convenience.'
      ];
      return [
        'I would welcome the opportunity to discuss this further. Would you be open to a brief conversation?',
        'If you are currently exploring new opportunities, I would be happy to share more details.',
        'Should this be of interest, please feel free to reach out and I will provide additional context.'
      ];
    },
    companyQ: (company) => company && !looksLikeLocation(company)
      ? `I hope things are going well in your current role at ${company}.`
      : 'I hope things are going well in your current role.'
  },

  joke: {
    intros: (name) => [
      `${name}! (pause for effect)`,
      `Well well well, ${name}…`,
      `${name} 👀`,
      `Hi ${name} — bear with me here.`
    ],
    openers: [
      'LinkedIn decided we should connect and honestly I did not fight it —',
      'I was minding my own business on LinkedIn when your profile appeared and now here we are —',
      'Fun fact: I did not plan to message you today. Then I saw your profile because',
      'I have sent a lot of LinkedIn messages. This one is different. Mostly because',
      'Completely normal professional outreach incoming — specifically because'
    ],
    hookWrap: {
      skills: (line) => `you have ${line} on the same profile. The range. The audacity. Respect.`,
      activity: (line) => `${line} — LinkedIn thinks this is interesting and for once LinkedIn is right.`,
      certifications: (line) => `${line}… either very dedicated or deeply in love with exam stress. Either way, impressive.`,
      about: (line) => `your About section reads like a human wrote it. On LinkedIn. In this economy. Remarkable.`,
      role: (line) => `${line}. Bold career choices. I respect the journey.`,
      experience: (line) => `${line} showed up on your profile and I had approximately five questions.`,
      default: (line) => `${line}. Make it make sense (it does, I just enjoy the drama).`
    },
    endings: (profile) => {
      if (profile.roleFamily === ROLE_FAMILIES.RECRUITING) return [
        'One recruiter to another: want to hear about something that might actually be interesting, or shall we both go back to pretending LinkedIn is a normal place?',
        'I have a role. You have a great profile. Could be something. Worth 10 minutes?',
        'No pressure. Is this a good time to hear about something new?'
      ];
      return [
        'I have a role that might be relevant. Only one way to find out (it is a short call, I promise).',
        'Open to hearing about something new, or should I close this tab and pretend this never happened?',
        'No pressure, no 47-step intro. Is this a good time to hear about something new? 👀'
      ];
    },
    companyQ: (company) => company && !looksLikeLocation(company)
      ? `How is ${company} treating you these days?`
      : 'How is the current gig treating you?'
  }
};

// ── DOM REFS ──────────────────────────────────────────────────────────────────

const nameInput = document.getElementById('name');
const headlineInput = document.getElementById('headline');
const linkedinUrlInput = document.getElementById('linkedinUrl');
const outreachMessageInput = document.getElementById('outreachMessage');
const analyzeProfileButton = document.getElementById('analyzeProfile');
const prefillCurrentButton = document.getElementById('prefillCurrent');
const copyHooksButton = document.getElementById('copyHooks');
const copyMessageButton = document.getElementById('copyMessage');
const copyFullMessageButton = document.getElementById('copyFullMessage');
const regenerateMessageButton = document.getElementById('regenerateMessage');
const analysisStatus = document.getElementById('analysisStatus');
const fullMessageStatus = document.getElementById('fullMessageStatus');
const hooksCard = document.getElementById('hooksCard');
const hooksContainer = document.getElementById('hooks');
const charCountEl = document.getElementById('charCount');
const charCounterEl = document.querySelector('.char-counter');
const charWarningEl = document.getElementById('charWarning');
const jobUrlInput = document.getElementById('jobUrl');
const jobBudgetInput = document.getElementById('jobBudget');
const jobWorkModelInput = document.getElementById('jobWorkModel');

// ── STATE ─────────────────────────────────────────────────────────────────────

let currentProfile = null;
let currentHooks = [];
let selectedHook = null;
let currentTone = 'playful';

// ── INIT ──────────────────────────────────────────────────────────────────────

init();

function init() {
  analyzeProfileButton.addEventListener('click', analyzeCurrentProfile);
  prefillCurrentButton.addEventListener('click', prefillFromCurrentTab);
  copyHooksButton.addEventListener('click', () => copyText(formatHooksForClipboard(), 'Hooks copied.'));
  copyMessageButton.addEventListener('click', () => copyText(outreachMessageInput.value, 'Message copied.'));
  copyFullMessageButton.addEventListener('click', copyFullMessage);
  regenerateMessageButton.addEventListener('click', refreshMessageFromInputs);
  outreachMessageInput.addEventListener('input', updateCharCounter);

  document.querySelectorAll('.tone-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTone = btn.dataset.tone;
      document.querySelectorAll('.tone-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      refreshMessageFromInputs();
    });
  });
}

// ── PROFILE ANALYSIS ──────────────────────────────────────────────────────────

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
    setStatus('Profile analyzed. Pick a hook to build the message around it.');
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
  currentProfile = normalizeProfile(profile);
  currentHooks = buildHooks(currentProfile);
  selectedHook = currentHooks[0] || null;

  nameInput.value = currentProfile.name || nameInput.value;
  headlineInput.value = currentProfile.headline || headlineInput.value;
  linkedinUrlInput.value = currentProfile.url || linkedinUrlInput.value;

  renderHooks(currentHooks);
  refreshMessageFromInputs();
}

function normalizeProfile(profile) {
  const headline = profile.headline || '';
  const roleFamily = getRoleFamily(headline);
  const company = profile.currentCompany || findCompanyFromHeadline(headline);
  return {
    ...profile,
    roleFamily,
    roleCategory: profile.roleCategory || simplifyRole(headline),
    currentCompany: looksLikeLocation(company) ? '' : company
  };
}

// ── HOOKS ─────────────────────────────────────────────────────────────────────

function buildHooks(profile) {
  const hooks = [];
  const roleLabel = profile.roleCategory || simplifyRole(profile.headline);
  const company = profile.currentCompany;

  if (roleLabel || company || profile.headline) {
    addHook(hooks, {
      id: 'title',
      type: 'Current title',
      observation: `Headline: ${profile.headline || roleLabel}${company ? ` at ${company}` : ''}.`,
      suggestion: `Reference the role directly: "I saw you are ${roleLabel || profile.headline}${company ? ` at ${company}` : ''}. How is that going? Curious if something new might be on your radar."`,
      messageLine: `you are ${roleLabel || profile.headline}${company ? ` at ${company}` : ''}`,
      tone: 'role'
    });
  }

  const aboutHook = buildAboutHook(profile);
  if (aboutHook) addHook(hooks, aboutHook);

  const skillHook = buildRoleAwareSkillHook(profile);
  if (skillHook) addHook(hooks, skillHook);

  const certificationHook = buildCertificationHook(profile);
  if (certificationHook) addHook(hooks, certificationHook);

  const activityHook = buildActivityHook(profile);
  if (activityHook) addHook(hooks, activityHook);

  profile.experience?.slice(0, 2).forEach((item) => {
    if (looksLikeLocation(item)) return;
    addHook(hooks, {
      id: `experience-${item}`,
      type: 'Experience detail',
      observation: item,
      suggestion: `Use this as context and turn it into a question: "What have you enjoyed most about that kind of work?"`,
      messageLine: item,
      tone: 'experience'
    });
  });

  return uniqueHooks(hooks).slice(0, 12);
}

function buildAboutHook(profile) {
  if (!profile.aboutSummary) return null;
  return {
    id: 'about',
    type: 'About section',
    observation: profile.aboutSummary,
    suggestion: 'Reference a specific line from the About section. It reads far less templated than repeating their job title.',
    messageLine: profile.aboutSummary,
    tone: 'about'
  };
}

function buildRoleAwareSkillHook(profile) {
  const relevantSkills = getRoleRelevantSkills(profile);
  if (!relevantSkills.length) return null;

  const roleLabel = profile.roleCategory || simplifyRole(profile.headline) || 'your role';
  return {
    id: 'skills',
    type: 'Role-matched skills',
    observation: `For a ${roleLabel} profile, relevant skills found: ${formatList(relevantSkills)}.`,
    suggestion: `Name only 2-3 skills: "I saw ${relevantSkills.slice(0, 2).join(' and ')} on your profile — is that still a big part of your day-to-day?"`,
    messageLine: formatList(relevantSkills.slice(0, 3)),
    tone: 'skills'
  };
}

function buildCertificationHook(profile) {
  const certifications = profile.certifications?.slice(0, 5) || [];
  if (!certifications.length) return null;
  return {
    id: 'certifications',
    type: 'Certifications',
    observation: `Certification signals found: ${formatList(certifications)}.`,
    suggestion: 'Ask how those certifications connect to their actual work, rather than assuming they want a role that lists them as requirements.',
    messageLine: formatList(certifications.slice(0, 2)),
    tone: 'certifications'
  };
}

function buildActivityHook(profile) {
  const themes = profile.activityThemes?.slice(0, 4) || [];
  if (!themes.length) return null;

  const mainTheme = themes[0].label;
  return {
    id: 'activity',
    type: 'Posts / activity themes',
    observation: `Visible activity around: ${formatList(themes.map((t) => `${t.label} (${t.count})`))}.`,
    suggestion: `Use it gently: "I saw some ${mainTheme} signals in your activity — is that a topic you genuinely follow or just LinkedIn being LinkedIn?"`,
    messageLine: mainTheme,
    tone: 'activity'
  };
}

function addHook(hooks, hook) {
  if (!hook.observation && !hook.suggestion) return;
  hooks.push(hook);
}

// ── RENDER HOOKS ──────────────────────────────────────────────────────────────

function renderHooks(hooks) {
  hooksContainer.innerHTML = '';

  if (!hooks.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No strong hooks detected. Try scrolling the LinkedIn profile to load more sections, then analyze again.';
    hooksContainer.appendChild(empty);
    hooksCard.classList.remove('hidden');
    return;
  }

  hooks.forEach((hook) => {
    const card = document.createElement('article');
    card.className = `hook-card${selectedHook?.id === hook.id ? ' selected' : ''}`;

    const title = document.createElement('strong');
    title.textContent = hook.type;

    const observation = document.createElement('p');
    observation.textContent = hook.observation;

    const suggestion = document.createElement('small');
    suggestion.textContent = hook.suggestion;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary compact';
    button.textContent = selectedHook?.id === hook.id ? 'Selected' : 'Use this hook';
    button.addEventListener('click', () => selectHook(hook));

    card.append(title, observation, suggestion, button);
    hooksContainer.appendChild(card);
  });

  hooksCard.classList.remove('hidden');
}

function selectHook(hook) {
  selectedHook = hook;
  renderHooks(currentHooks);
  refreshMessageFromInputs();
}

// ── MESSAGE GENERATION ────────────────────────────────────────────────────────

function buildOutreachMessage(profile) {
  const firstName = (profile.name || '').split(' ')[0] || 'there';
  const hook = selectedHook || currentHooks[0];
  const tpl = TONE_TEMPLATES[currentTone] || TONE_TEMPLATES.playful;

  const intro = randomItem(tpl.intros(firstName));
  const ending = randomItem(tpl.endings(profile));
  const companyLine = tpl.companyQ(profile.currentCompany);
  const hookSentence = hook
    ? buildHookSentence(hook, tpl)
    : `${randomItem(tpl.openers)} your profile felt relevant to a role I am working on.`;

  return [intro, hookSentence, companyLine, ending].join('\n\n');
}

function buildHookSentence(hook, tpl) {
  const opener = randomItem(tpl.openers);
  const wrap = tpl.hookWrap[hook.tone] || tpl.hookWrap.default;
  return `${opener} ${wrap(hook.messageLine || hook.observation)}`;
}

function refreshMessageFromInputs() {
  const profile = {
    ...(currentProfile || {}),
    name: nameInput.value.trim(),
    headline: headlineInput.value.trim(),
    roleFamily: getRoleFamily(headlineInput.value.trim()),
    roleCategory: simplifyRole(headlineInput.value.trim()),
    currentCompany: (() => {
      const raw = currentProfile?.currentCompany || findCompanyFromHeadline(headlineInput.value.trim());
      return looksLikeLocation(raw) ? '' : raw;
    })()
  };

  outreachMessageInput.value = buildOutreachMessage(profile);
  updateCharCounter();
}

// ── CHAR COUNTER ──────────────────────────────────────────────────────────────

function updateCharCounter() {
  const len = outreachMessageInput.value.length;
  charCountEl.textContent = len;
  const over = len > 295;
  charCounterEl.classList.toggle('over', over);
  charWarningEl.classList.toggle('hidden', !over);
}

// ── JOB DETAILS / FULL MESSAGE ────────────────────────────────────────────────

function buildJobDetailsBlock() {
  const url = jobUrlInput.value.trim();
  const budget = jobBudgetInput.value.trim();
  const workModel = jobWorkModelInput.value;

  const lines = [];
  if (url) lines.push(url);
  lines.push('Direct contract with client');
  if (budget) lines.push(`Budget: max ${budget} gross/year`);
  lines.push(workModel);
  lines.push('');
  lines.push('What do you think? Want to talk?');

  return lines.join('\n');
}

async function copyFullMessage() {
  const shortMsg = outreachMessageInput.value.trim();
  if (!shortMsg) {
    fullMessageStatus.textContent = 'Generate a message draft first.';
    return;
  }
  const full = `${shortMsg}\n\n${buildJobDetailsBlock()}`;
  await navigator.clipboard.writeText(full);
  fullMessageStatus.textContent = 'Full message copied.';
  setTimeout(() => { fullMessageStatus.textContent = ''; }, 2500);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function looksLikeLocation(value = '') {
  return /\b(portugal|spain|france|germany|netherlands|uk|brazil|united states|usa|remote|lisbon|lisboa|porto|madrid|barcelona|london|berlin|amsterdam|paris)\b/i.test(value) ||
    /,\s*[a-z]{2,}$/i.test(value);
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
  setStatus('Current LinkedIn tab link loaded.');
}

async function getActiveTab() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return activeTab;
}

function isLinkedInProfile(url = '') {
  return /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\//i.test(url) ||
    /^https:\/\/www\.linkedin\.com\/in\//i.test(url);
}

function formatHooksForClipboard() {
  if (!currentHooks.length) return '';
  return currentHooks.map((h) => `- ${h.type}: ${h.observation}\n  Tip: ${h.suggestion}`).join('\n');
}

async function copyText(value, successMessage) {
  if (!value.trim()) {
    setStatus('Nothing to copy yet.');
    return;
  }
  await navigator.clipboard.writeText(value);
  setStatus(successMessage);
}

function getRoleRelevantSkills(profile) {
  const roleFamily = profile.roleFamily || getRoleFamily(profile.headline);
  const detectedSkills = profile.technicalSkills || [];
  const allowedSkills = getAllowedSkillsForProfile(profile);

  if ([ROLE_FAMILIES.SOFTWARE, ROLE_FAMILIES.DATA, ROLE_FAMILIES.CLOUD].includes(roleFamily)) {
    return detectedSkills.filter((s) => allowedSkills.some((a) => sameSkillFamily(s, a))).slice(0, 6);
  }
  if ([ROLE_FAMILIES.PRODUCT, ROLE_FAMILIES.RECRUITING, ROLE_FAMILIES.DESIGN, ROLE_FAMILIES.LEADERSHIP].includes(roleFamily)) {
    const profileText = [...(profile.skills || []), ...(profile.experience || [])].join(' ');
    return allowedSkills.filter((s) => profileText.toLowerCase().includes(s.toLowerCase())).slice(0, 5);
  }
  return [];
}

function getAllowedSkillsForProfile(profile) {
  const headline = (profile.headline || '').toLowerCase();
  const roleFamily = profile.roleFamily || getRoleFamily(profile.headline);

  if (/back\s?end|backend/.test(headline)) {
    return ['Node.js', 'Java', 'Python', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Kafka', 'API', 'Microservices', 'AWS', 'Azure', 'GCP'];
  }
  if (/front\s?end|frontend/.test(headline)) {
    return ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'HTML', 'CSS', 'UI', 'Design Systems'];
  }
  if (/full\s?stack|full-stack/.test(headline)) {
    return FAMILY_SKILL_HINTS[ROLE_FAMILIES.SOFTWARE];
  }
  return FAMILY_SKILL_HINTS[roleFamily] || [];
}

function getRoleFamily(headline = '') {
  const lower = headline.toLowerCase();
  if (/recruit|talent|sourc/.test(lower)) return ROLE_FAMILIES.RECRUITING;
  if (/product owner|product manager|\bpm\b|product lead/.test(lower)) return ROLE_FAMILIES.PRODUCT;
  if (/designer|\bux\b|\bui\b|researcher/.test(lower)) return ROLE_FAMILIES.DESIGN;
  if (/data|analytics|machine learning|\bml\b|\bai\b/.test(lower)) return ROLE_FAMILIES.DATA;
  if (/devops|cloud|site reliability|\bsre\b|platform|infrastructure/.test(lower)) return ROLE_FAMILIES.CLOUD;
  if (/full\s?stack|front\s?end|frontend|back\s?end|backend|software|developer|engineer|programmer|architect/.test(lower)) return ROLE_FAMILIES.SOFTWARE;
  if (/manager|lead|head of|director|vp/.test(lower)) return ROLE_FAMILIES.LEADERSHIP;
  return ROLE_FAMILIES.GENERAL;
}

function simplifyRole(headline = '') {
  const lower = headline.toLowerCase();
  if (/recruit|talent acquisition/.test(lower)) return 'Recruiter / Talent Acquisition';
  if (/product owner|product manager|product lead/.test(lower)) return 'Product Manager';
  if (/full\s?stack|full-stack/.test(lower)) return 'Fullstack Developer';
  if (/front\s?end|frontend/.test(lower)) return 'Frontend Developer';
  if (/back\s?end|backend/.test(lower)) return 'Backend Developer';
  if (/devops|site reliability|sre/.test(lower)) return 'DevOps Engineer';
  if (/data engineer/.test(lower)) return 'Data Engineer';
  if (/data scientist|machine learning|\bml\b|\bai\b/.test(lower)) return 'AI / Data Scientist';
  if (/architect/.test(lower)) return 'Software Architect';
  if (/engineer|developer|programmer/.test(lower)) return 'Software Engineer';
  if (/manager|lead|head of/.test(lower)) return 'Engineering Manager';
  return headline.split('|')[0].split(' at ')[0].trim();
}

function findCompanyFromHeadline(headline = '') {
  return headline.match(/\b(?:at|@)\s+([^|*,-]+)/i)?.[1]?.trim() || '';
}

function sameSkillFamily(left, right) {
  return left.toLowerCase().includes(right.toLowerCase()) || right.toLowerCase().includes(left.toLowerCase());
}

function formatList(items) {
  return items.filter(Boolean).slice(0, 8).join(', ');
}

function setStatus(message) {
  analysisStatus.textContent = message;
}

function randomItem(items = []) {
  if (!items.length) return '';
  return items[Math.floor(Math.random() * items.length)];
}

function uniqueHooks(hooks) {
  const seen = new Set();
  return hooks.filter((h) => {
    const key = `${h.type}:${h.observation}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function lowercaseFirstLetter(value) {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}
