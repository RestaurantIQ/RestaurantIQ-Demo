(function () {
  const ORIGIN = 'https://restaurant-iq-demo.vercel.app';

  const style = document.createElement('style');
  style.textContent = `
    #riq-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #1C1712;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: background 0.2s, transform 0.2s;
    }
    #riq-btn:hover {
      background: #C9A84C;
      transform: scale(1.05);
    }
    #riq-frame {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 380px;
      height: 560px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      z-index: 9998;
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    #riq-frame.open {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    @media (max-width: 480px) {
      #riq-frame {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'riq-btn';
  btn.innerHTML = `
    <svg id="riq-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="#F7F3EE">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
    </svg>
    <svg id="riq-icon-close" width="20" height="20" viewBox="0 0 24 24" fill="#F7F3EE" style="display:none">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;
  document.body.appendChild(btn);

  const frame = document.createElement('iframe');
  frame.id = 'riq-frame';
  frame.src = ORIGIN + '/widget-frame';
  frame.allow = 'clipboard-write';
  document.body.appendChild(frame);

  let open = false;
  btn.addEventListener('click', () => {
    open = !open;
    frame.classList.toggle('open', open);
    document.getElementById('riq-icon-chat').style.display = open ? 'none' : 'block';
    document.getElementById('riq-icon-close').style.display = open ? 'block' : 'none';
  });
})();
