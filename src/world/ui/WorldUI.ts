import { WorldState } from '../state/WorldState';
import { DayNightSystem } from '../graphics/DayNightSystem';
import { GameMode } from '../camera/CameraController';
import { InteractableTarget } from '../interaction/InteractionSystem';
import { TILE_LIBRARY } from '../data/tileLibrary';
import { CULTURE_PROFILES } from '../culture/CultureRegistry';
import { IndianState } from '../culture/CultureTypes';
import { CulturalAssetDiagnostics } from '../culture/CulturalAssetDiagnostics';
import { CultureComparisonViewer } from '../culture/CultureComparisonViewer';

export class WorldUI {
  private container: HTMLElement;
  private state: WorldState;
  private dayNight: DayNightSystem;

  // Top Bar elements
  private dayText!: HTMLElement;
  private cultureBadge!: HTMLElement;
  private cultureScoreText!: HTMLElement;
  private coinVal!: HTMLElement;
  private woodVal!: HTMLElement;
  private wheatVal!: HTMLElement;
  private stoneVal!: HTMLElement;
  private flowerVal!: HTMLElement;
  private clockWidget!: HTMLElement;
  private clockIcon!: HTMLElement;
  private clockTime!: HTMLElement;

  // Quest Tracker
  private questTracker!: HTMLElement;

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
    const profile = CULTURE_PROFILES[this.state.selectedCulture];

    // =========================================================================
    // 1. TOP BAR HUD
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

    // Top-Left: Island Title, Day Counter & Cultural State Badge
    const topLeft = document.createElement('div');
    topLeft.style.cssText = `
      display: flex;
      align-items: center;
      gap: 14px;
    `;

    const titleStack = document.createElement('div');
    titleStack.style.cssText = `display:flex; flex-direction:column; gap:2px;`;
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
    titleStack.appendChild(title);
    titleStack.appendChild(this.dayText);
    topLeft.appendChild(titleStack);

    // State & Specialist Cultural Pill
    this.cultureBadge = document.createElement('div');
    this.cultureBadge.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid ${profile.palette.primary};
      border-radius: 20px;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: transform 0.15s;
    `;
    this.cultureBadge.title = 'Click or press F2 to open Asset Diagnostics';
    this.cultureBadge.innerHTML = `
      <span style="font-size:14px; font-weight:800; color:${profile.palette.primary};">${profile.stateName}</span>
      <span style="font-size:11px; color:#cbd5e1;">| ${profile.specialist.roleTitle}</span>
      <span style="font-size:11px; font-weight:800; color:#4ade80;">(⚡ ${profile.specialist.abilityName})</span>
      <span style="font-size:10px; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 6px; border-radius:6px;">📊 F2</span>
    `;
    this.cultureBadge.onclick = () => this.showAssetDiagnosticModal();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        this.showAssetDiagnosticModal();
      } else if (e.key === 'F3') {
        CultureComparisonViewer.openComparisonGallery();
      }
    });

    topLeft.appendChild(this.cultureBadge);
    topBar.appendChild(topLeft);

    // Top-Center: Resource Bar + Cultural Score
    const resourceBar = document.createElement('div');
    resourceBar.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 28px;
      padding: 6px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;

    // Culture Score
    this.cultureScoreText = document.createElement('div');
    this.cultureScoreText.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 800;
      color: #facc15;
    `;
    this.cultureScoreText.innerHTML = `<span>⭐</span> <span>${this.state.cultureScore}</span>`;
    resourceBar.appendChild(this.cultureScoreText);

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

    const resCoin = createResItem('🪙', this.state.coins);
    this.coinVal = resCoin.valSpan;
    const resWood = createResItem('🪵', this.state.inventory.wood);
    this.woodVal = resWood.valSpan;
    const resWheat = createResItem('🌾', this.state.inventory.grain);
    this.wheatVal = resWheat.valSpan;
    const resStone = createResItem('🪨', this.state.inventory.stone);
    this.stoneVal = resStone.valSpan;
    const resFlower = createResItem('🌸', this.state.inventory.fibre);
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

    // Quest Tracker Widget (Top-Left under Header)
    this.questTracker = document.createElement('div');
    this.questTracker.style.cssText = `
      position: absolute;
      top: 76px; left: 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 320px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      pointer-events: auto;
    `;
    this.container.appendChild(this.questTracker);

