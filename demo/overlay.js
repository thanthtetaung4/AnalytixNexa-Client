/**
 * The demo overlay: captions and a visible cursor.
 *
 * Injected with `addInitScript`, so it survives every navigation in the take —
 * including the hop to the mail inbox — without the script having to re-inject
 * it after each `goto`.
 *
 * Playwright's video does not draw the real pointer, so a recording of clicks
 * is a sequence of things happening for no visible reason. This paints a cursor
 * that the script drives to each target before clicking, plus a caption bar,
 * because a demo with no soundtrack has to narrate itself in text.
 */
(() => {
  const ID = "analytixnexa-demo-overlay";
  if (window.__demoOverlayInstalled) return;
  window.__demoOverlayInstalled = true;

  const CSS = `
    #${ID} { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;
             font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #${ID} .cap { position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%);
             max-width: 78%; padding: 13px 22px; border-radius: 12px;
             background: rgba(8, 10, 18, 0.92); color: #F2F4FA;
             border: 1px solid rgba(255,255,255,0.14);
             box-shadow: 0 18px 48px -12px rgba(0,0,0,0.7);
             font-size: 19px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em;
             text-align: center; opacity: 0; transition: opacity 240ms ease; }
    #${ID} .cap.on { opacity: 1; }
    /* .top moves the caption clear of content that sits low on the page —
       the audit trail, and the body of an email. */
    #${ID} .cap.top { bottom: auto; top: 26px; }
    #${ID} .cap small { display: block; margin-top: 5px; font-size: 14.5px;
             font-weight: 500; color: rgba(226,232,246,0.72); letter-spacing: 0; }
    #${ID} .cur { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px;
             border-radius: 50%; background: rgba(124,92,255,0.42);
             border: 2px solid #C9B6FF; box-shadow: 0 0 16px 3px rgba(124,92,255,0.55);
             opacity: 0; transition: opacity 200ms ease, left 620ms cubic-bezier(.22,1,.36,1),
                                     top 620ms cubic-bezier(.22,1,.36,1); }
    #${ID} .cur.on { opacity: 1; }
    #${ID} .ping { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px;
             border-radius: 50%; border: 2.5px solid #C9B6FF; opacity: 0; }
    #${ID} .ping.go { animation: demo-ping 560ms cubic-bezier(.22,1,.36,1) forwards; }
    @keyframes demo-ping { from { transform: scale(0.6); opacity: 0.95; }
                             to { transform: scale(3.4); opacity: 0; } }
    #${ID} .card { position: absolute; inset: 0; display: grid; place-items: center;
             background: #05060B; opacity: 0; transition: opacity 420ms ease; }
    #${ID} .card.on { opacity: 1; }
    #${ID} .card h1 { margin: 0; font-size: 46px; font-weight: 700; letter-spacing: -0.03em;
             background: linear-gradient(120deg, #FFFFFF 0%, #C9D3FF 45%, #9B7CFF 100%);
             -webkit-background-clip: text; background-clip: text; color: transparent; }
    #${ID} .card p { margin: 14px 0 0; font-size: 19px; color: #98A1B8; font-weight: 500; }
    #${ID} .card .lines { text-align: center; }
  `;

  /**
   * Attach (or re-attach) the overlay to <body>.
   *
   * `addInitScript` runs before the document has a body, so this must not
   * create anything yet — an earlier version appended to <html>, where the
   * parser left it outside <body> and nothing ever rendered. It also
   * re-parents an existing overlay if a framework has replaced the body.
   */
  const mount = () => {
    const body = document.body;
    if (!body) return null;

    let root = document.getElementById(ID);
    if (root) {
      if (root.parentNode !== body) body.appendChild(root);
      return root;
    }

    root = document.createElement("div");
    root.id = ID;
    const style = document.createElement("style");
    style.textContent = CSS;
    root.appendChild(style);
    root.insertAdjacentHTML(
      "beforeend",
      `<div class="card"><div class="lines"><h1></h1><p></p></div></div>
       <div class="cap"></div><div class="cur"></div><div class="ping"></div>`
    );
    body.appendChild(root);
    return root;
  };

  const el = (sel) => document.querySelector(`#${ID} ${sel}`);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  window.__demo = {
    caption(text, sub, where) {
      if (!mount()) return;
      const cap = el(".cap");
      if (!text) {
        cap.classList.remove("on");
        return;
      }
      cap.innerHTML = sub ? `${text}<small>${sub}</small>` : text;
      cap.classList.toggle("top", where === "top");
      cap.classList.add("on");
    },
    cursor(x, y) {
      if (!mount()) return;
      const cur = el(".cur");
      cur.classList.add("on");
      cur.style.left = `${x}px`;
      cur.style.top = `${y}px`;
    },
    ping(x, y) {
      if (!mount()) return;
      const ping = el(".ping");
      ping.style.left = `${x}px`;
      ping.style.top = `${y}px`;
      ping.classList.remove("go");
      void ping.offsetWidth; // restart the animation
      ping.classList.add("go");
    },
    hideCursor() {
      if (!mount()) return;
      el(".cur").classList.remove("on");
    },
    card(title, subtitle) {
      if (!mount()) return;
      const card = el(".card");
      if (!title) {
        card.classList.remove("on");
        return;
      }
      el(".card h1").textContent = title;
      el(".card p").textContent = subtitle ?? "";
      card.classList.add("on");
    },
  };
})();
