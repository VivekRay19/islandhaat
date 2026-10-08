import { WorldState } from '../state/WorldState';
import { DayNightSystem } from '../graphics/DayNightSystem';
import { GameMode } from '../camera/CameraController';
import { InteractableTarget } from '../interaction/InteractionSystem';
import { TILE_LIBRARY } from '../data/tileLibrary';

export class WorldUI {
  private container: HTMLElement;
  private state: WorldState;
  private dayNight: DayNightSystem;

  // Top Bar elements
  private dayText!: HTMLElement;
  private coinVal!: HTMLElement;
  private woodVal!: HTMLElement;
  private wheatVal!: HTMLElement;
  private stoneVal!: HTMLElement;
  private flowerVal!: HTMLElement;
  private clockWidget!: HTMLElement;
  private clockIcon!: HTMLElement;
  private clockTime!: HTMLElement;

  // Build Mode Hand Bar
  private handBarContainer!: HTMLElement;
  private cardsRow!: HTMLElement;
  private stackCounter!: HTMLElement;
  private modeToggleBtn!: HTMLElement;

  // Explore Mode HUD
  private exploreObjective!: HTMLElement;
  private wasdOverlay!: HTMLElement;
  private interactPrompt!: HTMLElement;

  // Modals
  private haatModal!: HTMLElement;

  private onTileSelectCallback?: (index: number) => void;
  private onRotateCallback?: () => void;
  private onModeToggleCallback?: () => void;

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
      user-select: none;
      z-index: 20;
    `;
    document.body.appendChild(this.container);

    this.buildDOM();
  }

  private buildDOM(): void {
    // =========================================================================
    // 1. TOP BAR HUD (MATCHING REFERENCE IMAGE)
    // =========================================================================
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      position: absolute;
      top: 18px; left: 24px; right: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: auto;
    `;
    this.container.appendChild(topBar);

    // Top-Left: Island Title & Day Counter
    const topLeft = document.createElement('div');
    topLeft.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 2px;
    `;
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    `;
    title.innerText = 'ISLAND HAAT';
    this.dayText = document.createElement('div');
    this.dayText.style.cssText = `
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #94a3b8;
    `;
    this.dayText.innerText = 'DAY 3';
    topLeft.appendChild(title);
    topLeft.appendChild(this.dayText);
    topBar.appendChild(topLeft);

    // Top-Center: Resource Bar (Coins, Wood, Wheat, Stone, Flowers)
    const resourceBar = document.createElement('div');
    resourceBar.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 28px;
      padding: 6px 18px;
      display: flex;
      align-items: center;
      gap: 18px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;

    const createResItem = (icon: string, initialVal: number) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 800;
      `;
      item.innerHTML = `<span style="font-size:16px;">${icon}</span> <span>${initialVal}</span>`;
      return { item, valSpan: item.querySelector('span:nth-child(2)') as HTMLElement };
    };

    const resCoin = createResItem('🪙', 420);
    this.coinVal = resCoin.valSpan;
    const resWood = createResItem('🪵', 58);
    this.woodVal = resWood.valSpan;
    const resWheat = createResItem('🌾', 32);
    this.wheatVal = resWheat.valSpan;
    const resStone = createResItem('🪨', 18);
    this.stoneVal = resStone.valSpan;
    const resFlower = createResItem('🌸', 12);
    this.flowerVal = resFlower.valSpan;

    resourceBar.appendChild(resCoin.item);
    resourceBar.appendChild(resWood.item);
    resourceBar.appendChild(resWheat.item);
    resourceBar.appendChild(resStone.item);
    resourceBar.appendChild(resFlower.item);
    topBar.appendChild(resourceBar);

    // Top-Right: Circular Day/Night Clock Widget
    this.clockWidget = document.createElement('div');
    this.clockWidget.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 28px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      cursor: pointer;
    `;
    this.clockIcon = document.createElement('div');
    this.clockIcon.style.cssText = `font-size: 18px;`;
    this.clockIcon.innerText = '☀️';
    this.clockTime = document.createElement('div');
    this.clockTime.style.cssText = `font-size: 11px; font-weight: 800; color: #fde047;`;
    this.clockTime.innerText = '10:24 AM';
    this.clockWidget.appendChild(this.clockIcon);
    this.clockWidget.appendChild(this.clockTime);
    this.clockWidget.onclick = () => this.dayNight.toggleFreeze();
    topBar.appendChild(this.clockWidget);

