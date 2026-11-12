document.addEventListener('DOMContentLoaded', async () => {
  const keyInput = document.getElementById('api-key-input');
  const saveBtn = document.getElementById('save-key-btn');
  const feedback = document.getElementById('key-feedback');
  const statusIndicator = document.getElementById('status-indicator');
  const keyLink = document.querySelector('.key-link');

  // Load existing key
  const data = await chrome.storage.local.get(['customApiKey']);
  if (data && data.customApiKey) {
    keyInput.value = data.customApiKey;
    setSavedState();
  } else {
    setDefaultState();
  }

  function setSavedState() {
    saveBtn.textContent = 'Remove';
    saveBtn.classList.add('danger');
    feedback.textContent = 'Your personal API key is active.';
    feedback.className = 'key-hint success';
    statusIndicator.textContent = '● Personal Key';
  }

  function setDefaultState() {
    keyInput.value = '';
    saveBtn.textContent = 'Save';
    saveBtn.classList.remove('danger');
    feedback.textContent = 'Shared free quota is active.';
    feedback.className = 'key-hint';
    statusIndicator.textContent = '● Active (Shared)';
  }

  saveBtn.addEventListener('click', async () => {
    if (saveBtn.textContent === 'Remove') {
      await chrome.storage.local.remove(['customApiKey']);
      setDefaultState();
      return;
    }

    const key = keyInput.value.trim();
    if (!key) {
      feedback.textContent = 'Please paste a valid API key.';
      feedback.className = 'key-hint';
      return;
    }

    await chrome.storage.local.set({ customApiKey: key });
    setSavedState();
  });

  if (keyLink) {
    keyLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: keyLink.href });
    });
  }
});

