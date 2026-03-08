(() => {
  const POSITIVE_TEXT =
    "Товар имеет преимущество. В товаре отсутствует предустановленный мессенджер MAX и не поддерживается единый магазин приложений RuStore. Приобретая данный товар, потребитель подтверждает, что уведомлён об этом преимуществе и доволен им.";

  const alreadyProcessed = new WeakSet();

  function looksLikeMaxDisclaimer(text) {
    if (!text) return false;
    const t = text.toLowerCase();

    const hasMax = t.includes("max");
    const hasMissing = t.includes("отсутств") || t.includes("не предустанов");
    const hasDefect = t.includes("недостат") || t.includes("товар имеет недостаток");

    return hasMax && hasMissing && hasDefect;
  }

  function replaceInWidgetBody(bodyEl) {
    if (!bodyEl || alreadyProcessed.has(bodyEl)) return false;

    const text = (bodyEl.textContent || "").trim();
    if (!looksLikeMaxDisclaimer(text)) return false;

    bodyEl.textContent = POSITIVE_TEXT;

    const widgetEl = bodyEl.closest?.(".info-widget");
    if (widgetEl) {
      widgetEl.style.background = "#e8f5e9";
      widgetEl.style.borderColor = "#2e7d32";
      widgetEl.style.color = "#1b5e20";
    }

    alreadyProcessed.add(bodyEl);
    return true;
  }

  function scan(root = document) {
    const bodies = root.querySelectorAll?.(
      '.info-widget.product-card-description-info .info-widget__body[data-info-body]'
    );
    if (!bodies || bodies.length === 0) return;

    for (const bodyEl of bodies) {
      replaceInWidgetBody(bodyEl);
    }
  }

  scan(document);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          scan(node);
        }
      }

      if (m.type === "characterData" && m.target && m.target.parentElement) {
        scan(m.target.parentElement);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true
  });
})();