    // Mode Toggle Button (Floating Top-Right)
    this.modeToggleBtn = document.createElement('button');
    this.modeToggleBtn.style.cssText = `
      position: absolute;
      top: 76px; right: 24px;
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
    // 2. BOTTOM HAND DECK
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

    this.cardsRow = document.createElement('div');
    this.cardsRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    this.handBarContainer.appendChild(this.cardsRow);

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
    // 3. EXPLORATION MODE HUD
    // =========================================================================
    this.exploreObjective = document.createElement('div');
    this.exploreObjective.style.cssText = `
      position: absolute;
      top: 76px; left: 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 18px;
      padding: 12px 18px;
      display: none;
      flex-direction: column;
      gap: 4px;
      min-width: 240px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: auto;
    `;
    this.container.appendChild(this.exploreObjective);

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

    // =========================================================================
    // 4. HAAT INTER-STATE TRADING MODAL
    // =========================================================================
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
      width: 580px;
      max-width: 92vw;
      max-height: 85vh;
      overflow-y: auto;
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
                       tileDef.id.includes('haat') || tileDef.id.includes('bazaar') ? '🏪' : '🏡';

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
    const q = this.state.activeQuest;

    // 1. Clock & Phase update
    const phaseInfo = this.dayNight.getPhaseInfo();
    this.clockIcon.innerText = phaseInfo.symbol;
    this.clockTime.innerText = phaseInfo.phase === 'night' ? '8:47 PM' : (phaseInfo.phase === 'dusk' ? '6:15 PM' : '10:24 AM');

    // 2. Resource & Culture score counters
    this.coinVal.innerText = `${this.state.coins}`;
    this.woodVal.innerText = `${this.state.inventory.wood}`;
    this.wheatVal.innerText = `${this.state.inventory.grain}`;
    this.stoneVal.innerText = `${this.state.inventory.stone}`;
    this.flowerVal.innerText = `${this.state.inventory.fibre}`;
    this.cultureScoreText.innerHTML = `<span>⭐</span> <span>${this.state.cultureScore}</span>`;

    // 3. Stack Counter
    this.stackCounter.innerHTML = `<span>${this.state.refills * 3 + this.state.hand.length}</span>`;

    // 4. Quest Tracker Update
    this.questTracker.innerHTML = `
      <div style="font-size:10px; font-weight:800; color:#f59e0b; letter-spacing:0.5px;">🚩 CULTURAL QUEST</div>
      <div style="font-size:13px; font-weight:800; color:#fff;">${q.title}</div>
      <div style="font-size:11px; color:#cbd5e1; line-height:1.3;">${q.subtitle}</div>
      <div style="font-size:11px; font-weight:700; color:${q.completed ? '#4ade80' : '#38bdf8'}; margin-top:2px;">
        ${q.completed ? 'COMPLETED ✅' : `Progress: ${q.currentCount} / ${q.targetCount}`}
      </div>
    `;

    // 5. Mode-specific HUD Visibility
    if (mode === 'explore') {
      this.modeToggleBtn.innerHTML = `← Exit Character`;
      this.modeToggleBtn.style.background = 'linear-gradient(135deg, #475569, #334155)';
      this.handBarContainer.style.display = 'none';
      this.questTracker.style.display = 'none';
      this.exploreObjective.style.display = 'flex';
      this.wasdOverlay.style.display = 'flex';

      this.exploreObjective.innerHTML = `
        <div style="font-size:10px; font-weight:800; color:#f59e0b; letter-spacing:0.5px;">🚩 EXPLORATION OBJECTIVE</div>
        <div style="font-size:14px; font-weight:800; color:#fff;">${q.title}</div>
        <div style="font-size:11px; color:#cbd5e1;">${q.description}</div>
      `;

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
      this.questTracker.style.display = 'flex';
      this.exploreObjective.style.display = 'none';
      this.wasdOverlay.style.display = 'none';
      this.interactPrompt.style.display = 'none';
    }
  }

  public showHaatTradeModal(onClose: () => void): void {
    this.haatModal.style.display = 'flex';

    // Inter-state cultural exchange items from other states
    const states: IndianState[] = ['bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan'];
    const otherStates = states.filter(s => s !== this.state.selectedCulture);

    let tradesHtml = '';
    otherStates.forEach((st) => {
      const otherProf = CULTURE_PROFILES[st];
      const tradeItem = otherProf.crossTradeItems[0];
      if (tradeItem) {
        tradesHtml += `
          <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:800; font-size:13px; color:#facc15;">${otherProf.stateName} Merchant</div>
              <div style="font-size:12px; font-weight:700; color:#fff; margin-top:1px;">${tradeItem.name}</div>
              <div style="font-size:11px; color:#94a3b8; line-height:1.3;">${tradeItem.description}</div>
              <div style="font-size:10px; font-weight:700; color:#38bdf8; margin-top:3px;">Cost: ${tradeItem.requiredResource.amount}x ${tradeItem.requiredResource.kind} → +${tradeItem.costCoins} Coins, +${tradeItem.cultureBonus} Culture</div>
            </div>
            <button class="trade-cultural-btn" data-state="${st}" style="background:#f59e0b; color:#0f172a; border:none; border-radius:10px; padding:8px 16px; font-weight:800; font-size:12px; cursor:pointer;">Trade</button>
          </div>
        `;
      }
    });

    this.haatModal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:20px; font-weight:900; color:#f59e0b; margin:0; display:flex; gap:8px; align-items:center;">
            🏪 Haat Inter-State Cultural Exchange
          </h2>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Exchange goods with merchants from visiting Indian states</div>
        </div>
        <button id="close-haat-btn" style="background:transparent; border:none; color:#94a3b8; font-size:22px; cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
        ${tradesHtml}
      </div>
    `;

