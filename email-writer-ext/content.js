console.log("📬 Email Writer Extension - Content Script Loaded");

function createAIButton() {
  const container = document.createElement('div');
  container.className = 'ai-container';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.marginRight = '8px';

  const toneSelect = document.createElement('select');
  toneSelect.className = 'ai-tone-select';
  ['friendly', 'professional', 'casual'].forEach(tone => {
    const opt = document.createElement('option');
    opt.value = tone;
    opt.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);
    toneSelect.appendChild(opt);
  });
  container.appendChild(toneSelect);

  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
  button.style.borderRadius = '20px';
  button.style.marginLeft = '5px';
  button.style.padding = '0 8px';
  button.style.cursor = 'pointer';
  button.textContent = 'AI Reply';

  container.appendChild(button);

  button.addEventListener('click', async () => {
    button.textContent = 'Generating...';
    button.style.opacity = '0.7';
    button.disabled = true;

    try {
      const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
      if (!composeBox) throw new Error('Compose box not found');

      const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
      let emailContent = '';
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim().length > 10) {
          emailContent = el.innerText.trim();
          break;
        }
      }
      if (!emailContent) throw new Error('Email content is empty');

      console.log("🧠 Email content fetched:", emailContent);

      const response = await fetch('http://localhost:8080/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContent, tone: toneSelect.value }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
     
      const generatedReply = data.generatedReply || '';
      console.log("✅ Generated reply:", generatedReply);

      composeBox.focus();
      document.execCommand('insertText', false, generatedReply);

    } catch (err) {
      console.error('❌ Error generating reply:', err);
      alert(err.message || 'Failed to generate reply.');
    } finally {
      button.textContent = 'AI Reply';
      button.style.opacity = '1';
      button.disabled = false;
    }
  });

  return container;
}

function findComposeToolbar() {
  const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) return toolbar;
  }
  return null;
}

function injectButton() {
  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("❌ Toolbar not found");
    return;
  }

  if (toolbar.querySelector('.ai-container')) return; 

  console.log("✅ Toolbar found, creating AI Reply button");
  const aiButton = createAIButton();
  toolbar.insertBefore(aiButton, toolbar.firstChild);
  console.log("🚀 AI Reply button + dropdown injected!");
}


const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector?.('.aDh, .btC, [role="dialog"]'))
    );

    if (hasComposeElements) {
      console.log("✉️ Compose window detected");
      setTimeout(injectButton, 500); 
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

document.querySelectorAll('[role="toolbar"]').forEach(toolbar => {
  if (!toolbar.querySelector('.ai-container')) injectButton();
});

console.log("👀 Mutation observer running...");
