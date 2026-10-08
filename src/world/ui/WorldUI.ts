import { WorldState } from '../state/WorldState';
import { DayNightSystem } from '../graphics/DayNightSystem';
import { GameMode } from '../camera/CameraController';
import { InteractableTarget } from '../interaction/InteractionSystem';
import { TILE_LIBRARY } from '../data/tileLibrary';

export class WorldUI {
  private container: HTMLElement;
  private state: WorldState;
  private dayNight: DayNightSystem;

  // UI elements
  private dayPhaseText!: HTMLElement;
  private freezeBtn!: HTMLElement;
  private coinsText!: HTMLElement;
  private refillsText!: HTMLElement;
  private handContainer!: HTMLElement;
  private hintBubble!: HTMLElement;
  private modeToggleBtn!: HTMLElement;
  private interactPrompt!: HTMLElement;
  private haatModal!: HTMLElement;
  private levelText!: HTMLElement;
  private progressBar!: HTMLElement;
  private controlsHelp!: HTMLElement;

  private onTileSelectCallback?: (index: number) => void;
  private onRotateCallback?: () => void;
  private onModeToggleCallback?: () => void;
  private onTradeCallback?: (traderName: string) => void;

  constructor(state: WorldState, dayNight: DayNightSystem) {
    this.state = state;
    this.dayNight = dayNight;

    this.container = document.createElement('div');
    this.container.id = 'world-ui-layer';
    this.container.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      color: #fff;
      overflow: hidden;
      z-index: 20;
    `;
    document.body.appendChild(this.container);

    this.buildDOM();
  }

  private buildDOM(): void {
    // Top Bar Container
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      position: absolute;
      top: 16px; left: 16px; right: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: auto;
    `;
    this.container.appendChild(topBar);

    // Top Left: Level & Progress
    const topLeft = document.createElement('div');
    topLeft.style.cssText = `
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      padding: 10px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 170px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    `;
    this.levelText = document.createElement('div');
    this.levelText.style.cssText = `font-size: 13px; font-weight: 700; letter-spacing: 0.5px; color: #94a3b8;`;
    this.levelText.innerHTML = `LV.<span style="color:#38bdf8;font-size:16px;">1</span> ISLET`;

    const progressTrack = document.createElement('div');
    progressTrack.style.cssText = `width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;`;
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `width: 20%; height: 100%; background: linear-gradient(90deg, #38bdf8, #818cf8); transition: width 0.3s ease;`;
    progressTrack.appendChild(this.progressBar);

    topLeft.appendChild(this.levelText);
    topLeft.appendChild(progressTrack);
    topBar.appendChild(topLeft);

    // Top Center: Hint Speech Bubble
    this.hintBubble = document.createElement('div');
    this.hintBubble.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      color: #0f172a;
      font-weight: 700;
      font-size: 14px;
      padding: 8px 20px;
      border-radius: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    this.hintBubble.innerHTML = `Drag this tile onto your island 🏝️`;
    topBar.appendChild(this.hintBubble);

    // Top Right: Day/Night Widget & Freeze Button
    const topRight = document.createElement('div');
    topRight.style.cssText = `
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      padding: 8px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    `;
    this.dayPhaseText = document.createElement('div');
    this.dayPhaseText.style.cssText = `font-size: 12px; font-weight: 800; color: #fde047; letter-spacing: 1px;`;
    this.dayPhaseText.innerHTML = `☀️ DAY`;

    this.freezeBtn = document.createElement('button');
    this.freezeBtn.style.cssText = `
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      color: #cbd5e1;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    `;
    this.freezeBtn.innerHTML = `⏸️ Freeze`;
    this.freezeBtn.onclick = () => {
      const frozen = this.dayNight.toggleFreeze();
      this.freezeBtn.style.background = frozen ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.08)';
    };

    topRight.appendChild(this.dayPhaseText);
    topRight.appendChild(this.freezeBtn);
    topBar.appendChild(topRight);

    // Floating Interaction Prompt (World space indicator)
    this.interactPrompt = document.createElement('div');
    this.interactPrompt.style.cssText = `
      position: absolute;
      bottom: 25%; left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 2px solid #38bdf8;
      border-radius: 30px;
      padding: 10px 24px;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      display: none;
      align-items: center;
      gap: 10px;
      box-shadow: 0 12px 36px rgba(56, 189, 248, 0.35);
      pointer-events: auto;
      cursor: pointer;
    `;
    this.container.appendChild(this.interactPrompt);

    // Mode Toggle Button (Explore <-> Build)
    this.modeToggleBtn = document.createElement('button');
    this.modeToggleBtn.style.cssText = `
      position: absolute;
      top: 90px; right: 20px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 24px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      padding: 10px 20px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(2, 132, 199, 0.4);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    `;
    this.modeToggleBtn.innerHTML = `🚶 Enter Island`;
    this.modeToggleBtn.onclick = () => this.onModeToggleCallback?.();
    this.container.appendChild(this.modeToggleBtn);

