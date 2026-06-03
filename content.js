const CERTIFICATION_KEYWORDS = [
  'aws',
  'azure',
  'gcp',
  'google cloud',
  'kubernetes',
  'cka',
  'ckad',
  'terraform',
  'cisco',
  'ccna',
  'ccnp',
  'pmp',
  'scrum',
  'salesforce',
  'security+',
  'cissp',
  'databricks',
  'snowflake'
];

const CLOUD_KEYWORDS = [
  'aws',
  'azure',
  'gcp',
  'google cloud',
  'kubernetes',
  'docker',
  'terraform',
  'devops',
  'cloud',
  'serverless',
  'microservices',
  'ci/cd'
];

const TECHNICAL_SKILL_KEYWORDS = [
  'javascript',
  'typescript',
  'react',
  'angular',
  'vue',
  'node.js',
  'node',
  'python',
  'java',
  'c#',
  '.net',
  'spring',
  'sql',
  'postgresql',
  'mysql',
  'mongodb',
  'kafka',
  'spark',
  'databricks',
  'snowflake',
  'aws',
  'azure',
  'gcp',
  'docker',
  'kubernetes',
  'terraform',
  'jenkins',
  'github actions',
  'ci/cd',
  'machine learning',
  'ai',
  'llm',
  'cybersecurity'
];

const ACTIVITY_TOPIC_KEYWORDS = [
  { label: 'Azure', keywords: ['azure', 'microsoft cloud'] },
  { label: 'AWS', keywords: ['aws', 'amazon web services'] },
  { label: 'Google Cloud', keywords: ['gcp', 'google cloud'] },
  { label: 'AI / Machine Learning', keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'genai'] },
  { label: 'Cloud', keywords: ['cloud', 'serverless', 'kubernetes', 'docker'] },
  { label: 'Data', keywords: ['data', 'analytics', 'snowflake', 'databricks', 'spark'] },
  { label: 'Cybersecurity', keywords: ['security', 'cybersecurity', 'cissp', 'zero trust'] },
  { label: 'DevOps', keywords: ['devops', 'terraform', 'ci/cd', 'sre'] },
  { label: 'Frontend', keywords: ['frontend', 'react', 'angular', 'vue'] },
  { label: 'Backend', keywords: ['backend', 'api', 'microservices'] }
];

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'EXTRACT_LINKEDIN_PROFILE') return false;

  sendResponse(extractLinkedInProfile());
  return true;
});

function extractLinkedInProfile() {
  const visibleText = getVisibleText(document.body);
  const sections = collectLikelySections();
  const name = getName();
  const headline = getHeadline(name);
  const location = getLocation();
  const profileImage = getProfileImage();
  const bannerImage = getBannerImage(profileImage?.src);
  const certifications = findMatchedKeywords(visibleText, CERTIFICATION_KEYWORDS, 8);
  const cloudSignals = findMatchedKeywords(visibleText, CLOUD_KEYWORDS, 8);
  const recentActivity = findRecentActivity(sections, visibleText);
  const technicalSkills = findTechnicalSkills(sections, visibleText);
  const activityThemes = findActivityThemes(visibleText);
  const currentCompany = findCurrentCompany(headline, sections.experience);
  const roleCategory = simplifyRole(headline);
  const aboutSummary = summarizeAbout(sections.about);

  return {
    url: locationHrefWithoutTracking(),
    title: document.title,
    name,
    headline,
    location,
    currentCompany,
    roleCategory,
    about: sections.about,
    aboutSummary,
    experience: sections.experience,
    education: sections.education,
    skills: sections.skills,
    certifications,
    cloudSignals,
    technicalSkills,
    activityThemes,
    recentActivity,
    profileImage,
    bannerImage,
    extractedAt: new Date().toISOString()
  };
}

function getName() {
  const nameOptions = [
    document.querySelector('main h1')?.innerText,
    document.querySelector('h1')?.innerText,
    document.querySelector('[data-generated-suggestion-target]')?.innerText
  ];

  return cleanLine(nameOptions.find(Boolean)) || cleanLine(document.title.split('|')[0]);
}

