/**
 * Abdulwahab Taofeek — Lightweight chat widget (bottom-left)
 * Self-contained: injects its own styles + markup, no dependencies or backend.
 * Scripted assistant with quick replies that hands off to WhatsApp / email.
 */
(function () {
  "use strict";

  var WHATSAPP = "https://wa.me/2349060268865?text=" + encodeURIComponent("Hi Abdulwahab, I'm reaching out from your portfolio.");
  var EMAIL = "abdulwahabtaofeek22@gmail.com";

  var css = ''
    + '#dt-chat{position:fixed;left:24px;bottom:24px;z-index:1200;font-family:var(--default-font,system-ui,sans-serif)}'
    + '#dt-chat *{box-sizing:border-box}'
    + '#dt-chat-btn{width:60px;height:60px;border:0;border-radius:50%;background:#1A1A1A;color:#fff;font-size:26px;cursor:pointer;'
    + 'display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.28);transition:transform .25s ease,background .25s ease}'
    + '#dt-chat-btn:hover{transform:scale(1.06)}'
    + '#dt-chat-btn .dt-badge{position:absolute;top:-3px;right:-3px;width:16px;height:16px;background:#25D366;border:2px solid #fff;border-radius:50%}'
    + '#dt-chat-panel{position:absolute;left:0;bottom:74px;width:340px;max-width:calc(100vw - 40px);background:#fff;border-radius:18px;overflow:hidden;'
    + 'box-shadow:0 20px 50px rgba(0,0,0,.28);opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;transition:all .28s cubic-bezier(.22,1,.36,1)}'
    + '#dt-chat.open #dt-chat-panel{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}'
    + '#dt-chat.open #dt-chat-btn .dt-open{display:none}'
    + '#dt-chat .dt-close-ic{display:none}'
    + '#dt-chat.open #dt-chat-btn .dt-close-ic{display:block}'
    + '.dt-head{background:#1A1A1A;color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}'
    + '.dt-head .dt-avatar{width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;color:#1A1A1A;font-weight:700;font-size:16px;flex:0 0 auto}'
    + '.dt-head h4{margin:0;font-size:15px;font-weight:700}'
    + '.dt-head p{margin:2px 0 0;font-size:12px;opacity:.7;display:flex;align-items:center;gap:6px}'
    + '.dt-head .dt-dot{width:8px;height:8px;border-radius:50%;background:#25D366;display:inline-block}'
    + '.dt-head .dt-x{margin-left:auto;background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer;opacity:.8}'
    + '.dt-head .dt-x:hover{opacity:1}'
    + '.dt-body{padding:16px;height:300px;overflow-y:auto;background:#FBFBFA}'
    + '.dt-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;margin-bottom:10px;word-wrap:break-word}'
    + '.dt-msg.bot{background:#fff;color:#1A1A1A;border:1px solid rgba(26,26,26,.08);border-bottom-left-radius:4px}'
    + '.dt-msg.user{background:#1A1A1A;color:#fff;margin-left:auto;border-bottom-right-radius:4px}'
    + '.dt-msg a{color:inherit;text-decoration:underline}'
    + '.dt-quick{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 8px}'
    + '.dt-quick button{background:#fff;border:1px solid rgba(26,26,26,.25);color:#1A1A1A;border-radius:40px;padding:7px 13px;font-size:13px;cursor:pointer;transition:all .2s}'
    + '.dt-quick button:hover{background:#1A1A1A;color:#fff;border-color:#1A1A1A}'
    + '.dt-foot{padding:12px 16px;border-top:1px solid rgba(26,26,26,.08);background:#fff}'
    + '.dt-wa{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#25D366;color:#fff;border-radius:10px;padding:11px;font-size:14px;font-weight:600;text-decoration:none}'
    + '.dt-wa:hover{background:#20b858;color:#fff}'
    + '@media (max-width:480px){#dt-chat{left:16px;bottom:16px}#dt-chat-panel{bottom:70px}}';

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var wrap = document.createElement("div");
  wrap.id = "dt-chat";
  wrap.innerHTML = ''
    + '<div id="dt-chat-panel" role="dialog" aria-label="Chat with Abdulwahab Taofeek">'
    +   '<div class="dt-head">'
    +     '<span class="dt-avatar">AT</span>'
    +     '<div><h4>Abdulwahab Taofeek</h4><p><span class="dt-dot"></span> Typically replies instantly</p></div>'
    +     '<button class="dt-x" aria-label="Close chat"><i class="bi bi-x-lg"></i></button>'
    +   '</div>'
    +   '<div class="dt-body" id="dt-body"></div>'
    +   '<div class="dt-foot"><a class="dt-wa" href="' + WHATSAPP + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Chat on WhatsApp</a></div>'
    + '</div>'
    + '<button id="dt-chat-btn" aria-label="Open chat"><span class="dt-badge"></span>'
    +   '<i class="bi bi-chat-dots-fill dt-open"></i><i class="bi bi-x-lg dt-close-ic"></i></button>';
  document.body.appendChild(wrap);

  var body = wrap.querySelector("#dt-body");
  var btn = wrap.querySelector("#dt-chat-btn");
  var started = false;

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMsg(text, who) {
    var m = document.createElement("div");
    m.className = "dt-msg " + (who || "bot");
    m.innerHTML = text;
    body.appendChild(m);
    scrollDown();
  }

  function addQuick(options) {
    var box = document.createElement("div");
    box.className = "dt-quick";
    options.forEach(function (opt) {
      var b = document.createElement("button");
      b.textContent = opt.label;
      b.addEventListener("click", function () {
        addMsg(opt.label, "user");
        box.remove();
        setTimeout(function () { opt.reply(); }, 350);
      });
      box.appendChild(b);
    });
    body.appendChild(box);
    scrollDown();
  }

  var MENU = [
    { label: "💻 See my work", reply: function () {
        addMsg("I've built <strong>8+ business websites</strong> and several <strong>web apps</strong> (dashboards, ML tools & more). <a href='index.html#portfolio'>Browse my projects →</a>", "bot");
        setTimeout(mainMenu, 400);
      } },
    { label: "🧩 My skills", reply: function () {
        addMsg("Full-stack: <strong>HTML, CSS, JavaScript, React, Node.js, Python</strong>, plus responsive design, APIs and databases. <a href='index.html#about'>More about me →</a>", "bot");
        setTimeout(mainMenu, 400);
      } },
    { label: "🚀 Hire me", reply: function () {
        addMsg("Great! The fastest way to start is a quick chat on WhatsApp — tap the green button below and let's talk about your project. 👇", "bot");
      } },
    { label: "📞 Contact", reply: function () {
        addMsg("You can reach me at <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a> or on WhatsApp at <strong>+234 9060 2688 65</strong>.", "bot");
        setTimeout(mainMenu, 400);
      } }
  ];

  function mainMenu() { addQuick(MENU); }

  function start() {
    if (started) return;
    started = true;
    addMsg("👋 Hi there! I'm Abdulwahab's assistant. How can I help you today?", "bot");
    setTimeout(mainMenu, 400);
  }

  function toggle() {
    var open = wrap.classList.toggle("open");
    btn.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    if (open) start();
  }

  btn.addEventListener("click", toggle);
  wrap.querySelector(".dt-x").addEventListener("click", toggle);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && wrap.classList.contains("open")) toggle();
  });
})();