    // Controls Legend (Exploration mode help)
    this.controlsHelp = document.createElement('div');
    this.controlsHelp.style.cssText = `
      position: absolute;
      top: 90px; left: 20px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 12px 18px;
      font-size: 12px;
      display: none;
      flex-direction: column;
      gap: 6px;
      color: #cbd5e1;
    `;
    this.controlsHelp.innerHTML = `
      <div style="font-weight:700;color:#38bdf8;">Controls</div>
      <div><b style="color:#fff;">WASD</b> - Move</div>
      <div><b style="color:#fff;">Space</b> - Jump</div>
      <div><b style="color:#fff;">Mouse</b> - Orbit View</div>
      <div><b style="color:#fff;">E</b> - Interact</div>
      <div><b style="color:#fff;">ESC</b> - Exit Character</div>
    `;
    this.container.appendChild(this.controlsHelp);

    // Bottom Bar (Tile Hand Cards & Economy Counters)
    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = `
      position: absolute;
      bottom: 24px; left: 0; width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 20px;
      pointer-events: auto;
    `;
    this.container.appendChild(bottomBar);

    // Hand Cards Container
    this.handContainer = document.createElement('div');
    this.handContainer.style.cssText = `
      display: flex;
      align-items: flex-end;
      gap: 12px;
    `;
    bottomBar.appendChild(this.handContainer);

    // Stats Widget (Refills & Coins)
    const statsWidget = document.createElement('div');
    statsWidget.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    // Refills card
    const refillCard = document.createElement('div');
    refillCard.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 18px;
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    `;
    this.refillsText = document.createElement('div');
    this.refillsText.style.cssText = `font-size: 20px; font-weight: 800; color: #4ade80;`;
    this.refillsText.innerText = `5`;
    const refillLabel = document.createElement('div');
    refillLabel.style.cssText = `font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px;`;
    refillLabel.innerText = `REFILLS`;
    refillCard.appendChild(this.refillsText);
    refillCard.appendChild(refillLabel);

    // Coins card
    const coinCard = document.createElement('div');
    coinCard.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 18px;
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    `;
    this.coinsText = document.createElement('div');
    this.coinsText.style.cssText = `font-size: 20px; font-weight: 800; color: #facc15;`;
    this.coinsText.innerText = `0`;
    const coinLabel = document.createElement('div');
    coinLabel.style.cssText = `font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px;`;
    coinLabel.innerText = `COINS`;
    coinCard.appendChild(this.coinsText);
    coinCard.appendChild(coinLabel);

    statsWidget.appendChild(refillCard);
    statsWidget.appendChild(coinCard);
    bottomBar.appendChild(statsWidget);

    // Haat Trading Modal (contextual)
    this.haatModal = document.createElement('div');
    this.haatModal.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 2px solid #f59e0b;
      border-radius: 24px;
      padding: 24px 32px;
      width: 480px;
      max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      display: none;
      flex-direction: column;
      gap: 16px;
      pointer-events: auto;
      z-index: 50;
    `;
    this.container.appendChild(this.haatModal);
  }

  public setCallbacks(opts: {
    onTileSelect: (index: number) => void;
    onRotate: () => void;
    onModeToggle: () => void;
  }): void {
    this.onTileSelectCallback = opts.onTileSelect;
    this.onRotateCallback = opts.onRotate;
    this.onModeToggleCallback = opts.onModeToggle;
  }

  public renderHand(): void {
    this.handContainer.innerHTML = '';
    this.state.hand.forEach((tileDef, idx) => {
      const isSelected = idx === this.state.selectedIndex;
      const card = document.createElement('div');
      card.style.cssText = `
        background: ${isSelected ? 'linear-gradient(180deg, #1e293b, #0f172a)' : 'rgba(15, 23, 42, 0.8)'};
        border: 2px solid ${isSelected ? (tileDef.rarity === 'rare' ? '#a855f7' : '#4ade80') : 'rgba(255,255,255,0.1)'};
        border-radius: 20px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        min-width: 90px;
        transform: ${isSelected ? 'translateY(-14px) scale(1.05)' : 'translateY(0)'};
        box-shadow: ${isSelected ? '0 12px 30px rgba(0,0,0,0.4)' : 'none'};
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      // Tile icon / preview badge
      const icon = document.createElement('div');
      icon.style.cssText = `font-size: 24px;`;
      icon.innerText = tileDef.id.includes('forest') || tileDef.id.includes('grove') ? '🌲' :
                       tileDef.id.includes('farm') || tileDef.id.includes('field') ? '🌾' :
                       tileDef.id.includes('water') || tileDef.id.includes('river') ? '💧' :
                       tileDef.id.includes('hill') || tileDef.id.includes('quarry') ? '⛰️' :
                       tileDef.id.includes('haat') ? '🏪' : '🏡';

      const title = document.createElement('div');
      title.style.cssText = `font-size: 13px; font-weight: 700; color: #fff;`;
      title.innerText = tileDef.name;

      card.appendChild(icon);
      card.appendChild(title);