    // Mode Toggle Button (Floating)
    this.modeToggleBtn = document.createElement('button');
    this.modeToggleBtn.style.cssText = `
      position: absolute;
      top: 80px; right: 24px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 22px;
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      padding: 10px 18px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(2, 132, 199, 0.4);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.15s, box-shadow 0.15s;
    `;
    this.modeToggleBtn.innerHTML = `🚶 Enter Island`;
    this.modeToggleBtn.onclick = () => this.onModeToggleCallback?.();
    this.container.appendChild(this.modeToggleBtn);

    // =========================================================================
    // 2. BOTTOM HAND DECK (MATCHING REFERENCE IMAGE)
    // =========================================================================
    this.handBarContainer = document.createElement('div');
    this.handBarContainer.style.cssText = `
      position: absolute;
      bottom: 24px; left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 14px;
      pointer-events: auto;
    `;
    this.container.appendChild(this.handBarContainer);

    // Left Arrow
    const leftArrow = document.createElement('div');
    leftArrow.style.cssText = `
      width: 38px; height: 38px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; cursor: pointer; color: #cbd5e1;
    `;
    leftArrow.innerHTML = `◀`;
    this.handBarContainer.appendChild(leftArrow);

    // Cards Row
    this.cardsRow = document.createElement('div');
    this.cardsRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    this.handBarContainer.appendChild(this.cardsRow);

    // Right Arrow
    const rightArrow = document.createElement('div');
    rightArrow.style.cssText = `
      width: 38px; height: 38px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; cursor: pointer; color: #cbd5e1;
    `;
    rightArrow.innerHTML = `▶`;
    this.handBarContainer.appendChild(rightArrow);

    // Stack Counter Badge (Right)
    this.stackCounter = document.createElement('div');
    this.stackCounter.style.cssText = `
      width: 52px; height: 52px;
      border-radius: 18px;
      background: linear-gradient(135deg, #15803d, #166534);
      border: 2px solid #86efac;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      color: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    `;
    this.stackCounter.innerHTML = `<span>12</span>`;
    this.handBarContainer.appendChild(this.stackCounter);

