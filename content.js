/**
 * AI_MCQ_N - Content Script
 * Instantly displays the correct MCQ answer letter right at your cursor on pressing 'N'.
 * Remains visible for 3 seconds. Square, white background, black text, no border, no circle.
 */

(() => {
  if (window.__AI_MCQ_N_LOADED__) return;
  window.__AI_MCQ_N_LOADED__ = true;

  let badgeEl = null;
  let dismissTimer = null;
  let isSolving = false;
  let lastCursor = { x: 0, y: 0 };

  // Always track viewport cursor coordinates
  window.addEventListener('mousemove', (e) => {
    lastCursor.x = e.clientX;
    lastCursor.y = e.clientY;
  }, { passive: true, capture: true });

  window.addEventListener('mouseup', (e) => {
    lastCursor.x = e.clientX;
    lastCursor.y = e.clientY;
  }, { passive: true, capture: true });

  // Unblock text selection on exam/quiz portals
  document.addEventListener('selectstart', (e) => {
    if (!isTyping(e.target)) {
      e.stopPropagation();
    }
  }, true);

  function isTyping(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') return true;
    if (target.getAttribute('role') === 'textbox' || target.closest('[contenteditable="true"]')) return true;
    if (target.closest && target.closest('.monaco-editor, .CodeMirror, .ace_editor')) return true;
    return false;
  }

  function dismiss() {
    clearTimeout(dismissTimer);
    if (badgeEl) {
      badgeEl.remove();
      badgeEl = null;
    }
    isSolving = false;
  }

  function getSelectionInfo() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text.length >= 3) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        return {
          text,
          rect: {
            top: rect.top,
            bottom: rect.bottom,
            right: rect.right,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        };
      }
    }

    // Fallback: If text selection was blocked by portal CSS, check hovered question card
    if (lastCursor.x > 0 && lastCursor.y > 0) {
      const el = document.elementFromPoint(lastCursor.x, lastCursor.y);
      if (el && !isTyping(el)) {
        const card = el.closest('[class*="question"], [class*="mcq"], [id*="question"], fieldset, .card') || el;
        const cardText = card.innerText ? card.innerText.trim() : '';
        if (cardText.length > 15 && /[A-D][\).\s]/i.test(cardText)) {
          const rect = card.getBoundingClientRect();
          return {
            text: cardText,
            rect: {
              top: rect.top,
              bottom: rect.bottom,
              right: rect.right,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        }
      }
    }

    return null;
  }

  function getBadgePosition(mcq) {
    let x = lastCursor.x;
    let y = lastCursor.y;

    if (x === 0 && y === 0 && mcq && mcq.rect) {
      x = Math.min(mcq.rect.right, window.innerWidth - 30);
      y = mcq.rect.bottom;
    }

    // Offset slightly from cursor
    x = x + 10;
    y = y + 10;

    // Viewport bounding
    const maxX = window.innerWidth - 30;
    const maxY = window.innerHeight - 30;
    if (x > maxX) x = maxX;
    if (x < 5) x = 5;
    if (y > maxY) y = maxY;
    if (y < 5) y = 5;

    return { x, y };
  }

  function createOrGetBadge(pos) {
    if (!badgeEl || !badgeEl.parentNode) {
      badgeEl = document.createElement('div');
      badgeEl.id = 'ai-mcq-badge-node';
      (document.body || document.documentElement).appendChild(badgeEl);
    }

    // Direct inline styles: 20x20px square, white background, black text, no border, no circle
    badgeEl.style.cssText = `
      position: fixed !important;
      left: ${pos.x}px !important;
      top: ${pos.y}px !important;
      width: 20px !important;
      height: 20px !important;
      min-width: 20px !important;
      min-height: 20px !important;
      max-width: 20px !important;
      max-height: 20px !important;
      background: #ffffff !important;
      color: #000000 !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.35) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      text-align: center !important;
      z-index: 2147483647 !important;
      user-select: none !important;
      pointer-events: none !important;
      cursor: default !important;
      box-sizing: border-box !important;
      padding: 0 !important;
      margin: 0 !important;
      opacity: 1 !important;
    `;

    return badgeEl;
  }

  function showNotification(pos, text, durationMs = 3500) {
    clearTimeout(dismissTimer);
    const badge = createOrGetBadge(pos);
    badge.style.width = 'auto';
    badge.style.minWidth = '20px';
    badge.style.maxWidth = '320px';
    badge.style.height = 'auto';
    badge.style.minHeight = '20px';
    badge.style.padding = '4px 8px';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '500';
    badge.style.lineHeight = '1.3';
    badge.style.background = '#1e293b';
    badge.style.color = '#ffffff';
    badge.style.borderRadius = '4px';
    badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
    badge.style.wordBreak = 'break-word';
    badge.textContent = text;

    dismissTimer = setTimeout(() => {
      dismiss();
    }, durationMs);
  }

  async function solve(mcq) {
    if (isSolving) return;
    isSolving = true;
    clearTimeout(dismissTimer);

    const pos = getBadgePosition(mcq);
    const badge = createOrGetBadge(pos);

    // Black mini spinner inside the 20x20 white square
    badge.innerHTML = `
      <div style="width:10px;height:10px;border:2px solid rgba(0,0,0,0.2);border-top-color:#000000;border-radius:50%;animation:mcq-spin 0.5s linear infinite;box-sizing:border-box;"></div>
      <style>@keyframes mcq-spin { to { transform: rotate(360deg); } }</style>
    `;

    try {
      if (!chrome.runtime || !chrome.runtime.id) {
        showNotification(pos, 'Refresh page (F5)');
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: 'SOLVE_MCQ',
        text: mcq.text
      });

      if (response && response.success && response.letter) {
        // Display exact single letter (A, B, C, D) - keeps clean square shape
        badge.innerHTML = '';
        badge.textContent = response.letter;

        // Keep visible for exactly 3 seconds, then dismiss
        clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => {
          dismiss();
        }, 3000);
      } else {
        const errorMsg = response?.error || 'No answer found';
        console.error('AI_MCQ Error:', errorMsg);
        showNotification(pos, errorMsg, 4000);
      }
    } catch (err) {
      const errorMsg = err.message || 'Error occurred';
      console.error('AI_MCQ Error:', errorMsg);
      showNotification(pos, errorMsg, 4000);
    } finally {
      isSolving = false;
    }
  }

  // Keyboard trigger: 'N'
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dismiss();
      return;
    }

    if (e.key === 'n' || e.key === 'N') {
      if (isTyping(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const mcq = getSelectionInfo();
      if (mcq) {
        e.preventDefault();
        solve(mcq);
      } else {
        const pos = getBadgePosition(null);
        showNotification(pos, 'Highlight MCQ first', 1500);
      }
    }
  }, true);

})();