      if (tileDef.rarity === 'rare') {
        const rareBadge = document.createElement('div');
        rareBadge.style.cssText = `
          font-size: 9px; font-weight: 800; color: #c084fc;
          background: rgba(168, 85, 247, 0.2);
          border-radius: 8px; padding: 2px 6px;
        `;
        rareBadge.innerText = 'RARE';
        card.appendChild(rareBadge);
      }

      card.onclick = () => {
        if (isSelected) {
          this.onRotateCallback?.();
        } else {
          this.onTileSelectCallback?.(idx);
        }
      };

      this.handContainer.appendChild(card);
    });
  }

  public update(mode: GameMode, interactTarget: InteractableTarget | null): void {
    // 1. Day phase HUD
    const phaseInfo = this.dayNight.getPhaseInfo();
    this.dayPhaseText.innerHTML = `${phaseInfo.symbol} ${phaseInfo.label}`;

    // 2. Economy counters
    this.coinsText.innerText = `${this.state.coins}`;
    this.refillsText.innerText = `${this.state.refills}`;

    // 3. Level & Progress
    const targetProgress = Math.min(100, (this.state.totalTilesPlaced % 5) * 20);
    this.progressBar.style.width = `${targetProgress}%`;
    this.levelText.innerHTML = `LV.<span style="color:#38bdf8;font-size:16px;">${this.state.level}</span> ${this.state.level === 1 ? 'ISLET' : (this.state.level === 2 ? 'SETTLEMENT' : 'HAAT TOWN')}`;

    // 4. Mode-specific visibility
    if (mode === 'explore') {
      this.modeToggleBtn.innerHTML = `← Exit Character`;
      this.modeToggleBtn.style.background = 'linear-gradient(135deg, #475569, #334155)';
      this.handContainer.style.display = 'none';
      this.controlsHelp.style.display = 'flex';
      this.hintBubble.style.display = 'none';

      // Interaction prompt
      if (interactTarget) {
        this.interactPrompt.style.display = 'flex';
        this.interactPrompt.innerHTML = `<span style="background:#38bdf8;color:#0f172a;border-radius:8px;padding:2px 8px;font-weight:800;">E</span> ${interactTarget.actionText}`;
      } else {
        this.interactPrompt.style.display = 'none';
      }
    } else {
      this.modeToggleBtn.innerHTML = `🚶 Enter Island`;
      this.modeToggleBtn.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
      this.handContainer.style.display = 'flex';
      this.controlsHelp.style.display = 'none';
      this.interactPrompt.style.display = 'none';
      this.hintBubble.style.display = 'flex';

      if (this.state.activeEvent) {
        this.hintBubble.innerHTML = `⚠️ <b>${this.state.activeEvent.title}</b> Click 'Enter Island' to help!`;
        this.hintBubble.style.border = '2px solid #ef4444';
      } else {
        this.hintBubble.innerHTML = `Click any slot to place • Press <b>R</b> or Click selected card to Rotate`;
        this.hintBubble.style.border = 'none';
      }
    }
  }

  public showHaatTradeModal(onClose: () => void): void {
    this.haatModal.style.display = 'flex';
    this.haatModal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;color:#f59e0b;display:flex;gap:8px;align-items:center;">🏪 Haat Trading Square</h2>
        <button id="close-haat-btn" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>
      </div>
      <p style="font-size:13px;color:#cbd5e1;">Exchange local produce with visiting island traders for cultural resources and coins.</p>
      
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
        <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;">🪵 Leela the Weaver</div>
            <div style="font-size:12px;color:#94a3b8;">Offers 2x 🧵 Textile for 2x 🌾 Grain</div>
          </div>
          <button id="trade-1-btn" style="background:#f59e0b;color:#0f172a;border:none;border-radius:10px;padding:6px 14px;font-weight:700;cursor:pointer;">Trade</button>
        </div>

        <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;">💧 Kabir the Mariner</div>
            <div style="font-size:12px;color:#94a3b8;">Offers 25x 🪙 Coins for 1x 🏺 Pottery</div>
          </div>
          <button id="trade-2-btn" style="background:#f59e0b;color:#0f172a;border:none;border-radius:10px;padding:6px 14px;font-weight:700;cursor:pointer;">Trade</button>
        </div>
      </div>
    `;

    document.getElementById('close-haat-btn')!.onclick = () => {
      this.haatModal.style.display = 'none';
      onClose();
    };

    document.getElementById('trade-1-btn')!.onclick = () => {
      this.state.coins += 20;
      this.state.inventory.fibre += 2;
      this.haatModal.style.display = 'none';
      onClose();
    };

    document.getElementById('trade-2-btn')!.onclick = () => {
      this.state.coins += 35;
      this.haatModal.style.display = 'none';
      onClose();
    };
  }

  public showFloatingReward(text: string, x: number, y: number): void {
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      left: ${x}px; top: ${y}px;
      transform: translate(-50%, -50%);
      font-size: 22px;
      font-weight: 800;
      color: #facc15;
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
      pointer-events: none;
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100;
    `;
    el.innerText = text;
    this.container.appendChild(el);

    requestAnimationFrame(() => {
      el.style.top = `${y - 60}px`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 850);
  }
}