    // =========================================================================
    // 3. EXPLORATION MODE HUD (MATCHING REFERENCE IMAGE)
    // =========================================================================
    // Objective Badge (Top-Left)
    this.exploreObjective = document.createElement('div');
    this.exploreObjective.style.cssText = `
      position: absolute;
      top: 80px; left: 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 18px;
      padding: 12px 18px;
      display: none;
      flex-direction: column;
      gap: 4px;
      min-width: 220px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: auto;
    `;
    this.exploreObjective.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:#f59e0b;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;">
        🚩 Current Objective
      </div>
      <div style="font-size:14px;font-weight:800;color:#fff;">Visit the Haat</div>
      <div style="font-size:11px;color:#94a3b8;">Explore the marketplace and trade goods</div>
    `;
    this.container.appendChild(this.exploreObjective);

    // Virtual WASD Pad (Bottom-Left)
    this.wasdOverlay = document.createElement('div');
    this.wasdOverlay.style.cssText = `
      position: absolute;
      bottom: 32px; left: 32px;
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    `;
    this.wasdOverlay.innerHTML = `
      <div style="width:40px;height:40px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;">W</div>
      <div style="display:flex;gap:6px;">
        <div style="width:40px;height:40px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;">A</div>
        <div style="width:40px;height:40px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;">S</div>
        <div style="width:40px;height:40px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#fff;">D</div>
      </div>
    `;
    this.container.appendChild(this.wasdOverlay);

    // Floating Interaction Prompt (Bottom-Center)
    this.interactPrompt = document.createElement('div');
    this.interactPrompt.style.cssText = `
      position: absolute;
      bottom: 24%; left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
      border: 2px solid #f59e0b;
      border-radius: 30px;
      padding: 10px 24px;
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      display: none;
      align-items: center;
      gap: 10px;
      box-shadow: 0 12px 36px rgba(245, 158, 11, 0.4);
      pointer-events: auto;
      cursor: pointer;
    `;
    this.container.appendChild(this.interactPrompt);

    // Haat Trading Modal
    this.haatModal = document.createElement('div');
    this.haatModal.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border: 2px solid #f59e0b;
      border-radius: 24px;
      padding: 24px 32px;
      width: 480px;
      max-width: 90vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.7);
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
    this.cardsRow.innerHTML = '';
    this.state.hand.forEach((tileDef, idx) => {
      const isSelected = idx === this.state.selectedIndex;
      const card = document.createElement('div');
      card.style.cssText = `
        background: ${isSelected ? 'linear-gradient(180deg, #334155, #1e293b)' : 'rgba(15, 23, 42, 0.85)'};
        border: ${isSelected ? '3px solid #facc15' : '2px solid rgba(255,255,255,0.15)'};
        border-radius: 22px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        min-width: 82px;
        transform: ${isSelected ? 'translateY(-12px) scale(1.08)' : 'translateY(0)'};
        box-shadow: ${isSelected ? '0 12px 32px rgba(250, 204, 21, 0.45)' : '0 4px 16px rgba(0,0,0,0.3)'};
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      `;

      const icon = document.createElement('div');
      icon.style.cssText = `font-size: 26px;`;
      icon.innerText = tileDef.id.includes('forest') || tileDef.id.includes('grove') ? '🌲' :
                       tileDef.id.includes('farm') || tileDef.id.includes('field') ? '🌾' :
                       tileDef.id.includes('water') || tileDef.id.includes('river') ? '💧' :
                       tileDef.id.includes('hill') || tileDef.id.includes('quarry') ? '⛰️' :
                       tileDef.id.includes('haat') ? '🏪' : '🏡';

      const title = document.createElement('div');
      title.style.cssText = `font-size: 11px; font-weight: 800; color: #fff; text-align: center;`;
      title.innerText = tileDef.name;

      card.appendChild(icon);
      card.appendChild(title);

      card.onclick = () => {
        if (isSelected) {
          this.onRotateCallback?.();
        } else {
          this.onTileSelectCallback?.(idx);
        }
      };

      this.cardsRow.appendChild(card);
    });
  }

  public update(mode: GameMode, interactTarget: InteractableTarget | null): void {
    // 1. Clock & Phase update
    const phaseInfo = this.dayNight.getPhaseInfo();
    this.clockIcon.innerText = phaseInfo.symbol;
    this.clockTime.innerText = phaseInfo.phase === 'night' ? '8:47 PM' : (phaseInfo.phase === 'dusk' ? '6:15 PM' : '10:24 AM');

    // 2. Resource counters
    this.coinVal.innerText = `${this.state.coins}`;
    this.woodVal.innerText = `${this.state.inventory.wood}`;
    this.wheatVal.innerText = `${this.state.inventory.grain}`;
    this.stoneVal.innerText = `${this.state.inventory.clay}`;
    this.flowerVal.innerText = `${this.state.inventory.fibre}`;

    // 3. Stack Counter
    this.stackCounter.innerHTML = `<span>${this.state.refills * 3 + this.state.hand.length}</span>`;

    // 4. Mode-specific HUD Visibility
    if (mode === 'explore') {
      this.modeToggleBtn.innerHTML = `← Exit Character`;
      this.modeToggleBtn.style.background = 'linear-gradient(135deg, #475569, #334155)';
      this.handBarContainer.style.display = 'none';
      this.exploreObjective.style.display = 'flex';
      this.wasdOverlay.style.display = 'flex';

      if (interactTarget) {
        this.interactPrompt.style.display = 'flex';
        this.interactPrompt.innerHTML = `<span style="background:#f59e0b;color:#0f172a;border-radius:8px;padding:2px 8px;font-weight:800;">E</span> ${interactTarget.actionText}`;
      } else {
        this.interactPrompt.style.display = 'none';
      }
    } else {
      this.modeToggleBtn.innerHTML = `🚶 Enter Island`;
      this.modeToggleBtn.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
      this.handBarContainer.style.display = 'flex';
      this.exploreObjective.style.display = 'none';
      this.wasdOverlay.style.display = 'none';
      this.interactPrompt.style.display = 'none';
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