function getHeadline(name) {
  const topCard = document.querySelector('main section') || document.querySelector('main');
  const lines = getVisibleText(topCard).split('\n').map(cleanLine).filter(Boolean);
  const nameIndex = lines.findIndex((line) => sameText(line, name));
  const afterName = nameIndex >= 0 ? lines.slice(nameIndex + 1) : lines;

  return afterName.find((line) =>
    line.length > 10 &&
    !isProfileChromeLine(line) &&
    !line.includes('LinkedIn')
  ) || '';
}

function getLocation() {
  const topCard = document.querySelector('main section') || document.querySelector('main');
  const lines = getVisibleText(topCard).split('\n').map(cleanLine).filter(Boolean);
  return lines.find((line) =>
    /,| area$| region$| portugal| spain| united states| uk| brazil| france| germany| netherlands| remote/i.test(line) &&
    !isProfileChromeLine(line)
  ) || '';
}

function isProfileChromeLine(line) {
  const normalized = cleanLine(line).toLowerCase();
  const profileInfoLabel = [String.fromCharCode(99, 111, 110, 116, 97, 99, 116), 'info'].join(' ');
  return /^(connect|message|follow|followers|connections|open to work)$/.test(normalized) || normalized === profileInfoLabel;
}

function collectLikelySections() {
  const sections = {
    about: '',
    experience: [],
    education: [],
    skills: []
  };

  document.querySelectorAll('section').forEach((section) => {
    const text = getVisibleText(section);
    const normalized = text.toLowerCase();

    if (normalized.includes('\nabout\n') || normalized.startsWith('about\n')) {
      sections.about = trimSectionText(text, 'about', 700);
    }

    if (normalized.includes('\nexperience\n') || normalized.startsWith('experience\n')) {
      sections.experience = extractSectionHighlights(text, 'experience', 7);
    }

    if (normalized.includes('\neducation\n') || normalized.startsWith('education\n')) {
      sections.education = extractSectionHighlights(text, 'education', 5);
    }

    if (normalized.includes('\nskills\n') || normalized.startsWith('skills\n')) {
      sections.skills = extractSectionHighlights(text, 'skills', 12);
    }
  });

  return sections;
}

function trimSectionText(text, sectionName, maxLength) {
  const lines = text.split('\n').map(cleanLine).filter(Boolean);
  const startIndex = lines.findIndex((line) => line.toLowerCase() === sectionName);
  const content = lines
    .slice(startIndex >= 0 ? startIndex + 1 : 0)
    .filter((line) => !/^(show all|see more|…see more)$/i.test(line))
    .join(' ');

  return content.length > maxLength ? `${content.slice(0, maxLength).trim()}…` : content;
}

function extractSectionHighlights(text, sectionName, maxItems) {
  const skip = new Set([
    sectionName,
    'show all',
    'see more',
    'show more',
    'show less',
    'company name',
    'full-time',
    'part-time'
  ]);

  return unique(
    text
      .split('\n')
      .map(cleanLine)
      .filter((line) => line.length > 2)
      .filter((line) => !skip.has(line.toLowerCase()))
      .filter((line) => !/^\d+/.test(line))
  ).slice(0, maxItems);
}


function findMatchedKeywords(text, keywords, maxItems) {
  const normalized = text.toLowerCase();
  return unique(keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()))).slice(0, maxItems);
}

function findTechnicalSkills(sections, visibleText) {
  const skillText = [...sections.skills, visibleText].join('\n').toLowerCase();
  return unique(
    TECHNICAL_SKILL_KEYWORDS.filter((skill) => skillText.includes(skill.toLowerCase()))
      .map((skill) => normalizeSkillLabel(skill))
  ).slice(0, 12);
}

