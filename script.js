const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('show');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('show');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Report form: sends the report to a Discord channel through a webhook, then shows a
// full-page confirmation. A "Contact Live Support" button is always offered alongside it.
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1569633743323406406/5vd5Sn-RsatwlFTemmnJlet7DiKMg5CDolLjJKZSzmL13ZK8v3BG3ilscsivVlqfyYQX';
const reportForm = document.getElementById('reportForm');
const errorPage = document.getElementById('errorPage');
const errorIcon = document.getElementById('errorIcon');
const errorTitle = document.getElementById('errorTitle');
const errorText = document.getElementById('errorText');

function showOverlay({ success }) {
  errorIcon.textContent = success ? '✕' : '!';
  errorIcon.classList.toggle('success', success);
  errorTitle.textContent = success ? 'ERROR!' : 'Error';
  errorTitle.classList.toggle('success', success);
  errorText.textContent = success
    ? 'ERROR! Report not sent! Contact live chat support instead.'
    : 'ERROR! Report not sent! Contact live chat support instead.';
  errorPage.classList.toggle('success-page', success);
  errorPage.hidden = false;
  document.getElementById('contactLiveSupport').focus();
}
function closeOverlay() { errorPage.hidden = true; }
document.getElementById('closeError').addEventListener('click', closeOverlay);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

reportForm.addEventListener('input', () => reportForm.classList.remove('submitted'));
reportForm.addEventListener('submit', async event => {
  event.preventDefault();
  const type = document.getElementById('reportType').value;
  const link = document.getElementById('reportLink').value.trim();
  const details = document.getElementById('reportDetails').value.trim();
  const email = document.getElementById('reportEmail').value.trim();
  if (!type || !details) return;

  const payload = {
    username: 'Community Reports',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: '🚩 New report: ' + type,
      color: 0x00b8ff,
      description: details.slice(0, 4000),
      fields: [
        { name: 'Topic', value: type.slice(0, 1024) },
        { name: 'Link or username', value: (link || 'Not provided').slice(0, 1024) },
        { name: 'Reporter email', value: (email || 'Not provided').slice(0, 1024) }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Community and Safety Policy' }
    }]
  };

  reportForm.classList.add('submitted');
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Request failed with status ' + response.status);
    reportForm.reset();
    showOverlay({ success: true });
  } catch (error) {
    console.error(error);
    showOverlay({ success: false });
  }
});

// Live chat opens as a real, separate popup window to Tawk's own chat page, sized larger
// than the usual corner widget. Nothing from Tawk is embedded on this page at all, so
// there's no bubble, attention-grabber, or greeting popup to appear before it's requested.
const TAWK_CHAT_URL = 'https://tawk.to/chat/6af93a3ae22b2e3c4c5d1d6e/1k7eomtih';

function openLiveChat() {
  const width = Math.min(520, window.screen.availWidth - 40);
  const height = Math.min(760, window.screen.availHeight - 80);
  const left = Math.round((window.screen.availWidth - width) / 2);
  const top = Math.round((window.screen.availHeight - height) / 2);

  const popup = window.open(
    TAWK_CHAT_URL,
    'LiveSupportChat',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,noopener,noreferrer`
  );
  if (popup) popup.focus();
}

// "Contact Live Support" closes the overlay and opens (or loads, the first time) live chat.
document.getElementById('contactLiveSupport').addEventListener('click', () => {
  closeOverlay();
  openLiveChat();
});
// The floating cover button also opens live chat when clicked.
document.getElementById('chatCover').addEventListener('click', openLiveChat);
