(function () {
  if (window.__riqWidget) return;
  window.__riqWidget = true;

  var scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  var restaurantName = (scriptTag && scriptTag.getAttribute('data-restaurant-name')) || 'RestaurantIQ';
  var BASE_URL = 'https://restaurant-iq-demo.vercel.app';

  var style = document.createElement('style');
  style.textContent = [
    '#riq-btn{position:fixed;bottom:24px;right:24px;z-index:2147483646;display:flex;align-items:center;gap:10px;',
    'background:#a8864a;border:none;border-radius:999px;padding:0 20px 0 16px;height:52px;cursor:pointer;',
    'box-shadow:0 4px 20px rgba(168,134,74,0.45),0 2px 10px rgba(0,0,0,0.15);',
    'font-family:sans-serif;font-size:14px;font-weight:500;color:#fff;letter-spacing:0.02em;',
    'transition:transform 0.2s,box-shadow 0.2s;}',
    '#riq-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(168,134,74,0.5),0 4px 14px rgba(0,0,0,0.18);}',
    '#riq-btn svg{width:20px;height:20px;fill:#fff;flex-shrink:0;}',
    '#riq-btn .riq-pulse{width:8px;height:8px;border-radius:50%;background:#6db57e;flex-shrink:0;',
    'animation:riqPulse 2.5s ease-in-out infinite;}',
    '@keyframes riqPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}',

    '#riq-overlay{position:fixed;inset:0;background:rgba(20,16,10,0.35);z-index:2147483647;',
    'display:none;align-items:flex-end;justify-content:flex-end;padding:20px;backdrop-filter:blur(2px);}',
    '#riq-overlay.riq-open{display:flex;animation:riqFadeIn 0.18s ease;}',
    '@keyframes riqFadeIn{from{opacity:0}to{opacity:1}}',

    '#riq-panel{width:420px;height:660px;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);',
    'border-radius:16px;overflow:hidden;display:flex;flex-direction:column;',
    'box-shadow:0 16px 64px rgba(0,0,0,0.28),0 4px 16px rgba(0,0,0,0.12);',
    'animation:riqSlideUp 0.32s cubic-bezier(0.16,1,0.3,1);}',
    '@keyframes riqSlideUp{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}',

    '#riq-panel-header{background:#1a1510;padding:10px 14px;display:flex;align-items:center;',
    'justify-content:space-between;flex-shrink:0;}',
    '#riq-panel-header span{font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.45);',
    'letter-spacing:0.1em;text-transform:uppercase;}',
    '#riq-close-btn{background:rgba(255,255,255,0.1);border:none;border-radius:6px;',
    'width:28px;height:28px;cursor:pointer;color:rgba(255,255,255,0.7);font-size:15px;',
    'display:flex;align-items:center;justify-content:center;transition:background 0.15s;}',
    '#riq-close-btn:hover{background:rgba(255,255,255,0.2);}',

    '#riq-iframe{flex:1;border:none;width:100%;}',

    '@media(max-width:500px){',
    '#riq-btn{right:16px;bottom:16px;padding:0 16px 0 12px;height:48px;font-size:13px;}',
    '#riq-overlay{padding:0;align-items:flex-end;justify-content:center;}',
    '#riq-panel{width:100vw;max-width:100vw;height:92vh;max-height:92vh;',
    'border-radius:16px 16px 0 0;}}',
  ].join('');
  document.head.appendChild(style);

  // Floating button
  var btn = document.createElement('button');
  btn.id = 'riq-btn';
  btn.setAttribute('aria-label', 'Tisch reservieren');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><span>Tisch reservieren</span><span class="riq-pulse"></span>';

  // Overlay
  var overlay = document.createElement('div');
  overlay.id = 'riq-overlay';

  var panel = document.createElement('div');
  panel.id = 'riq-panel';

  var header = document.createElement('div');
  header.id = 'riq-panel-header';
  header.innerHTML = '<span>' + restaurantName + '</span>';

  var closeBtn = document.createElement('button');
  closeBtn.id = 'riq-close-btn';
  closeBtn.setAttribute('aria-label', 'Schließen');
  closeBtn.innerHTML = '✕';

  var iframe = document.createElement('iframe');
  iframe.id = 'riq-iframe';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('loading', 'lazy');

  header.appendChild(closeBtn);
  panel.appendChild(header);
  panel.appendChild(iframe);
  overlay.appendChild(panel);
  document.body.appendChild(btn);
  document.body.appendChild(overlay);

  var loaded = false;

  function open() {
    if (!loaded) { iframe.src = BASE_URL; loaded = true; }
    overlay.classList.add('riq-open');
    btn.style.display = 'none';
  }

  function close() {
    overlay.classList.remove('riq-open');
    btn.style.display = 'flex';
  }

  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
