console.log("📬 Email Writer Extension - Content Script Loaded");

// ✅ Create AI Reply Button
function createAIButton() {
  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3'; // Gmail button style
  button.style.marginRight = '8px';
  button.textContent = 'AI Reply';
  button.setAttribute('role', 'button');
  button.setAttribute('data-tooltip', 'Generate AI Reply');
  return button;
}

// ✅ Get email content from the thread
function getEmailContent() {
  const selectors = [
    '.h7', 
    '.a3s.aiL',
    '.gmail_quote',
    '[role="presentation"]'
  ];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
  }
  return ''; 
}

// ✅ Find compose toolbar
function findComposeToolbar() {
  const selectors = [
    '.btC',
    '.aDh',
    '[role="toolbar"]',
    '.gU.Up'
  ];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

// ✅ Inject the AI Reply button
function injectButton() {
  if (document.querySelector('.ai-reply-button')) return;

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("❌ Toolbar not found");
    return;
  }

  console.log("✅ Toolbar found, creating AI Reply button");
  const button = createAIButton();
  button.classList.add('ai-reply-button');

  button.addEventListener('click', async () => {
    try {
      button.textContent = 'Generating...';
      button.style.opacity = '0.7';
      button.disabled = true;

      const emailContent = getEmailContent();
      console.log("🧠 Email content fetched:", emailContent);

      const response = await fetch('http://localhost:8080/api/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional",
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const generatedReply = await response.text();
      console.log("✅ Generated reply:", generatedReply);

      const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
      if (composeBox) {
        composeBox.focus();
        document.execCommand('insertText', false, generatedReply);
      } else {
        console.error('❌ Compose box not found');
      }
    } catch (error) {
      console.error('❌ Error generating reply:', error);
      alert('Failed to generate reply.');
    } finally {
      button.textContent = 'AI Reply';
      button.style.opacity = '1';
      button.disabled = false;
    }
  });

  // Add button at start of toolbar
  toolbar.insertBefore(button, toolbar.firstChild);
  console.log("🚀 AI Reply button injected!");
}

// ✅ Observe Gmail DOM
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
      setTimeout(injectButton, 1000);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

console.log("👀 Mutation observer running...");
