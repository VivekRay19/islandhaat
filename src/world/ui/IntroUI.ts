import { IntroMusic } from '../audio/IntroMusic';

export class IntroUI {
  public container: HTMLElement;
  private music = IntroMusic.get();

  // Modals
  private settingsModal!: HTMLElement;
  private howToPlayModal!: HTMLElement;
  private creditsModal!: HTMLElement;

  private onNewGameCallback?: () => void;
  private onContinueCallback?: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'intro-ui-root';
    this.container.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      color: #fff;
      overflow: hidden;
      z-index: 30;
      user-select: none;
    `;
    document.body.appendChild(this.container);

    this.buildDOM();
    this.playStartupAnimation();
  }

  public setCallbacks(opts: { onNewGame: () => void; onContinue: () => void }): void {
    this.onNewGameCallback = opts.onNewGame;
    this.onContinueCallback = opts.onContinue;
  }

  private buildDOM(): void {
    // Top / Center Header: 3D Logo & Wooden Tagline
    const headerGroup = document.createElement('div');
    headerGroup.id = 'intro-logo-group';
    headerGroup.style.cssText = `
      position: absolute;
      top: 24px; left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    // Handcrafted 3D Logo Artwork Container
    const logoWrap = document.createElement('div');
    logoWrap.style.cssText = `
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.45));
    `;

    // Decorative frame (Sun, Palm fronds, Matka clay pot, textile tapestry)
    logoWrap.innerHTML = `
      <!-- Smiling Sun -->
      <div style="position: absolute; top: -14px; font-size: 38px; filter: drop-shadow(0 2px 8px rgba(251, 191, 36, 0.6));">☀️</div>

      <!-- Left Palm leaves & Clay Pot -->
      <div style="position: absolute; left: -42px; top: 12px; font-size: 32px;">🌴</div>
      <div style="position: absolute; left: -36px; bottom: 8px; font-size: 26px;">🏺</div>

      <!-- Right Palm leaves & Woven Tapestry -->
      <div style="position: absolute; right: -42px; top: 12px; font-size: 32px;">🌴</div>
      <div style="position: absolute; right: -36px; bottom: 8px; font-size: 26px;">🧵</div>

      <!-- Main 3D Title -->
      <div style="
        font-family: 'Cinzel', 'Plus Jakarta Sans', serif;
        font-weight: 900;
        font-size: 48px;
        line-height: 0.95;
        letter-spacing: 2px;
        text-align: center;
        background: linear-gradient(180deg, #ffe082 0%, #ffb300 45%, #e65100 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 2px #4e2608;
        filter: drop-shadow(0 4px 0 #3e1b04) drop-shadow(0 6px 12px rgba(0,0,0,0.6));
      ">
        ISLAND<br/>HAAT
      </div>
    `;

    // Wooden Tagline Plaque
    const tagline = document.createElement('div');
    tagline.style.cssText = `
      margin-top: 8px;
      background: linear-gradient(180deg, #8d5b38, #5c381e);
      border: 2px solid #e0a36b;
      border-radius: 14px;
      padding: 6px 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #fff6e0;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
    `;
    tagline.innerHTML = `BUILD &bull; TRADE &bull; CULTURE &bull; GROW`;

    headerGroup.appendChild(logoWrap);
    headerGroup.appendChild(tagline);
    this.container.appendChild(headerGroup);

    // Center Menu Buttons Group
    const menuGroup = document.createElement('div');
    menuGroup.id = 'intro-menu-group';
    menuGroup.style.cssText = `
      position: absolute;
      top: 54%; left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      pointer-events: auto;
      z-index: 40;
    `;

    // 1. NEW GAME (Golden Yellow Carved Plaque)
    const newGameBtn = this.createPlaqueButton({
      text: 'NEW GAME',
      icon: '▶',
      isPrimary: true,
      onClick: () => {
        this.music.playButtonClick();
        this.music.playStartAdventureSwoosh();
        this.fadeOutUI(() => this.onNewGameCallback?.());
      }
    });
    newGameBtn.id = 'btn-new-game';
    menuGroup.appendChild(newGameBtn);

