import { AmbientOverlay } from './AmbientOverlay';
import { IntroMusic } from '../audio/IntroMusic';
import { IslandHaatTitle } from './IslandHaatTitle';

export class IntroScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private ambientOverlay: AmbientOverlay;
  private titleComponent: IslandHaatTitle;
  private music = IntroMusic.get();

  // Modals
  private settingsModal!: HTMLElement;
  private howToPlayModal!: HTMLElement;
  private creditsModal!: HTMLElement;

  private onNewGameCallback?: () => void;
  private onContinueCallback?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // Root wrapper
    this.root = document.createElement('div');
    this.root.id = 'intro-screen-root';
    this.root.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100vw; height: 100vh;
      overflow: hidden;
      background-color: #0c121e;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      user-select: none;
      z-index: 20;
    `;
    this.container.appendChild(this.root);

    // -------------------------------------------------------------
    // LAYER 1: APPROVED EXACT BACKGROUND ARTWORK (image(10).png)
    // -------------------------------------------------------------
    const bgImage = document.createElement('img');
    bgImage.src = '/assets/intro_background.jpg';
    bgImage.alt = 'Island Haat Background';
    bgImage.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      pointer-events: none;
      z-index: 1;
    `;
    this.root.appendChild(bgImage);

    // -------------------------------------------------------------
    // LAYER 2: TRANSPARENT AMBIENT ANIMATION OVERLAY
    // -------------------------------------------------------------
    this.ambientOverlay = new AmbientOverlay(this.root);

    // -------------------------------------------------------------
    // LAYER 3: SEPARATE CODED ISLAND HAAT TITLE
    // -------------------------------------------------------------
    this.titleComponent = new IslandHaatTitle();
    this.root.appendChild(this.titleComponent.getElement());

    // -------------------------------------------------------------
    // LAYER 4: FUNCTIONAL MENU UI LAYER
    // -------------------------------------------------------------
    this.buildUILayer();

    // Start background music naturally on first interaction
    const startAudio = () => {
      this.music.startMusic();
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('keydown', startAudio);
  }

  public setCallbacks(opts: { onNewGame: () => void; onContinue: () => void }): void {
    this.onNewGameCallback = opts.onNewGame;
    this.onContinueCallback = opts.onContinue;
  }

  private buildUILayer(): void {
    const uiLayer = document.createElement('div');
    uiLayer.id = 'intro-functional-ui';
    uiLayer.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 30;
    `;
    this.root.appendChild(uiLayer);

    // Center Buttons Container (Comfortably positioned below the Title)
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
      position: absolute;
      top: 66%; left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      pointer-events: auto;
    `;

    // 1. NEW GAME (Warm golden carved button)
    const newGameBtn = this.createButton({
      text: 'NEW GAME',
      icon: '▶',
      isPrimary: true,
      onClick: () => {
        this.music.playButtonClick();
        this.destroy();
        this.onNewGameCallback?.();
      }
    });
    buttonGroup.appendChild(newGameBtn);

    // 2. CONTINUE (Dark warm wood button)
    const hasSave = localStorage.getItem('cultural_islands_save_v1') !== null;
    const continueBtn = this.createButton({
      text: 'CONTINUE',
      icon: '🏝️',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.destroy();
        this.onContinueCallback?.();
      }
    });
    if (!hasSave) {
      continueBtn.style.opacity = '0.75';
      continueBtn.title = 'No saved island found — start a New Game!';
    }
    buttonGroup.appendChild(continueBtn);

    // 3. SETTINGS
    const settingsBtn = this.createButton({
      text: 'SETTINGS',
      icon: '⚙️',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.showSettingsModal();
      }
    });
    buttonGroup.appendChild(settingsBtn);

    // 4. HOW TO PLAY
    const howToPlayBtn = this.createButton({
      text: 'HOW TO PLAY',
      icon: '📖',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.showHowToPlayModal();
      }
    });
    buttonGroup.appendChild(howToPlayBtn);

    uiLayer.appendChild(buttonGroup);

    // Bottom-Left: Language Selector
    const langBtn = document.createElement('div');
    langBtn.style.cssText = `
      position: absolute;
      bottom: 24px; left: 28px;
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
      transition: transform 0.15s ease, background 0.15s ease;
    `;
    langBtn.innerHTML = `🌐 English <span style="font-size:10px;color:#94a3b8;">▼</span>`;
    langBtn.onmouseenter = () => {
      langBtn.style.transform = 'translateY(-2px)';
      this.music.playButtonHover();
    };
    langBtn.onmouseleave = () => (langBtn.style.transform = 'translateY(0)');
    langBtn.onclick = () => {
      this.music.playButtonClick();
      alert('Language: English (Default). More languages coming in full release.');
    };
    uiLayer.appendChild(langBtn);

    // Bottom-Right: Social & Help Icons
    const socialGroup = document.createElement('div');
    socialGroup.style.cssText = `
      position: absolute;
      bottom: 24px; right: 28px;
      display: flex;
      gap: 12px;
      pointer-events: auto;
    `;

    const makeIconButton = (icon: string, label: string, action: () => void) => {
      const b = document.createElement('div');
      b.style.cssText = `
        width: 42px; height: 42px;
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
        transition: transform 0.15s ease, background 0.15s ease;
      `;
      b.title = label;
      b.innerHTML = icon;
      b.onmouseenter = () => {
        b.style.transform = 'translateY(-2px) scale(1.06)';
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
    socialGroup.appendChild(makeIconButton('🎮', 'Controls Guide', () => this.showHowToPlayModal()));
    socialGroup.appendChild(makeIconButton('✨', 'Credits', () => this.showCreditsModal()));
    uiLayer.appendChild(socialGroup);

    // Modals Container
    this.createModals();
  }

  private createButton(opts: { text: string; icon: string; isPrimary: boolean; onClick: () => void }): HTMLElement {
    const btn = document.createElement('div');
    const isPri = opts.isPrimary;

    btn.style.cssText = `
      width: 250px;
      height: ${isPri ? '52px' : '46px'};
      background: ${isPri ? 'linear-gradient(180deg, #ffc83b 0%, #f59e0b 50%, #d97706 100%)' : 'linear-gradient(180deg, #8d5b38 0%, #6d4223 60%, #533118 100%)'};
      border: 2px solid ${isPri ? '#fff0a8' : '#b07d58'};
      border-radius: 22px;
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
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    `;

    btn.innerHTML = `<span style="font-size:${isPri ? '16px' : '14px'};">${opts.icon}</span> <span>${opts.text}</span>`;

    btn.onmouseenter = () => {
      this.music.playButtonHover();
      btn.style.transform = 'translateY(-3px) scale(1.03)';
      btn.style.boxShadow = `0 12px 28px ${isPri ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0,0,0,0.5)'}, inset 0 2px 0 rgba(255,255,255,0.6)`;
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
    const modalStyle = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border: 2px solid #d97706;
      border-radius: 24px;
      padding: 28px 36px;
      width: 500px;
      max-width: 90vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.7);
      display: none;
      flex-direction: column;
      gap: 16px;
      pointer-events: auto;
      z-index: 60;
      color: #fff;
    `;

    // Settings Modal
    this.settingsModal = document.createElement('div');
    this.settingsModal.style.cssText = modalStyle;
    this.root.appendChild(this.settingsModal);

    // How To Play Modal
    this.howToPlayModal = document.createElement('div');
    this.howToPlayModal.style.cssText = modalStyle;
    this.root.appendChild(this.howToPlayModal);

    // Credits Modal
    this.creditsModal = document.createElement('div');
    this.creditsModal.style.cssText = modalStyle;
    this.root.appendChild(this.creditsModal);
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

    const bindSlider = (id: string, valId: string, prop: keyof typeof s) => {
      const input = document.getElementById(id) as HTMLInputElement;
      input.oninput = () => {
        const val = Number(input.value) / 100;
        (s as any)[prop] = val;
        document.getElementById(valId)!.innerText = `${input.value}%`;
      };
    };

    bindSlider('slider-master', 'val-master', 'master');
    bindSlider('slider-music', 'val-music', 'music');
    bindSlider('slider-sfx', 'val-sfx', 'sfx');

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
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Drag and snap modular 3D hex blocks to expand your miniature island in the ocean.</div>
        </div>

        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">2️⃣ 🌲🌾</div>
          <div style="font-weight:800;font-size:14px;color:#4ade80;">Match Edges</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Connect matching forests, rivers, and farms to earn bonus coins and synergies.</div>
        </div>

        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">3️⃣ 🏪🪙</div>
          <div style="font-weight:800;font-size:14px;color:#facc15;">Trade at Haat</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Exchange grain, textiles, and pottery with visiting traders at the seaside Haat.</div>
        </div>

        <div style="background:rgba(255,255,255,0.05);padding:14px;border-radius:16px;">
          <div style="font-size:22px;margin-bottom:4px;">4️⃣ 🚶✨</div>
          <div style="font-weight:800;font-size:14px;color:#c084fc;">Explore in 3D</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">Walk around your island with WASD, jump, harvest, and open treasure chests!</div>
        </div>
      </div>

      <button id="start-htp-btn" style="margin-top:10px;background:#f59e0b;color:#0f172a;font-weight:800;border:none;border-radius:14px;padding:12px;cursor:pointer;font-size:14px;">Got it! Start Building</button>
    `;

    document.getElementById('close-htp')!.onclick = () => (this.howToPlayModal.style.display = 'none');
    document.getElementById('start-htp-btn')!.onclick = () => {
      this.howToPlayModal.style.display = 'none';
      this.destroy();
      this.onNewGameCallback?.();
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

  public destroy(): void {
    this.ambientOverlay.destroy();
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }
}