    document.getElementById('close-haat-btn')!.onclick = () => {
      this.haatModal.style.display = 'none';
      onClose();
    };

    // Attach trade listeners
    const buttons = this.haatModal.querySelectorAll('.trade-cultural-btn');
    buttons.forEach((btn) => {
      (btn as HTMLElement).onclick = (e) => {
        const targetSt = (e.currentTarget as HTMLElement).getAttribute('data-state') as IndianState;
        const otherProf = CULTURE_PROFILES[targetSt];
        const tradeItem = otherProf.crossTradeItems[0];
        if (tradeItem) {
          // Gujarat Specialist bonus: Skilled Exchange (+30% coins)
          const bonus = this.state.selectedCulture === 'gujarat' ? 1.3 : 1.0;
          const coinsEarned = Math.round(tradeItem.costCoins * bonus);

          this.state.coins += coinsEarned;
          this.state.cultureScore += tradeItem.cultureBonus;

          this.showFloatingReward(`+${coinsEarned} Coins & +${tradeItem.cultureBonus} Culture!`, window.innerWidth / 2, window.innerHeight / 2);

          // Advance quest if trade quest
          if (!this.state.activeQuest.completed && this.state.activeQuest.goalType === 'trade_haat') {
            this.state.activeQuest.currentCount++;
            if (this.state.activeQuest.currentCount >= this.state.activeQuest.targetCount) {
              this.state.completeActiveQuest();
            }
          }

          this.state.saveToStorage();
        }
        this.haatModal.style.display = 'none';
        onClose();
      };
    });
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

  public showAssetDiagnosticModal(): void {
    const existing = document.getElementById('ingame-asset-diagnostic-modal');
    if (existing) {
      existing.remove();
      return;
    }

    const report = CulturalAssetDiagnostics.getReport(this.state.selectedCulture);

    const modal = document.createElement('div');
    modal.id = 'ingame-asset-diagnostic-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-width: 90vw;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #38bdf8;
      border-radius: 16px;
      padding: 24px;
      z-index: 200;
      box-shadow: 0 24px 64px rgba(0,0,0,0.85);
      font-family: monospace;
      color: #38bdf8;
      pointer-events: auto;
    `;

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:15px; font-weight:800; color:#facc15;">LIVE ASSET VERIFICATION (F2)</span>
        <button id="close-ingame-diag-btn" style="background:transparent; border:none; color:#cbd5e1; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <pre style="white-space:pre-wrap; font-size:12px; line-height:1.45; background:rgba(0,0,0,0.6); padding:14px; border-radius:10px; max-height:420px; overflow-y:auto; margin:0;">${report}</pre>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-ingame-diag-btn') as HTMLElement;
    closeBtn.onclick = () => modal.remove();
  }
}
