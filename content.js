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
  const certifications = findKeywordLines(visibleText, CERTIFICATION_KEYWORDS, 8);
  const cloudSignals = findKeywordLines(visibleText, CLOUD_KEYWORDS, 8);
  const recentActivity = findRecentActivity(sections, visibleText);

  return {
    url: locationHrefWithoutTracking(),
    title: document.title,
    name,
    headline,
    location,
    about: sections.about,
    experience: sections.experience,
    education: sections.education,
    skills: sections.skills,
    certifications,
    cloudSignals,
    recentActivity,
    profileImage,
    bannerImage,
    extractedAt: new Date().toISOString()
  };
}

function getName() {
  const candidates = [
    document.querySelector('main h1')?.innerText,
    document.querySelector('h1')?.innerText,
    document.querySelector('[data-generated-suggestion-target]')?.innerText
  ];

  return cleanLine(candidates.find(Boolean)) || cleanLine(document.title.split('|')[0]);
}

function getHeadline(name) {
  const topCard = document.querySelector('main section') || document.querySelector('main');
  const lines = getVisibleText(topCard).split('\n').map(cleanLine).filter(Boolean);
  const nameIndex = lines.findIndex((line) => sameText(line, name));
  const afterName = nameIndex >= 0 ? lines.slice(nameIndex + 1) : lines;

  return afterName.find((line) =>
    line.length > 10 &&
    !/^(connect|message|follow|contact info|followers|connections|open to work)$/i.test(line) &&
    !line.includes('LinkedIn')
  ) || '';
}

function getLocation() {
  const topCard = document.querySelector('main section') || document.querySelector('main');
  const lines = getVisibleText(topCard).split('\n').map(cleanLine).filter(Boolean);
  return lines.find((line) =>
    /,| area$| region$| portugal| spain| united states| uk| brazil| france| germany| netherlands| remote/i.test(line) &&
    !/followers|connections|contact info/i.test(line)
  ) || '';
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
