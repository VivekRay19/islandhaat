import { CultureProfile, IndianState } from './CultureTypes';
import { CULTURE_PROFILES } from './CultureRegistry';
import { IntroMusic } from '../audio/IntroMusic';

export class CultureSelectionScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private selectedState: IndianState = 'bihar';
  private music = IntroMusic.get();

  private onConfirmCallback?: (state: IndianState) => void;
  private onBackCallback?: () => void;

  // DOM elements
  private previewPanel!: HTMLElement;
  private confirmBtn!: HTMLElement;
  private cardsMap: Map<IndianState, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;

    this.root = document.createElement('div');
    this.root.id = 'culture-selection-root';
    this.root.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100vw; height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 60%, #020617 100%);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #fff;
      user-select: none;
      z-index: 40;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px 48px;
      box-sizing: border-box;
    `;
    this.container.appendChild(this.root);

    this.buildHeader();
    this.buildCardsGrid();
    this.buildDetailPreview();
    this.buildBottomActions();

    // Select Bihar by default
    this.selectState('bihar');
  }

  public setCallbacks(opts: {
    onConfirm: (state: IndianState) => void;
    onBack: () => void;
  }): void {
    this.onConfirmCallback = opts.onConfirm;
    this.onBackCallback = opts.onBack;
  }

  private buildHeader(): void {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 24px;
      gap: 6px;
    `;

    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #facc15;
      text-shadow: 0 2px 14px rgba(250, 204, 21, 0.4);
      margin: 0;
    `;
    title.innerText = 'CHOOSE YOUR CULTURE';

    const subtitle = document.createElement('p');
    subtitle.style.cssText = `
      font-size: 15px;
      font-weight: 600;
      color: #cbd5e1;
      margin: 0;
      letter-spacing: 0.5px;
    `;
    subtitle.innerText = 'Six traditions. Six ways to build. One connected world.';

    header.appendChild(title);
    header.appendChild(subtitle);
    this.root.appendChild(header);
  }

  private buildCardsGrid(): void {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      width: 100%;
      max-width: 1100px;
      margin-bottom: 24px;
      box-sizing: border-box;
    `;

    const states: IndianState[] = ['bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan'];

    states.forEach((st) => {
      const profile = CULTURE_PROFILES[st];
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(12px);
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      `;

      card.onmouseenter = () => {
        if (this.selectedState !== st) {
          card.style.transform = 'translateY(-4px)';
          card.style.borderColor = 'rgba(250, 204, 21, 0.5)';
          card.style.boxShadow = '0 12px 28px rgba(250, 204, 21, 0.2)';
          this.music.playButtonHover();
        }
      };

      card.onmouseleave = () => {
        if (this.selectedState !== st) {
          card.style.transform = 'translateY(0)';
          card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
        }
      };

      card.onclick = () => {
        this.music.playButtonClick();
        this.selectState(st);
      };

      // Vector Icon / Emblem Header
      const iconWrap = document.createElement('div');
      iconWrap.style.cssText = `
        width: 60px; height: 60px;
        border-radius: 50%;
        background: rgba(255,255,255,0.06);
        border: 2px solid ${profile.palette.primary};
        display: flex; align-items: center; justify-content: center;
        padding: 6px;
        box-sizing: border-box;
      `;
      iconWrap.innerHTML = profile.specialist.iconSvg;
      card.appendChild(iconWrap);

      // State Name
      const name = document.createElement('div');
      name.style.cssText = `
        font-size: 18px;
        font-weight: 800;
        color: #fff;
        text-align: center;
      `;
      name.innerText = profile.stateName;
      card.appendChild(name);

      // Signature Crafts pill
      const craftsPill = document.createElement('div');
      craftsPill.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        color: ${profile.palette.primary};
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 4px 10px;
        text-align: center;
      `;
      craftsPill.innerText = profile.signatureCrafts.slice(0, 2).join(' • ');
      card.appendChild(craftsPill);

      // Specialist Details
      const specBox = document.createElement('div');
      specBox.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4px;
        margin-top: 4px;
      `;
      const specName = document.createElement('div');
      specName.style.cssText = `font-size: 13px; font-weight: 800; color: #facc15;`;
      specName.innerText = profile.specialist.name;

      const specDesc = document.createElement('div');
      specDesc.style.cssText = `font-size: 11px; color: #94a3b8; line-height: 1.4;`;
      specDesc.innerText = profile.specialist.tagline;

      specBox.appendChild(specName);
      specBox.appendChild(specDesc);
      card.appendChild(specBox);

      // Advantage Badge
      const advantage = document.createElement('div');
      advantage.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        color: #4ade80;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 10px;
        padding: 4px 8px;
        text-align: center;
        margin-top: 6px;
      `;
      advantage.innerText = `⚡ ${profile.specialist.abilityName}`;
      card.appendChild(advantage);

      this.cardsMap.set(st, card);
      grid.appendChild(card);
    });

    this.root.appendChild(grid);
  }

  private buildDetailPreview(): void {
    this.previewPanel = document.createElement('div');
    this.previewPanel.style.cssText = `
      width: 100%;
      max-width: 1100px;
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid #facc15;
      border-radius: 24px;
      padding: 22px 28px;
      display: flex;
      gap: 28px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      margin-bottom: 24px;
      box-sizing: border-box;
    `;
    this.root.appendChild(this.previewPanel);
  }

  private buildBottomActions(): void {
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 16px;
      align-items: center;
      margin-top: auto;
    `;

    // Back Button
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      color: #cbd5e1;
      font-size: 14px;
      font-weight: 700;
      padding: 12px 28px;
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
    `;
    backBtn.innerText = '← BACK TO MENU';
    backBtn.onmouseenter = () => {
      backBtn.style.background = 'rgba(255,255,255,0.18)';
      this.music.playButtonHover();
    };
    backBtn.onmouseleave = () => (backBtn.style.background = 'rgba(255,255,255,0.1)');
    backBtn.onclick = () => {
      this.music.playButtonClick();
      this.destroy();
      this.onBackCallback?.();
    };
    actions.appendChild(backBtn);

    // Confirm Button
    this.confirmBtn = document.createElement('button');
    this.confirmBtn.style.cssText = `
      background: linear-gradient(180deg, #facc15 0%, #f59e0b 50%, #d97706 100%);
      border: 2px solid #fef08a;
      border-radius: 20px;
      color: #3e1a00;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 1px;
      padding: 12px 36px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.45);
      transition: transform 0.15s, box-shadow 0.15s;
    `;
    this.confirmBtn.innerText = 'CONFIRM CULTURE & START ISLAND ▶';
    this.confirmBtn.onmouseenter = () => {
      this.confirmBtn.style.transform = 'translateY(-2px) scale(1.03)';
      this.confirmBtn.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.6)';
      this.music.playButtonHover();
    };
    this.confirmBtn.onmouseleave = () => {
      this.confirmBtn.style.transform = 'translateY(0) scale(1)';
      this.confirmBtn.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.45)';
    };
    this.confirmBtn.onclick = () => {
      this.music.playButtonClick();
      this.destroy();
      this.onConfirmCallback?.(this.selectedState);
    };
    actions.appendChild(this.confirmBtn);

    this.root.appendChild(actions);
  }

  private selectState(state: IndianState): void {
    this.selectedState = state;
    const profile = CULTURE_PROFILES[state];

    // Highlight card
    this.cardsMap.forEach((card, st) => {
      if (st === state) {
        card.style.borderColor = '#facc15';
        card.style.transform = 'translateY(-6px) scale(1.02)';
        card.style.boxShadow = '0 16px 36px rgba(250, 204, 21, 0.35)';
      } else {
        card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      }
    });

    // Update Detail Preview Panel
    this.previewPanel.innerHTML = `
      <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <h2 style="font-size:22px; font-weight:900; color:#facc15; margin:0;">${profile.displayName}</h2>
          <span style="font-size:12px; font-weight:700; color:#94a3b8;">${profile.regionTitle}</span>
        </div>
        <div style="font-size:13px; color:#cbd5e1; line-height:1.5;">${profile.overview}</div>
        
        <div style="display:flex; gap:12px; margin-top:6px;">
          <div style="background:rgba(255,255,255,0.06); padding:8px 14px; border-radius:12px; font-size:12px;">
            <b style="color:#fde047;">Signature Architecture:</b> ${profile.signatureStructures.join(', ')}
          </div>
          <div style="background:rgba(255,255,255,0.06); padding:8px 14px; border-radius:12px; font-size:12px;">
            <b style="color:#4ade80;">Starting Coins:</b> ${profile.startingResources.coins} 🪙
          </div>
        </div>
      </div>

      <div style="width:340px; background:rgba(0,0,0,0.3); border-radius:18px; padding:16px; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:11px; font-weight:800; color:#94a3b8; letter-spacing:0.5px;">YOUR SPECIALIST</div>
        <div style="font-size:16px; font-weight:800; color:#fff;">${profile.specialist.name}</div>
        <div style="font-size:12px; font-weight:700; color:#38bdf8;">Tool: ${profile.specialist.signatureTool}</div>
        <div style="font-size:11px; color:#cbd5e1; line-height:1.4;">${profile.specialist.biography}</div>
        
        <div style="margin-top:6px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); border-radius:10px; padding:8px;">
          <div style="font-size:12px; font-weight:800; color:#38bdf8;">⚡ ${profile.specialist.abilityName}</div>
          <div style="font-size:11px; color:#e2e8f0; margin-top:2px;">${profile.specialist.abilityDescription}</div>
        </div>
      </div>
    `;
  }

  public destroy(): void {
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }
}
