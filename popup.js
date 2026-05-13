 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/linkedin-contact-tracker/popup.js b/linkedin-contact-tracker/popup.js
index aef44b2b33c607a2b2ed45a7077230f3080e0a0f..7e72216b9c0b3347192ca750ff6917705ab46cd0 100644
--- a/linkedin-contact-tracker/popup.js
+++ b/linkedin-contact-tracker/popup.js
@@ -1,156 +1,329 @@
 const STORAGE_KEY = 'linkedinContacts';
 const STATUSES = [
-  'Novo',
-  'Contactado',
-  'Respondeu',
-  'Entrevista',
-  'Submissão',
-  'Sem resposta',
-  'Rejeitado'
+  'New',
+  'Contacted',
+  'Responded',
+  'Interview',
+  'Submitted',
+  'No response',
+  'Rejected'
 ];
 
 const form = document.getElementById('contactForm');
 const nameInput = document.getElementById('name');
+const headlineInput = document.getElementById('headline');
+const locationInput = document.getElementById('location');
 const linkedinUrlInput = document.getElementById('linkedinUrl');
+const visualNoteInput = document.getElementById('visualNote');
+const profileNotesInput = document.getElementById('profileNotes');
+const outreachMessageInput = document.getElementById('outreachMessage');
+const analyzeProfileButton = document.getElementById('analyzeProfile');
 const prefillCurrentButton = document.getElementById('prefillCurrent');
+const copyMessageButton = document.getElementById('copyMessage');
+const analysisStatus = document.getElementById('analysisStatus');
 const contactsContainer = document.getElementById('contacts');
 const metricsContainer = document.getElementById('metrics');
 const contactTemplate = document.getElementById('contactTemplate');