    // 2. CONTINUE (Rich Dark Wood Plaque)
    const hasSave = localStorage.getItem('cultural_islands_save_v1') !== null;
    const continueBtn = this.createPlaqueButton({
      text: 'CONTINUE',
      icon: '🏝️',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.music.playStartAdventureSwoosh();
        this.fadeOutUI(() => this.onContinueCallback?.());
      }
    });
    continueBtn.id = 'btn-continue';
    if (!hasSave) {
      continueBtn.style.opacity = '0.65';
      continueBtn.title = 'Start a New Game first to create save';
    }
    menuGroup.appendChild(continueBtn);

    // 3. SETTINGS
    const settingsBtn = this.createPlaqueButton({
      text: 'SETTINGS',
      icon: '⚙️',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.showSettingsModal();
      }
    });
    settingsBtn.id = 'btn-settings';
    menuGroup.appendChild(settingsBtn);

    // 4. HOW TO PLAY
    const howToPlayBtn = this.createPlaqueButton({
      text: 'HOW TO PLAY',
      icon: '📖',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.showHowToPlayModal();
      }
    });
    howToPlayBtn.id = 'btn-howtoplay';
    menuGroup.appendChild(howToPlayBtn);

    this.container.appendChild(menuGroup);

    // Bottom Left: Language Selector
    const langPill = document.createElement('div');
    langPill.style.cssText = `
      position: absolute;
      bottom: 20px; left: 24px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
      pointer-events: auto;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: all 0.2s;
    `;
    langPill.innerHTML = `🌐 English <span style="font-size:10px;color:#94a3b8;">▼</span>`;
    langPill.onmouseenter = () => this.music.playButtonHover();
    langPill.onclick = () => {
      this.music.playButtonClick();
      alert('Language: English (Default). Additional regional languages coming soon!');
    };
    this.container.appendChild(langPill);

    // Bottom Right: Social / Community / Help Icons
    const socialGroup = document.createElement('div');
    socialGroup.style.cssText = `
      position: absolute;
      bottom: 20px; right: 24px;
      display: flex;
      gap: 12px;
      pointer-events: auto;
    `;

    const makeIconButton = (iconText: string, tooltip: string, action: () => void) => {
      const b = document.createElement('div');
      b.style.cssText = `
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        transition: all 0.2s;
      `;
      b.title = tooltip;
      b.innerHTML = iconText;
      b.onmouseenter = () => {
        b.style.transform = 'translateY(-3px) scale(1.08)';
        b.style.background = 'rgba(56, 189, 248, 0.25)';
        this.music.playButtonHover();
      };
      b.onmouseleave = () => {
        b.style.transform = 'translateY(0) scale(1)';
        b.style.background = 'rgba(15, 23, 42, 0.75)';
      };
      b.onclick = () => {
        this.music.playButtonClick();
        action();
      };
      return b;
    };

    socialGroup.appendChild(makeIconButton('💬', 'Community Discord', () => window.open('https://discord.gg', '_blank')));
    socialGroup.appendChild(makeIconButton('🎮', 'Controls & Help', () => this.showHowToPlayModal()));
    socialGroup.appendChild(makeIconButton('✨', 'About / Credits', () => this.showCreditsModal()));
    this.container.appendChild(socialGroup);

    // Create Modals
    this.createModals();
  }

  private createPlaqueButton(opts: { text: string; icon: string; isPrimary: boolean; onClick: () => void }): HTMLElement {
    const btn = document.createElement('div');
    const isPri = opts.isPrimary;

    btn.style.cssText = `
      width: 240px;
      height: ${isPri ? '52px' : '44px'};
      background: ${isPri ? 'linear-gradient(180deg, #ffc83b 0%, #f59e0b 50%, #d97706 100%)' : 'linear-gradient(180deg, #8d5b38 0%, #6d4223 60%, #533118 100%)'};
      border: 2px solid ${isPri ? '#fff0a8' : '#b07d58'};
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: ${isPri ? '16px' : '14px'};
      font-weight: 800;
      letter-spacing: 1px;
      color: ${isPri ? '#3e1c00' : '#fff5eb'};
      text-shadow: ${isPri ? '0 1px 0 rgba(255,255,255,0.6)' : '0 1px 2px rgba(0,0,0,0.8)'};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    btn.innerHTML = `<span style="font-size:${isPri ? '16px' : '14px'};">${opts.icon}</span> <span>${opts.text}</span>`;

    btn.onmouseenter = () => {
      this.music.playButtonHover();
      btn.style.transform = 'translateY(-3px) scale(1.04)';
      btn.style.boxShadow = `0 12px 30px ${isPri ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0,0,0,0.5)'}, inset 0 2px 0 rgba(255,255,255,0.6)`;
    };

    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0) scale(1)';
      btn.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.3)';
    };

    btn.onmousedown = () => {
      btn.style.transform = 'translateY(2px) scale(0.98)';
    };

    btn.onclick = opts.onClick;
    return btn;
  }

  private createModals(): void {
    // 1. Settings Modal
    this.settingsModal = document.createElement('div');
    this.settingsModal.style.cssText = this.getModalStyle();
    this.container.appendChild(this.settingsModal);

    // 2. How To Play Modal
    this.howToPlayModal = document.createElement('div');
    this.howToPlayModal.style.cssText = this.getModalStyle();
    this.container.appendChild(this.howToPlayModal);

    // 3. Credits Modal
    this.creditsModal = document.createElement('div');
    this.creditsModal.style.cssText = this.getModalStyle();
    this.container.appendChild(this.creditsModal);
  }

  private getModalStyle(): string {
    return `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border: 2px solid #d97706;
      border-radius: 24px;
      padding: 28px 36px;
      width: 520px;
      max-width: 90vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.7);
      display: none;
      flex-direction: column;
      gap: 16px;
      pointer-events: auto;
      z-index: 60;
    `;
  }

  private showSettingsModal(): void {
    const s = this.music.settings;
    this.settingsModal.style.display = 'flex';
    this.settingsModal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;color:#f59e0b;display:flex;gap:8px;align-items:center;">⚙️ Game Settings</h2>
        <button id="close-settings" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;margin-top:8px;">
        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;">
            <span>Master Volume</span>
            <span id="val-master">${Math.round(s.master * 100)}%</span>
          </div>
          <input type="range" id="slider-master" min="0" max="100" value="${s.master * 100}" style="width:100%;margin-top:6px;accent-color:#f59e0b;"/>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;">
            <span>Music Volume</span>
            <span id="val-music">${Math.round(s.music * 100)}%</span>
          </div>
          <input type="range" id="slider-music" min="0" max="100" value="${s.music * 100}" style="width:100%;margin-top:6px;accent-color:#f59e0b;"/>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;">
            <span>SFX Volume</span>
            <span id="val-sfx">${Math.round(s.sfx * 100)}%</span>
          </div>
          <input type="range" id="slider-sfx" min="0" max="100" value="${s.sfx * 100}" style="width:100%;margin-top:6px;accent-color:#f59e0b;"/>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid rgba(255,255,255,0.1);">
          <span style="font-size:13px;font-weight:700;">Reduce Motion</span>
          <input type="checkbox" id="check-motion" ${s.reduceMotion ? 'checked' : ''} style="width:18px;height:18px;accent-color:#f59e0b;cursor:pointer;"/>
        </div>
      </div>

      <button id="save-settings" style="margin-top:10px;background:#f59e0b;color:#0f172a;font-weight:800;border:none;border-radius:14px;padding:10px;cursor:pointer;">Apply & Close</button>
    `;

    document.getElementById('close-settings')!.onclick = () => (this.settingsModal.style.display = 'none');
    document.getElementById('save-settings')!.onclick = () => {
      this.music.saveSettings();
      this.settingsModal.style.display = 'none';
    };

    const updateSlider = (id: string, valId: string, prop: keyof typeof s) => {
      const input = document.getElementById(id) as HTMLInputElement;
      input.oninput = () => {
        const val = Number(input.value) / 100;
        (s as any)[prop] = val;
        document.getElementById(valId)!.innerText = `${input.value}%`;
      };
    };

    updateSlider('slider-master', 'val-master', 'master');
    updateSlider('slider-music', 'val-music', 'music');
    updateSlider('slider-sfx', 'val-sfx', 'sfx');

    const checkMotion = document.getElementById('check-motion') as HTMLInputElement;
    checkMotion.onchange = () => (s.reduceMotion = checkMotion.checked);
  }

  private showHowToPlayModal(): void {
    this.howToPlayModal.style.display = 'flex';
    this.howToPlayModal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;color:#f59e0b;display:flex;gap:8px;align-items:center;">📖 How to Play</h2>
        <button id="close-htp" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">1️⃣ 🏝️</div>
          <div style="font-weight:800;font-size:14px;color:#38bdf8;">Place 3D Tiles</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Drag and snap modular hex blocks to expand your miniature cultural island in the ocean.</div>
        </div>

        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">2️⃣ 🌲🌾</div>
          <div style="font-weight:800;font-size:14px;color:#4ade80;">Match Edges</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Connect matching forests, rivers, and farms to earn bonus coins and activate cultural synergies.</div>
        </div>

        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">3️⃣ 🏪🪙</div>
          <div style="font-weight:800;font-size:14px;color:#facc15;">Trade at Haat</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Visit visiting mariners and artisans to exchange grain, textiles, and clay at the seaside Haat.</div>
        </div>

        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">4️⃣ 🚶✨</div>
          <div style="font-weight:800;font-size:14px;color:#c084fc;">Explore in 3D</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Enter your living island in third-person, walk with WASD, jump, harvest, and open treasure chests!</div>
        </div>
      </div>

      <button id="start-htp-btn" style="margin-top:10px;background:#f59e0b;color:#0f172a;font-weight:800;border:none;border-radius:14px;padding:12px;cursor:pointer;font-size:14px;">Got it! Start Building</button>
    `;

    document.getElementById('close-htp')!.onclick = () => (this.howToPlayModal.style.display = 'none');
    document.getElementById('start-htp-btn')!.onclick = () => {
      this.howToPlayModal.style.display = 'none';
      this.fadeOutUI(() => this.onNewGameCallback?.());
    };
  }

  private showCreditsModal(): void {
    this.creditsModal.style.display = 'flex';
    this.creditsModal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;color:#f59e0b;">✨ Island Haat Credits</h2>
        <button id="close-credits" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;">✕</button>
      </div>
      <p style="font-size:13px;color:#cbd5e1;line-height:1.6;">
        A cozy 3D miniature island building, cultural connection, and third-person exploration game inspired by traditional Haat bazaars and handloom heritage.
      </p>
      <div style="font-size:12px;color:#94a3b8;margin-top:6px;">
        Created with Three.js, TypeScript & Vite.
      </div>
    `;
    document.getElementById('close-credits')!.onclick = () => (this.creditsModal.style.display = 'none');
  }

  private playStartupAnimation(): void {
    const logo = document.getElementById('intro-logo-group');
    const menu = document.getElementById('intro-menu-group');
    if (!logo || !menu) return;

    logo.style.opacity = '0';
    logo.style.transform = 'translateX(-50%) translateY(-20px) scale(0.92)';

    menu.style.opacity = '0';
    menu.style.transform = 'translate(-50%, -40%) scale(0.95)';

    setTimeout(() => {
      logo.style.opacity = '1';
      logo.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    }, 400);

    setTimeout(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 900);
  }

  public fadeOutUI(onDone: () => void): void {
    this.container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    this.container.style.opacity = '0';
    this.container.style.transform = 'scale(1.05)';
    setTimeout(() => {
      this.destroy();
      onDone();
    }, 800);
  }

  public destroy(): void {
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