function findActivityThemes(visibleText) {
  const lower = visibleText.toLowerCase();
  return ACTIVITY_TOPIC_KEYWORDS.map((theme) => ({
    label: theme.label,
    count: theme.keywords.reduce((total, keyword) => total + countOccurrences(lower, keyword.toLowerCase()), 0)
  }))
    .filter((theme) => theme.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function countOccurrences(text, keyword) {
  if (!keyword) return 0;
  if (/^[a-z0-9+#./-]{1,3}$/i.test(keyword)) {
    return (text.match(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'g')) || []).length;
  }
  return text.split(keyword).length - 1;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findCurrentCompany(headline, experience) {
  const headlineCompany = headline.match(/\b(?:at|@)\s+([^|•,-]+)/i)?.[1];
  if (headlineCompany) return cleanLine(headlineCompany);

  const experienceCompany = experience.find((line) =>
    !/engineer|developer|architect|manager|lead|consultant|analyst|specialist|present|full-time|part-time/i.test(line)
  );
  return cleanLine(experienceCompany || '');
}

function simplifyRole(headline = '') {
  const lower = headline.toLowerCase();
  if (/full\s?stack|full-stack/.test(lower)) return 'Fullstack Developer';
  if (/front\s?end|frontend/.test(lower)) return 'Frontend Developer';
  if (/back\s?end|backend/.test(lower)) return 'Backend Developer';
  if (/devops|site reliability|sre/.test(lower)) return 'DevOps Engineer';
  if (/data engineer/.test(lower)) return 'Data Engineer';
  if (/data scientist|machine learning|\bml\b|\bai\b/.test(lower)) return 'AI/Data specialist';
  if (/architect/.test(lower)) return 'Software Architect';
  if (/engineer|developer|programmer/.test(lower)) return 'Software Engineer';
  if (/manager|lead|head of/.test(lower)) return 'Tech Lead/Manager';
  return cleanLine(headline.split('|')[0].split(' at ')[0]);
}

function summarizeAbout(about = '') {
  if (!about) return '';
  const sentences = about.match(/[^.!?]+[.!?]?/g) || [about];
  return cleanLine(sentences.slice(0, 2).join(' ')).slice(0, 260);
}

function normalizeSkillLabel(skill) {
  const labels = {
    'node': 'Node.js',
    'node.js': 'Node.js',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'react': 'React',
    'angular': 'Angular',
    'vue': 'Vue',
    'python': 'Python',
    'java': 'Java',
    'c#': 'C#',
    '.net': '.NET',
    'sql': 'SQL',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'mongodb': 'MongoDB',
    'kafka': 'Kafka',
    'spark': 'Spark',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',
    'ci/cd': 'CI/CD',
    'ai': 'AI',
    'llm': 'LLM'
  };
  return labels[skill.toLowerCase()] || skill;
}

function findKeywordLines(text, keywords, maxItems) {
  const lines = text.split('\n').map(cleanLine).filter((line) => line.length > 3);
  return unique(lines.filter((line) =>
    keywords.some((keyword) => line.toLowerCase().includes(keyword))
  )).slice(0, maxItems);
}

function findRecentActivity(sections, visibleText) {
  const activityLines = findKeywordLines(visibleText, ['posted', 'reposted', 'commented', 'likes', 'celebrates'], 10);
  if (activityLines.length) return activityLines;

  return unique([
    ...sections.experience.filter((line) => /present|current|at |engineer|manager|lead|developer|architect/i.test(line)),
    ...sections.skills.slice(0, 4)
  ]).slice(0, 8);
}

function getProfileImage() {
  const image = Array.from(document.images).find((img) =>
    /profile|photo|member/i.test(`${img.alt} ${img.className}`) && img.naturalWidth >= 80
  );

  return image ? imageDetails(image) : null;
}

function getBannerImage(profileImageSrc) {
  const image = Array.from(document.images).find((img) =>
    img.src !== profileImageSrc &&
    (img.naturalWidth >= 300 || /background|banner/i.test(`${img.alt} ${img.className}`))
  );

  return image ? imageDetails(image) : null;
}

function imageDetails(image) {
  return {
    alt: cleanLine(image.alt),
    src: image.currentSrc || image.src,
    width: image.naturalWidth,
    height: image.naturalHeight
  };
}

function getVisibleText(node) {
  if (!node) return '';
  return (node.innerText || node.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function cleanLine(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function sameText(left = '', right = '') {
  return cleanLine(left).toLowerCase() === cleanLine(right).toLowerCase();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function locationHrefWithoutTracking() {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  return url.toString();
}