+const insightsCard = document.getElementById('insightsCard');
+const insightsContainer = document.getElementById('insights');
 
 init();
 
 async function init() {
   await render();
 
   form.addEventListener('submit', async (event) => {
     event.preventDefault();
 
     const contact = {
       id: crypto.randomUUID(),
       name: nameInput.value.trim(),
+      headline: headlineInput.value.trim(),
+      location: locationInput.value.trim(),
       linkedinUrl: linkedinUrlInput.value.trim(),
-      status: 'Novo',
+      visualNote: visualNoteInput.value.trim(),
+      profileNotes: profileNotesInput.value.trim(),
+      outreachMessage: outreachMessageInput.value.trim(),
+      status: 'New',
       createdAt: new Date().toISOString()
     };
 
     if (!contact.name || !contact.linkedinUrl) return;
 
     const contacts = await getContacts();
     contacts.unshift(contact);
     await saveContacts(contacts);
 
     form.reset();
+    clearInsights();
     await render();
+    setStatus('Candidate saved.');
   });
 
+  analyzeProfileButton.addEventListener('click', analyzeCurrentProfile);
   prefillCurrentButton.addEventListener('click', prefillFromCurrentTab);
+  copyMessageButton.addEventListener('click', () => copyText(outreachMessageInput.value, 'Message copied.'));
+}
+
+async function analyzeCurrentProfile() {
+  setStatus('Reading the current LinkedIn profile...');
+  const activeTab = await getActiveTab();
+
+  if (!isLinkedInProfile(activeTab?.url)) {
+    setStatus('Open a linkedin.com/in/... profile before analyzing.');
+    return;
+  }
+
+  try {
+    const profile = await requestProfileExtraction(activeTab.id);
+    populateProfile(profile);
+    renderInsights(profile);
+    setStatus('Profile analyzed. Review the hooks, add any photo/banner observation, then save or copy the message.');
+  } catch (error) {
+    setStatus(`Could not analyze this page: ${error.message}`);
+  }
+}
+
+async function requestProfileExtraction(tabId) {
+  try {
+    return await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_LINKEDIN_PROFILE' });
+  } catch (_error) {
+    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
+    return chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_LINKEDIN_PROFILE' });
+  }
+}
+
+function populateProfile(profile) {
+  const hooks = buildHooks(profile);
+
+  nameInput.value = profile.name || nameInput.value;
+  headlineInput.value = profile.headline || headlineInput.value;
+  locationInput.value = profile.location || locationInput.value;
+  linkedinUrlInput.value = profile.url || linkedinUrlInput.value;
+  profileNotesInput.value = hooks.map((hook) => `• ${hook}`).join('\n');
+  outreachMessageInput.value = buildOutreachMessage(profile, hooks);
+}
+
+function buildHooks(profile) {
+  const hooks = [];
+
+  if (profile.headline) hooks.push(`Current title/headline: ${profile.headline}`);
+  if (profile.location) hooks.push(`Location to reference: ${profile.location}`);
+  if (profile.about) hooks.push(`About section angle: ${profile.about}`);
+
+  profile.certifications?.forEach((item) => hooks.push(`Certification/credential signal: ${item}`));
+  profile.cloudSignals?.forEach((item) => hooks.push(`Cloud or technical signal: ${item}`));
+  profile.experience?.slice(0, 4).forEach((item) => hooks.push(`Experience detail: ${item}`));
+  profile.skills?.slice(0, 5).forEach((item) => hooks.push(`Skill to mention: ${item}`));
+  profile.recentActivity?.slice(0, 4).forEach((item) => hooks.push(`Recent activity/profile clue: ${item}`));
+
+  if (profile.profileImage?.alt) hooks.push(`Profile photo alt text: ${profile.profileImage.alt}`);
+  if (profile.bannerImage?.alt) hooks.push(`Banner image alt text: ${profile.bannerImage.alt}`);
+
+  if (!hooks.length) {
+    hooks.push('Use the profile title, current company, skills, and any visible activity as personalization points.');
+  }
+
+  return unique(hooks).slice(0, 14);
+}
+
+function buildOutreachMessage(profile, hooks) {
+  const firstName = (profile.name || 'there').split(' ')[0];
+  const role = profile.headline || 'your current role';
+  const hook = hooks.find((item) => !item.startsWith('Profile photo') && !item.startsWith('Banner image')) || role;
+  const locationLine = profile.location ? ` I noticed you are based around ${profile.location}, which could fit the team setup well.` : '';
+
+  return `Hi ${firstName},\n\nI came across your LinkedIn profile and noticed ${lowercaseFirstLetter(hook)}.${locationLine}\n\nYour background looks relevant to a new position similar to ${role}. Would you be open to a brief conversation so I can share the role and see if it matches what you want next?\n\nBest,`;
+}
+
+function renderInsights(profile) {
+  const hooks = buildHooks(profile);
+  insightsContainer.innerHTML = '';
+
+  const visualReminder = document.createElement('div');
+  visualReminder.className = 'insight visual';
+  visualReminder.innerHTML = '<strong>Photo/banner prompt</strong><span>LinkedIn does not expose reliable image meaning. Look at the profile photo and banner yourself, then add a specific note such as a city skyline, conference stage, pet, sport, award, or funny detail.</span>';
+  insightsContainer.appendChild(visualReminder);
+
+  hooks.forEach((hook) => {
+    const item = document.createElement('button');
+    item.type = 'button';
+    item.className = 'insight';
+    item.textContent = hook;
+    item.addEventListener('click', () => appendNote(hook));
+    insightsContainer.appendChild(item);
+  });
+
+  insightsCard.classList.remove('hidden');
+}
+
+function appendNote(note) {
+  const prefix = profileNotesInput.value.trim() ? '\n' : '';
+  profileNotesInput.value = `${profileNotesInput.value}${prefix}• ${note}`;
+}
+
+function clearInsights() {
+  insightsContainer.innerHTML = '';
+  insightsCard.classList.add('hidden');
 }
 
 async function prefillFromCurrentTab() {
-  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
+  const activeTab = await getActiveTab();
 
   if (!activeTab?.url?.includes('linkedin.com')) {
+    setStatus('The current tab is not LinkedIn.');
     return;
   }
 
   linkedinUrlInput.value = activeTab.url;
   nameInput.value = (activeTab.title || '')
     .replace(/\|\s*LinkedIn.*/i, '')
     .replace(/\(\d+\)\s*/g, '')
     .trim();
+  setStatus('Current LinkedIn tab link copied into the form.');
+}
+
+async function getActiveTab() {
+  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
+  return activeTab;
+}
+
+function isLinkedInProfile(url = '') {
+  return /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\//i.test(url) || /^https:\/\/www\.linkedin\.com\/in\//i.test(url);
 }
 
 async function getContacts() {
   const result = await chrome.storage.local.get(STORAGE_KEY);
   return result[STORAGE_KEY] || [];
 }
 
 async function saveContacts(contacts) {
   await chrome.storage.local.set({ [STORAGE_KEY]: contacts });
 }
 
 async function updateStatus(id, status) {
   const contacts = await getContacts();
   const updated = contacts.map((contact) =>
     contact.id === id ? { ...contact, status } : contact
   );
   await saveContacts(updated);
   await render();
 }
 
 async function removeContact(id) {
   const contacts = await getContacts();
   const filtered = contacts.filter((contact) => contact.id !== id);
   await saveContacts(filtered);
   await render();
 }
 
 function buildMetrics(contacts) {
-  const contacted = contacts.filter((c) => c.status !== 'Novo').length;
+  const contacted = contacts.filter((c) => c.status !== 'New').length;
   const responded = contacts.filter((c) =>
-    ['Respondeu', 'Entrevista', 'Submissão', 'Rejeitado'].includes(c.status)
+    ['Responded', 'Interview', 'Submitted', 'Rejected'].includes(c.status)
   ).length;
-  const interviews = contacts.filter((c) => c.status === 'Entrevista').length;
-  const submissions = contacts.filter((c) => c.status === 'Submissão').length;
+  const interviews = contacts.filter((c) => c.status === 'Interview').length;
+  const submissions = contacts.filter((c) => c.status === 'Submitted').length;
 
   const base = contacted || 1;
   const responseRate = ((responded / base) * 100).toFixed(1);
   const interviewRate = ((interviews / base) * 100).toFixed(1);
   const submissionRate = ((submissions / base) * 100).toFixed(1);
 
   return [
     { label: 'Total', value: contacts.length },
-    { label: 'Contactados', value: contacted },
-    { label: 'Taxa de resposta', value: `${responseRate}%` },
-    { label: 'Taxa entrevistas', value: `${interviewRate}%` },
-    { label: 'Taxa submissões', value: `${submissionRate}%` }
+    { label: 'Contacted', value: contacted },
+    { label: 'Response rate', value: `${responseRate}%` },
+    { label: 'Interview rate', value: `${interviewRate}%` },
+    { label: 'Submission rate', value: `${submissionRate}%` }
   ];
 }
 
 async function render() {
   const contacts = await getContacts();
 
   metricsContainer.innerHTML = '';
   buildMetrics(contacts).forEach((metric) => {
     const card = document.createElement('div');
     card.className = 'metric';
-    card.innerHTML = `<strong>${metric.value}</strong><span>${metric.label}</span>`;
+    card.innerHTML = `<strong>${escapeHtml(String(metric.value))}</strong><span>${escapeHtml(metric.label)}</span>`;
     metricsContainer.appendChild(card);
   });
 
   contactsContainer.innerHTML = '';
 
   if (!contacts.length) {
-    contactsContainer.innerHTML = '<div class="empty-state">Ainda não tens contactos guardados.</div>';
+    contactsContainer.innerHTML = '<div class="empty-state">No saved candidates yet.</div>';
     return;
   }
 
   contacts.forEach((contact) => {
     const fragment = contactTemplate.content.cloneNode(true);
     const item = fragment.querySelector('.contact-item');
     const nameLink = fragment.querySelector('.contact-name');
     const createdAt = fragment.querySelector('.created-at');
+    const headline = fragment.querySelector('.contact-headline');
+    const notes = fragment.querySelector('.contact-notes');
     const statusSelect = fragment.querySelector('.status-select');
+    const copySavedButton = fragment.querySelector('.copy-saved-message');
     const markContactedButton = fragment.querySelector('.mark-contacted');
     const removeButton = fragment.querySelector('.remove');
 
     nameLink.textContent = contact.name;
     nameLink.href = contact.linkedinUrl;
-    createdAt.textContent = new Date(contact.createdAt).toLocaleDateString('pt-PT');
+    createdAt.textContent = new Date(contact.createdAt).toLocaleDateString('en-US');
+    headline.textContent = [contact.headline, contact.location].filter(Boolean).join(' • ');
+    notes.textContent = contact.visualNote || firstLine(contact.profileNotes) || 'No personalization notes saved.';
 
     STATUSES.forEach((status) => {
       const option = document.createElement('option');
       option.value = status;
       option.textContent = status;
       if (contact.status === status) option.selected = true;
       statusSelect.appendChild(option);
     });
 
     statusSelect.addEventListener('change', () => updateStatus(contact.id, statusSelect.value));
-    markContactedButton.addEventListener('click', () => updateStatus(contact.id, 'Contactado'));
+    copySavedButton.addEventListener('click', () => copyText(contact.outreachMessage || '', 'Saved message copied.'));
+    markContactedButton.addEventListener('click', () => updateStatus(contact.id, 'Contacted'));
     removeButton.addEventListener('click', () => removeContact(contact.id));
 
     item.dataset.id = contact.id;
     contactsContainer.appendChild(fragment);
   });
 }
+
+async function copyText(value, successMessage) {
+  if (!value.trim()) {
+    setStatus('There is no message to copy yet.');
+    return;
+  }
+
+  await navigator.clipboard.writeText(value);
+  setStatus(successMessage);
+}
+
+function setStatus(message) {
+  analysisStatus.textContent = message;
+}
+
+function lowercaseFirstLetter(value) {
+  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
+}
+
+function firstLine(value = '') {
+  return value.split('\n').map((line) => line.replace(/^•\s*/, '').trim()).find(Boolean) || '';
+}
+
+function unique(items) {
+  return [...new Set(items.filter(Boolean))];
+}
+
+function escapeHtml(value) {
+  return value
+    .replace(/&/g, '&amp;')
+    .replace(/</g, '&lt;')
+    .replace(/>/g, '&gt;')
+    .replace(/"/g, '&quot;')
+    .replace(/'/g, '&#039;');
+}
 
EOF
)
