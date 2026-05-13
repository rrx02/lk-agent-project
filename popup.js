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

const nameInput = document.getElementById('name');
const headlineInput = document.getElementById('headline');
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
let selectedHook = null;

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
    setStatus('Profile analyzed. Pick one hook to rewrite the message around it. Add a photo/banner note if you see something fun.');
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

  renderHooks(currentHooks, currentProfile);
  refreshMessageFromInputs();
}

function normalizeProfile(profile) {
  const headline = profile.headline || '';
  const roleFamily = getRoleFamily(headline);
  return {
    ...profile,
    roleFamily,
    roleCategory: profile.roleCategory || simplifyRole(headline),
    currentCompany: profile.currentCompany || findCompanyFromHeadline(headline)
  };
}

function buildHooks(profile) {
  const hooks = [];
  const roleLabel = profile.roleCategory || simplifyRole(profile.headline);
  const company = profile.currentCompany;

  if (roleLabel || company || profile.headline) {
    addHook(hooks, {
      id: 'title',
      type: 'Current title',
      observation: `Their headline says ${profile.headline || roleLabel}${company ? `, with ${company} as the current company` : ''}.`,
      suggestion: `Keep it simple and accurate: “I saw you’re ${roleLabel || profile.headline}${company ? ` at ${company}` : ''}. How’s that going? Casually curious if something new is on your radar?”`,
      messageLine: `I saw you’re ${roleLabel || profile.headline}${company ? ` at ${company}` : ''}, and I was curious how that chapter is going`,
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
    addHook(hooks, {
      id: `experience-${item}`,
      type: 'Experience detail',
      observation: item,
      suggestion: `Use this only as context and turn it into a question: “What have you enjoyed most about that role?”`,
      messageLine: `${item}, and it looked close to the kind of profile I’m researching`,
      tone: 'experience'
    });
  });

  return uniqueHooks(hooks).slice(0, 14);
}

function buildAboutHook(profile) {
  if (!profile.aboutSummary) return null;

  return {
    id: 'about',
    type: 'About section',
    observation: profile.aboutSummary,
    suggestion: 'Reference one specific line from the About section and ask a light follow-up. It feels much less copy-paste than repeating their job title.',
    messageLine: `your About section had a line that stood out to me: “${profile.aboutSummary}”`,
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
    observation: `For a ${roleLabel} profile, the most relevant skills I found are: ${formatList(relevantSkills)}.`,
    suggestion: `Use only skills that match the title. Example: “I saw ${relevantSkills.slice(0, 2).join(' and ')} on your profile — is that still a big part of your day-to-day?”`,
    messageLine: `${formatList(relevantSkills.slice(0, 3))} on your profile, which actually lines up with the kind of ${roleLabel} background I’m looking at`,
    tone: 'skills'
  };
}

function buildCertificationHook(profile) {
  const certifications = profile.certifications?.slice(0, 5) || [];
  if (!certifications.length) return null;

  return {
    id: 'certifications',
    type: 'Certifications',
    observation: `I found certification or credential signals around: ${formatList(certifications)}.`,
    suggestion: 'Ask how those certifications connect to their actual work, rather than assuming they want another certification-heavy role.',
    messageLine: `${formatList(certifications.slice(0, 2))} certification signals and wondered if those are part of your current work or more of a “collecting badges like Pokémon” situation`,
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
    observation: `Visible activity points to repeated themes like ${formatList(themes.map((theme) => `${theme.label} (${theme.count})`))}.`,
    suggestion: `Do not over-focus on random likes. Use it softly: “I saw a few ${mainTheme} signals around your activity — is that a topic you actually enjoy?”`,
    messageLine: `${mainTheme} signals around your public activity and wondered if that’s a topic you actually enjoy, or if LinkedIn’s algorithm is just being LinkedIn again`,
    tone: 'activity'
  };
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

function renderVisualHooks(profile) {
  const wrapper = document.createElement('div');
  wrapper.className = 'visual-grid';

  wrapper.append(
    createVisualCard({
      title: 'Profile photo',
      image: profile?.profileImage,
      comment: buildImageComment('photo', profile?.profileImage),
      prompt: 'Use the actual photo preview here. If it shows a city, event, medal, sport, pet, or funny detail, add a short note below and the draft will rewrite around it.'
    }),
    createVisualCard({
      title: 'Banner',
      image: profile?.bannerImage,
      comment: buildImageComment('banner', profile?.bannerImage),
      prompt: 'Use the actual banner preview here. If it has technologies, architecture diagrams, cloud logos, certifications, or a skyline, ask about that connection.'
    })
  );

  hooksContainer.appendChild(wrapper);
}

function createVisualCard({ title, image, comment, prompt }) {
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

  const commentText = document.createElement('p');
  commentText.textContent = comment;
  card.appendChild(commentText);

  const hint = document.createElement('small');
  hint.textContent = prompt;
  card.appendChild(hint);

  return card;
}

function buildImageComment(type, image) {
  if (!image?.src) {
    return `I could not detect a ${type} image preview on this profile. If you can see one on LinkedIn, add the human observation manually.`;
  }

  const alt = image.alt && !/profile|background|image|photo/i.test(image.alt) ? ` The alt text says “${image.alt}”, which may be usable if it matches what you see.` : '';
  if (type === 'banner') {
    return `The candidate has a custom banner image. I can show it, but I cannot reliably understand the objects without vision AI.${alt} If you see tech logos, a city, certificates, or architecture, that is likely the strongest visual opener.`;
  }

  return `The candidate has a visible profile photo. I can show it, but I cannot reliably identify the scene without vision AI.${alt} If the photo has a city, event, sport, pet, or something funny, use that as a light opener.`;
}

function selectHook(hook) {
  selectedHook = hook;
  renderHooks(currentHooks, currentProfile);
  refreshMessageFromInputs();
}

function buildOutreachMessage(profile, hooks, visualNote) {
  const firstName = (profile.name || '').split(' ')[0];
  const hook = selectedHook || hooks[0];
  const visualSentence = visualNote ? ` Also, random but I noticed ${lowercaseFirstLetter(visualNote)} — had to mention it.` : '';
  const hookSentence = hook ? buildHookSentence(hook) : `I came across your profile and it felt relevant to a role I’m working on.`;
  const roleContext = profile.roleCategory || simplifyRole(profile.headline) || 'your background';
  const companyQuestion = profile.currentCompany ? `How are things going at ${profile.currentCompany}?` : `How are things going in your current role?`;

  return `Hey${firstName ? ` ${firstName}` : ''},\n\n${hookSentence}${visualSentence}\n\n${companyQuestion} Tiny recruiter question, promise: would you be open to hearing about something new that is close to your ${roleContext} world, or should I quietly disappear back into the LinkedIn jungle?\n\nThanks!`;
}

function buildHookSentence(hook) {
  if (hook.tone === 'role') return `I saw your title and noticed ${hook.messageLine}.`;
  if (hook.tone === 'skills') return `I noticed ${hook.messageLine}.`;
  if (hook.tone === 'certifications') return `I noticed ${hook.messageLine}.`;
  if (hook.tone === 'activity') return `I noticed ${hook.messageLine}.`;
  if (hook.tone === 'about') return `I read your About section and ${hook.messageLine}.`;
  return `I noticed ${hook.messageLine || hook.observation}.`;
}

function refreshMessageFromInputs() {
  const profile = {
    ...(currentProfile || {}),
    name: nameInput.value.trim(),
    headline: headlineInput.value.trim(),
    roleFamily: getRoleFamily(headlineInput.value.trim()),
    roleCategory: simplifyRole(headlineInput.value.trim()),
    currentCompany: currentProfile?.currentCompany || findCompanyFromHeadline(headlineInput.value.trim())
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
  return currentHooks.map((hook) => `- ${hook.type}: ${hook.observation}\n  Tip: ${hook.suggestion}`).join('\n');
}

async function copyText(value, successMessage) {
  if (!value.trim()) {
    setStatus('There is nothing to copy yet.');
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
    return detectedSkills.filter((skill) => allowedSkills.some((allowed) => sameSkillFamily(skill, allowed))).slice(0, 6);
  }

  if ([ROLE_FAMILIES.PRODUCT, ROLE_FAMILIES.RECRUITING, ROLE_FAMILIES.DESIGN, ROLE_FAMILIES.LEADERSHIP].includes(roleFamily)) {
    const profileTextSkills = [...(profile.skills || []), ...(profile.experience || [])].join(' ');
    return allowedSkills.filter((skill) => profileTextSkills.toLowerCase().includes(skill.toLowerCase())).slice(0, 5);
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
  if (/recruit|talent acquisition/.test(lower)) return 'Recruiter / Talent Acquisition profile';
  if (/product owner|product manager|product lead/.test(lower)) return 'Product profile';
  if (/full\s?stack|full-stack/.test(lower)) return 'Fullstack Developer';
  if (/front\s?end|frontend/.test(lower)) return 'Frontend Developer';
  if (/back\s?end|backend/.test(lower)) return 'Backend Developer';
  if (/devops|site reliability|sre/.test(lower)) return 'DevOps Engineer';
  if (/data engineer/.test(lower)) return 'Data Engineer';
  if (/data scientist|machine learning|\bml\b|\bai\b/.test(lower)) return 'AI/Data profile';
  if (/architect/.test(lower)) return 'Software Architect';
  if (/engineer|developer|programmer/.test(lower)) return 'Software Engineer';
  if (/manager|lead|head of/.test(lower)) return 'Leadership profile';
  return headline.split('|')[0].split(' at ')[0].trim();
}

function findCompanyFromHeadline(headline = '') {
  return headline.match(/\b(?:at|@)\s+([^|•,-]+)/i)?.[1]?.trim() || '';
}

function sameSkillFamily(left, right) {
  const normalizedLeft = left.toLowerCase();
  const normalizedRight = right.toLowerCase();
  return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
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
