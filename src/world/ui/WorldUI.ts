import { WorldState } from '../state/WorldState';
import { DayNightSystem } from '../graphics/DayNightSystem';
import { GameMode } from '../camera/CameraController';
import { InteractableTarget } from '../interaction/InteractionSystem';
import { TILE_LIBRARY } from '../data/tileLibrary';
import { CULTURE_PROFILES } from '../culture/CultureRegistry';
import { IndianState } from '../culture/CultureTypes';
import { CulturalAssetDiagnostics } from '../culture/CulturalAssetDiagnostics';
import { CultureComparisonViewer } from '../culture/CultureComparisonViewer';
import { WorldMapSystem, WorldMapDestination, WorldDestinationId } from '../travel/WorldMapSystem';
import { ISLAND_CROPS, MARKET_PRICES, CropType, CORE_TILE_METADATA } from '../farming/CropConfig';
import { CentralHaatSystem } from '../market/CentralHaatSystem';
import { AllianceRecord } from '../alliance/AllianceSystem';

export interface WorldUICallbacks {
  onTileSelect: (index: number) => void;
  onRotate: () => void;
  onModeToggle: () => void;
  onTravel?: (destId: WorldDestinationId, destName: string) => void;
  onRequestAlliance?: () => void;
  onAcceptAlliance?: (allianceId: string) => void;
  onDeclineAlliance?: (allianceId: string) => void;
}

export class WorldUI {
  private container: HTMLElement;
  private state: WorldState;
  private dayNight: DayNightSystem;
  private centralHaat: CentralHaatSystem;

  // Top Bar elements
  private dayText!: HTMLElement;
  private cultureBadge!: HTMLElement;
  private cultureScoreText!: HTMLElement;
  private coinVal!: HTMLElement;
  private clockWidget!: HTMLElement;
  private clockIcon!: HTMLElement;
  private clockTime!: HTMLElement;
  private cropBar!: HTMLElement;
  private alliancePill!: HTMLElement;
  private worldMapBtn!: HTMLElement;
  private centralHaatBtn!: HTMLElement;

  // Quest Tracker
  private questTracker!: HTMLElement;

  // Build Mode Hand Bar
  private handBarContainer!: HTMLElement;
  private cardsRow!: HTMLElement;
  private chancesCounter!: HTMLElement;
  private queueCounter!: HTMLElement;
  private modeToggleBtn!: HTMLElement;

  // Explore Mode HUD
  private exploreObjective!: HTMLElement;
  private wasdOverlay!: HTMLElement;
  private interactPrompt!: HTMLElement;

  // Modals
  private haatModal!: HTMLElement;
  private worldMapModal: HTMLElement | null = null;
  private centralHaatModal: HTMLElement | null = null;
  private allianceModal: HTMLElement | null = null;
  private timeModal: HTMLElement | null = null;
  public activeModal: 'none' | 'haat' | 'time' | 'diagnostics' | 'world_map' | 'central_haat' | 'alliance' = 'none';

  // Callbacks
  private callbacks: WorldUICallbacks = {
    onTileSelect: () => {},
    onRotate: () => {},
    onModeToggle: () => {}
  };

  constructor(state: WorldState, dayNight: DayNightSystem) {
    this.state = state;
    this.dayNight = dayNight;
    this.centralHaat = new CentralHaatSystem(state.cropInventory);

    this.container = document.createElement('div');
    this.container.id = 'world-ui-layer';
    this.container.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
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
      top: 14px; left: 20px; right: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      pointer-events: auto;
      flex-wrap: wrap;
    `;
    this.container.appendChild(topBar);

    // Top-Left: Island Title, Location & Specialist Pill
    const topLeft = document.createElement('div');
    topLeft.style.cssText = `display: flex; align-items: center; gap: 12px;`;

    const titleStack = document.createElement('div');
    titleStack.style.cssText = `display:flex; flex-direction:column; gap:2px;`;
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    `;
    title.innerText = 'ISLAND HAAT';
    this.dayText = document.createElement('div');
    this.dayText.style.cssText = `
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #94a3b8;
    `;
    this.dayText.innerText = 'DAY 3';
    titleStack.appendChild(title);
    titleStack.appendChild(this.dayText);
    topLeft.appendChild(titleStack);

    // Cultural Specialist Pill
    this.cultureBadge = document.createElement('div');
    this.cultureBadge.style.cssText = `
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      border: 1px solid ${profile.palette.primary};
      border-radius: 20px;
      padding: 5px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: transform 0.15s;
    `;
    this.cultureBadge.title = 'Click or press F2 to open Asset Diagnostics';
    this.updateCultureBadge();
    this.cultureBadge.onclick = () => this.showAssetDiagnosticModal();
    topLeft.appendChild(this.cultureBadge);

    // Supabase Online Status Badge
    const onlineIndicator = document.createElement('div');
    onlineIndicator.style.cssText = `
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 20px;
      padding: 5px 10px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 800;
      color: #38bdf8;
      cursor: pointer;
    `;
    onlineIndicator.innerHTML = `<span style="font-size:12px;">🌐</span> <span>Supabase Live</span>`;
    onlineIndicator.title = `Connected to Supabase Realtime • Room: ${this.state.multiplayer.roomId}`;
    onlineIndicator.onclick = () => {
      this.showFloatingReward(`🌐 Supabase Realtime Active (Room: ${this.state.multiplayer.roomId})`, window.innerWidth / 2, 120);
    };
    topLeft.appendChild(onlineIndicator);

    // Global Key Shortcuts (F2 / F3)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        this.showAssetDiagnosticModal();
      } else if (e.key === 'F3') {
        CultureComparisonViewer.openComparisonGallery();
      }
    });

    topBar.appendChild(topLeft);

    // Top-Center: Crop Storage & Coin Balance Bar
    this.cropBar = document.createElement('div');
    this.cropBar.style.cssText = `
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 26px;
      padding: 5px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;

    // Culture Score
    this.cultureScoreText = document.createElement('div');
    this.cultureScoreText.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 800;
      color: #facc15;
    `;
    this.cultureScoreText.innerHTML = `<span>⭐</span> <span>${this.state.cultureScore}</span>`;
    this.cropBar.appendChild(this.cultureScoreText);

    // Coins
    const coinPill = document.createElement('div');
    coinPill.style.cssText = `display:flex; align-items:center; gap:5px; font-size:12px; font-weight:800; color:#fbbf24;`;
    coinPill.innerHTML = `<span>🪙</span> <span id="ui-coin-val">${this.state.coins}</span>`;
    this.coinVal = coinPill.querySelector('#ui-coin-val') as HTMLElement;
    this.cropBar.appendChild(coinPill);

    // 6 Crop Storage Pills
    const cropKeys: CropType[] = ['rice', 'wheat', 'makhana', 'jute', 'cotton', 'bajra'];
    const cropEmojis: Record<CropType, string> = {
      rice: '🍚',
      wheat: '🌾',
      makhana: '⚪',
      jute: '🌿',
      cotton: '☁️',
      bajra: '🌾'
    };

    cropKeys.forEach((ck) => {
      const pill = document.createElement('div');
      pill.id = `crop-pill-${ck}`;
      pill.style.cssText = `
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 700;
        color: #e2e8f0;
      `;
      pill.innerHTML = `<span>${cropEmojis[ck]}</span> <span class="val">0</span>`;
      this.cropBar.appendChild(pill);
    });

    topBar.appendChild(this.cropBar);

    // Top-Right: World Navigation, Alliance, Haat, & Time Controls
    const topRight = document.createElement('div');
    topRight.style.cssText = `display: flex; align-items: center; gap: 8px;`;

    // 🗺️ World Map Button
    this.worldMapBtn = document.createElement('button');
    this.worldMapBtn.style.cssText = `
      background: linear-gradient(135deg, #0d9488, #0f766e);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(13, 148, 136, 0.4);
      transition: transform 0.15s;
    `;
    this.worldMapBtn.innerHTML = `🗺️ World Map`;
    this.worldMapBtn.onclick = () => this.showWorldMapModal();
    topRight.appendChild(this.worldMapBtn);

    // 🏪 Central Haat Button
    this.centralHaatBtn = document.createElement('button');
    this.centralHaatBtn.style.cssText = `
      background: linear-gradient(135deg, #d97706, #b45309);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(217, 119, 6, 0.4);
      transition: transform 0.15s;
    `;
    this.centralHaatBtn.innerHTML = `🏪 Market`;
    this.centralHaatBtn.onclick = () => this.showCentralHaatModal();
    topRight.appendChild(this.centralHaatBtn);

    // Alliance Status / Request Pill
    this.alliancePill = document.createElement('div');
    this.alliancePill.style.cssText = `
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 20px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
    `;
    this.alliancePill.onclick = () => this.handleAlliancePillClick();
    topRight.appendChild(this.alliancePill);

    // Day/Night Clock Widget
    this.clockWidget = document.createElement('div');
    this.clockWidget.style.cssText = `
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 24px;
      padding: 5px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    `;
    this.clockIcon = document.createElement('div');
    this.clockIcon.style.cssText = `font-size: 16px;`;
    this.clockIcon.innerText = '☀️';
    this.clockTime = document.createElement('div');
    this.clockTime.style.cssText = `font-size: 11px; font-weight: 800; color: #fde047;`;
    this.clockTime.innerText = '10:24 AM';
    this.clockWidget.appendChild(this.clockIcon);
    this.clockWidget.appendChild(this.clockTime);
    this.clockWidget.title = 'Click to open Time Settings';
    this.clockWidget.onclick = () => this.showTimeSettingsModal();
    topRight.appendChild(this.clockWidget);

    topBar.appendChild(topRight);

    // Quest Tracker Widget (Top-Left under Header)
    this.questTracker = document.createElement('div');
    this.questTracker.style.cssText = `
      position: absolute;
      top: 68px; left: 20px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 300px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      pointer-events: auto;
    `;
    this.container.appendChild(this.questTracker);

    // Mode Toggle Button (Floating Top-Right)
    this.modeToggleBtn = document.createElement('button');
    this.modeToggleBtn.style.cssText = `
      position: absolute;
      top: 68px; right: 20px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 22px;
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      padding: 8px 16px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(2, 132, 199, 0.4);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s, box-shadow 0.15s;
    `;
    this.modeToggleBtn.innerHTML = `🚶 Enter Island`;
    this.modeToggleBtn.onclick = () => this.callbacks.onModeToggle();
    this.container.appendChild(this.modeToggleBtn);

    // =========================================================================
    // 2. BOTTOM HAND DECK (Single Active Tile + Chances Tracker)
    // =========================================================================
    this.handBarContainer = document.createElement('div');
    this.handBarContainer.style.cssText = `
      position: absolute;
      bottom: 20px; left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
    `;
    this.container.appendChild(this.handBarContainer);

    // Placement chances & Queue count indicator row
    const counterRow = document.createElement('div');
    counterRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    this.chancesCounter = document.createElement('div');
    this.chancesCounter.style.cssText = `
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid #f59e0b;
      border-radius: 16px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 800;
      color: #fbbf24;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    `;
    this.chancesCounter.innerText = 'Chances: 9 (+0 Bonus)';
    counterRow.appendChild(this.chancesCounter);

    this.queueCounter = document.createElement('div');
    this.queueCounter.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
    `;
    this.queueCounter.innerText = '🎴 In Queue: 6';
    counterRow.appendChild(this.queueCounter);

    this.handBarContainer.appendChild(counterRow);

    // Single Active Tile Display
    this.cardsRow = document.createElement('div');
    this.cardsRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    this.handBarContainer.appendChild(this.cardsRow);

    // =========================================================================
    // 3. EXPLORATION MODE HUD
    // =========================================================================
    this.exploreObjective = document.createElement('div');
    this.exploreObjective.style.cssText = `
      position: absolute;
      top: 68px; left: 20px;
      background: rgba(15, 23, 42, 0.88);
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
      bottom: 28px; left: 28px;
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    `;
    this.wasdOverlay.innerHTML = `
      <div style="width:36px;height:36px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;">W</div>
      <div style="display:flex;gap:6px;">
        <div style="width:36px;height:36px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;">A</div>
        <div style="width:36px;height:36px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;">S</div>
        <div style="width:36px;height:36px;background:rgba(15,23,42,0.7);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;">D</div>
      </div>
      <div style="margin-top:2px;background:rgba(15,23,42,0.75);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:3px 10px;font-weight:800;font-size:10px;color:#38bdf8;letter-spacing:0.5px;">
        SPACE: JUMP
      </div>
    `;
    this.container.appendChild(this.wasdOverlay);

    this.interactPrompt = document.createElement('div');
    this.interactPrompt.style.cssText = `
      position: absolute;
      bottom: 24%; left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(10px);
      border: 2px solid #f59e0b;
      border-radius: 30px;
      padding: 10px 24px;
      font-size: 14px;
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

    // Legacy Haat Modal Container
    this.haatModal = document.createElement('div');
    this.haatModal.style.cssText = `display:none;`;
    this.container.appendChild(this.haatModal);
  }

  public setCallbacks(opts: WorldUICallbacks): void {
    this.callbacks = { ...this.callbacks, ...opts };
  }

  private updateCultureBadge(): void {
    const loc = this.state.currentLocation;
    if (loc === 'central_haat') {
      this.cultureBadge.innerHTML = `
        <span style="font-size:13px; font-weight:800; color:#fbbf24;">🏪 Central Haat</span>
        <span style="font-size:11px; color:#cbd5e1;">| Crossroads Marketplace</span>
      `;
    } else {
      const profile = CULTURE_PROFILES[loc as IndianState];
      const isHome = loc === this.state.selectedCulture;
      this.cultureBadge.innerHTML = `
        <span style="font-size:13px; font-weight:800; color:${profile.palette.primary};">${profile.stateName}</span>
        <span style="font-size:11px; color:#cbd5e1;">${isHome ? '(Your Island)' : '(Visiting)'}</span>
        <span style="font-size:11px; font-weight:800; color:#4ade80;">⚡ ${profile.specialist.abilityName}</span>
      `;
    }
  }

  public renderHand(): void {
    this.cardsRow.innerHTML = '';
    const activeTile = this.state.tileInventory.getActiveTile();
    const chancesTotal = this.state.tileInventory.getTotalPlacementChances();

    // Update Chance & Queue Counters
    this.chancesCounter.innerText = `Chances: ${this.state.tileInventory.getInitialPlacementChances()} (+${this.state.tileInventory.getBonusPlacementChances()} Bonus)`;
    this.queueCounter.innerText = `🎴 In Queue: ${Math.max(0, this.state.tileInventory.getRemainingTileCount() - 1)}`;

    if (chancesTotal <= 0 || !activeTile) {
      const emptyNotice = document.createElement('div');
      emptyNotice.style.cssText = `
        background: rgba(15, 23, 42, 0.9);
        border: 2px dashed #f59e0b;
        border-radius: 18px;
        padding: 12px 20px;
        text-align: center;
        max-width: 320px;
      `;
      emptyNotice.innerHTML = `
        <div style="font-weight:900; font-size:13px; color:#fbbf24;">No Placement Chances Left</div>
        <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">Connect 3 Farmland tiles on your island to form working farms and unlock bonus chances!</div>
      `;
      this.cardsRow.appendChild(emptyNotice);
      return;
    }

    const meta = CORE_TILE_METADATA[activeTile] || {
      name: activeTile,
      emoji: '🌾',
      description: 'Active placement tile.'
    };

    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(180deg, #1e293b, #0f172a);
      border: 3px solid #facc15;
      border-radius: 20px;
      padding: 10px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      min-width: 130px;
      transform: translateY(-8px) scale(1.04);
      box-shadow: 0 12px 32px rgba(250, 204, 21, 0.45);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    `;

    card.innerHTML = `
      <div style="font-size: 10px; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">ACTIVE TILE (READY)</div>
      <div style="font-size: 32px; line-height: 1.1;">${meta.emoji}</div>
      <div style="font-size: 13px; font-weight: 800; color: #fff;">${meta.name}</div>
      <div style="font-size: 10px; font-weight: 700; color: #fbbf24; background: rgba(250,204,21,0.15); padding: 2px 8px; border-radius: 8px;">
        Click to Rotate (R)
      </div>
    `;

    card.onclick = () => {
      this.callbacks.onRotate();
    };

    this.cardsRow.appendChild(card);
  }

  public update(mode: GameMode, interactTarget: InteractableTarget | null): void {
    const q = this.state.activeQuest;

    // 1. Clock & Phase update
    const phaseInfo = this.dayNight.getPhaseInfo();
    this.clockIcon.innerText = phaseInfo.symbol;
    this.clockTime.innerText = `${phaseInfo.timeString}${this.dayNight.isFrozen ? ' ⏸' : ''}`;

    // 2. Crop Storage counters & Coin balance
    this.coinVal.innerText = `${this.state.cropInventory.getCoins()}`;
    this.cultureScoreText.innerHTML = `<span>⭐</span> <span>${this.state.cultureScore}</span>`;

    const cropKeys: CropType[] = ['rice', 'wheat', 'makhana', 'jute', 'cotton', 'bajra'];
    cropKeys.forEach((ck) => {
      const pill = this.cropBar.querySelector(`#crop-pill-${ck} .val`) as HTMLElement;
      if (pill) {
        pill.innerText = `${this.state.cropInventory.getCropQuantity(ck)}`;
      }
    });

    // 3. Quest Tracker Update
    this.questTracker.innerHTML = `
      <div style="font-size:10px; font-weight:800; color:#f59e0b; letter-spacing:0.5px;">🚩 CULTURAL QUEST</div>
      <div style="font-size:12px; font-weight:800; color:#fff;">${q.title}</div>
      <div style="font-size:11px; color:#cbd5e1; line-height:1.2;">${q.subtitle}</div>
      <div style="font-size:11px; font-weight:700; color:${q.completed ? '#4ade80' : '#38bdf8'}; margin-top:2px;">
        ${q.completed ? 'COMPLETED ✅' : `Progress: ${q.currentCount} / ${q.targetCount}`}
      </div>
    `;

    // 4. Alliance Pill Update
    this.updateAlliancePill();

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
        <div style="font-size:13px; font-weight:800; color:#fff;">${q.title}</div>
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

  private updateAlliancePill(): void {
    const loc = this.state.currentLocation;
    const isHome = loc === this.state.selectedCulture;

    if (loc === 'central_haat') {
      this.alliancePill.style.display = 'none';
      return;
    }

    this.alliancePill.style.display = 'flex';

    if (isHome) {
      // Host: Show any pending alliance requests from visitors
      const pending = this.state.alliances.getPendingRequestsForHost(this.state.multiplayer.localPlayerId);
      if (pending.length > 0) {
        this.alliancePill.style.borderColor = '#f59e0b';
        this.alliancePill.style.color = '#fbbf24';
        this.alliancePill.innerHTML = `<span>🤝</span> <span>${pending.length} Request${pending.length > 1 ? 's' : ''}!</span>`;
      } else {
        this.alliancePill.style.borderColor = 'rgba(255,255,255,0.18)';
        this.alliancePill.style.color = '#94a3b8';
        this.alliancePill.innerHTML = `<span>🤝</span> <span>Alliances</span>`;
      }
    } else {
      // Visitor: Check active alliance status
      const status = this.state.alliances.hasActiveAlliance(this.state.multiplayer.localPlayerId, loc as IndianState);
      if (status.hasPermission) {
        const mins = Math.floor(status.secondsRemaining / 60);
        const secs = (status.secondsRemaining % 60).toString().padStart(2, '0');
        this.alliancePill.style.borderColor = '#4ade80';
        this.alliancePill.style.color = '#4ade80';
        this.alliancePill.innerHTML = `<span>🤝</span> <span>Alliance: ${mins}:${secs}</span>`;
      } else {
        this.alliancePill.style.borderColor = '#38bdf8';
        this.alliancePill.style.color = '#38bdf8';
        this.alliancePill.innerHTML = `<span>🤝</span> <span>Request Alliance</span>`;
      }
    }
  }

  private handleAlliancePillClick(): void {
    const loc = this.state.currentLocation;
    if (loc === 'central_haat') return;

    if (loc === this.state.selectedCulture) {
      // Host: Show pending requests
      const pending = this.state.alliances.getPendingRequestsForHost(this.state.multiplayer.localPlayerId);
      if (pending.length > 0) {
        this.showHostAllianceRequestModal(pending[0]);
      } else {
        this.showFloatingReward('No pending alliance requests on your island.', window.innerWidth / 2, 120);
      }
    } else {
      // Visitor: Request alliance or show active remaining time
      const status = this.state.alliances.hasActiveAlliance(this.state.multiplayer.localPlayerId, loc as IndianState);
      if (status.hasPermission) {
        this.showFloatingReward(`Active alliance: ${status.secondsRemaining}s remaining.`, window.innerWidth / 2, 120);
      } else {
        this.requestAllianceOnCurrentIsland();
      }
    }
  }

  public requestAllianceOnCurrentIsland(): void {
    const loc = this.state.currentLocation;
    if (loc === 'central_haat' || loc === this.state.selectedCulture) return;

    const owners = this.state.multiplayer.getIslandOwners();
    const owner = owners.get(loc as IndianState);
    const hostId = owner?.playerId || 'host_ai';
    const hostName = owner?.playerName || `${CULTURE_PROFILES[loc as IndianState].stateName} Host`;

    const rec = this.state.alliances.requestAlliance(
      this.state.multiplayer.localPlayerId,
      this.state.multiplayer.localPlayerName,
      hostId,
      hostName,
      loc as IndianState
    );

    // Broadcast alliance request over multiplayer room
    this.state.multiplayer.notifyAllianceRequest(rec);

    this.showFloatingReward(`🤝 Alliance request sent to ${hostName}!`, window.innerWidth / 2, 120);
  }

  public showHostAllianceRequestModal(alliance: AllianceRecord): void {
    if (this.allianceModal) {
      this.allianceModal.remove();
    }

    this.activeModal = 'alliance';
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(18px);
      border: 2px solid #f59e0b;
      border-radius: 20px;
      padding: 24px 28px;
      width: 440px;
      max-width: 90vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.8);
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 14px;
      pointer-events: auto;
      z-index: 250;
    `;

    modal.innerHTML = `
      <div style="font-size:18px; font-weight:900; color:#fbbf24; display:flex; gap:8px; align-items:center;">
        🤝 Alliance Request Received
      </div>
      <div style="font-size:13px; color:#cbd5e1; line-height:1.4;">
        <strong>${alliance.visitorName}</strong> wants to establish an alliance on your island!
      </div>
      <div style="background:rgba(255,255,255,0.06); padding:12px; border-radius:12px; font-size:12px; color:#94a3b8; line-height:1.4;">
        • Grants 180 seconds of temporary building & farming permissions.<br>
        • Harvested crops from completed farms are shared.<br>
        • Your original island ownership remains protected.
      </div>
      <div style="display:flex; gap:10px; margin-top:8px;">
        <button id="alliance-accept-btn" style="flex:1; background:#16a34a; border:none; border-radius:10px; color:#fff; font-weight:800; font-size:13px; padding:10px; cursor:pointer;">
          Accept Alliance (180s)
        </button>
        <button id="alliance-decline-btn" style="flex:1; background:#475569; border:none; border-radius:10px; color:#fff; font-weight:800; font-size:13px; padding:10px; cursor:pointer;">
          Decline
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    this.allianceModal = modal;

    modal.querySelector('#alliance-accept-btn')!.addEventListener('click', () => {
      const accepted = this.state.alliances.acceptAlliance(alliance.id);
      if (accepted && accepted.expiresAt) {
        this.state.multiplayer.notifyAllianceAccepted(alliance.id, accepted.expiresAt);
        this.showFloatingReward(`🤝 Alliance with ${alliance.visitorName} is now ACTIVE!`, window.innerWidth / 2, 120);
      }
      modal.remove();
      this.allianceModal = null;
      this.activeModal = 'none';
    });

    modal.querySelector('#alliance-decline-btn')!.addEventListener('click', () => {
      this.state.alliances.declineAlliance(alliance.id);
      this.state.multiplayer.notifyAllianceDeclined(alliance.id);
      modal.remove();
      this.allianceModal = null;
      this.activeModal = 'none';
    });
  }

  // =========================================================================
  // 4. SHARED WORLD MAP MODAL (Archipelago Navigation)
  // =========================================================================
  public showWorldMapModal(): void {
    if (this.worldMapModal) {
      this.worldMapModal.remove();
      this.worldMapModal = null;
      this.activeModal = 'none';
      return;
    }

    this.activeModal = 'world_map';
    const modal = document.createElement('div');
    modal.id = 'world-map-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 740px;
      max-width: 94vw;
      background: rgba(15, 23, 42, 0.97);
      backdrop-filter: blur(20px);
      border: 2px solid #0d9488;
      border-radius: 24px;
      padding: 24px 30px;
      z-index: 200;
      box-shadow: 0 24px 64px rgba(0,0,0,0.85);
      color: #fff;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    const destinations = WorldMapSystem.getDestinations(
      this.state.currentLocation,
      this.state.selectedCulture,
      this.state.multiplayer.getIslandOwners()
    );

    let cardsHtml = '';
    destinations.forEach((dest) => {
      const isCurrent = dest.isCurrentLocation;
      const canSail = dest.isAccessible && !isCurrent;

      cardsHtml += `
        <div style="background:rgba(255,255,255,0.06); border:1px solid ${isCurrent ? '#facc15' : 'rgba(255,255,255,0.12)'}; border-radius:14px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:28px;">${dest.emoji}</div>
            <div>
              <div style="font-size:14px; font-weight:900; color:${isCurrent ? '#facc15' : '#fff'};">
                ${dest.name} ${isCurrent ? '<span style="font-size:10px; background:#facc15; color:#0f172a; padding:2px 6px; border-radius:6px; margin-left:4px;">YOU ARE HERE</span>' : ''}
              </div>
              <div style="font-size:11px; color:#94a3b8;">${dest.region} • Crop: <span style="color:#38bdf8;">${dest.cropDisplayName}</span></div>
              <div style="font-size:10px; color:${dest.isHomeIsland ? '#4ade80' : dest.ownerName ? '#a78bfa' : '#94a3b8'}; margin-top:2px;">
                Owner: ${dest.ownerName || 'Uninhabited'}
              </div>
            </div>
          </div>
          <div>
            ${
              isCurrent
                ? `<span style="font-size:12px; font-weight:800; color:#94a3b8;">Current Dock</span>`
                : canSail
                ? `<button class="sail-dest-btn" data-dest="${dest.id}" data-name="${dest.name}" style="background:#0d9488; color:#fff; border:none; border-radius:10px; padding:8px 16px; font-weight:800; font-size:12px; cursor:pointer; box-shadow:0 4px 12px rgba(13,148,136,0.4);">⛵ Sail Here (Free)</button>`
                : `<span style="font-size:11px; font-weight:700; color:#64748b; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:6px;">Locked (v1)</span>`
            }
          </div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:20px; font-weight:900; color:#2dd4bf; margin:0; display:flex; gap:8px; align-items:center;">
            🗺️ Indian Archipelago World Map
          </h2>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Sail freely between cultural islands and the Central Haat marketplace.</div>
        </div>
        <button id="close-world-map-btn" style="background:transparent; border:none; color:#cbd5e1; font-size:22px; cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; max-height:480px; overflow-y:auto; padding-right:4px;">
        ${cardsHtml}
      </div>
    `;

    document.body.appendChild(modal);
    this.worldMapModal = modal;

    modal.querySelector('#close-world-map-btn')!.addEventListener('click', () => {
      modal.remove();
      this.worldMapModal = null;
      this.activeModal = 'none';
    });

    const sailBtns = modal.querySelectorAll('.sail-dest-btn');
    sailBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const destId = (e.currentTarget as HTMLElement).getAttribute('data-dest') as WorldDestinationId;
        const destName = (e.currentTarget as HTMLElement).getAttribute('data-name') || destId;
        modal.remove();
        this.worldMapModal = null;
        this.activeModal = 'none';
        this.callbacks.onTravel?.(destId, destName);
        this.updateCultureBadge();
      });
    });
  }

  // =========================================================================
  // 5. SHARED CENTRAL HAAT MARKETPLACE MODAL (Crop Sales & Currency)
  // =========================================================================
  public showCentralHaatModal(): void {
    if (this.centralHaatModal) {
      this.centralHaatModal.remove();
      this.centralHaatModal = null;
      this.activeModal = 'none';
      return;
    }

    this.activeModal = 'central_haat';
    const modal = document.createElement('div');
    modal.id = 'central-haat-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 680px;
      max-width: 92vw;
      background: rgba(15, 23, 42, 0.97);
      backdrop-filter: blur(20px);
      border: 2px solid #d97706;
      border-radius: 24px;
      padding: 24px 30px;
      z-index: 200;
      box-shadow: 0 24px 64px rgba(0,0,0,0.85);
      color: #fff;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    const cropKeys: CropType[] = ['rice', 'wheat', 'makhana', 'jute', 'cotton', 'bajra'];
    let rowsHtml = '';

    cropKeys.forEach((ck) => {
      const info = Object.values(ISLAND_CROPS).find((c) => c.crop === ck)!;
      const count = this.state.cropInventory.getCropQuantity(ck);
      const unitPrice = MARKET_PRICES[ck];

      rowsHtml += `
        <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:28px;">${info.emoji}</div>
            <div>
              <div style="font-size:14px; font-weight:900; color:#fff;">${info.displayName}</div>
              <div style="font-size:11px; color:#94a3b8;">In Storage: <strong style="color:#facc15;">${count}</strong> • Central Price: <strong style="color:#4ade80;">${unitPrice} Coins</strong> each</div>
            </div>
          </div>
          <div>
            ${
              count > 0
                ? `<button class="sell-crop-btn" data-crop="${ck}" data-count="${count}" style="background:#d97706; color:#fff; border:none; border-radius:10px; padding:8px 16px; font-weight:800; font-size:12px; cursor:pointer; box-shadow:0 4px 12px rgba(217,119,6,0.4);">Sell All (${count * unitPrice} Coins)</button>`
                : `<span style="font-size:11px; font-weight:700; color:#64748b;">No Stock</span>`
            }
          </div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:20px; font-weight:900; color:#f59e0b; margin:0; display:flex; gap:8px; align-items:center;">
            🏪 Central Haat Grand Marketplace
          </h2>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">
            Current Balance: <strong style="color:#fbbf24;">${this.state.cropInventory.getCoins()} Coins</strong> • Stored crops are protected until sold.
          </div>
        </div>
        <button id="close-central-haat-btn" style="background:transparent; border:none; color:#cbd5e1; font-size:22px; cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height:450px; overflow-y:auto; padding-right:4px;">
        ${rowsHtml}
      </div>
    `;

    document.body.appendChild(modal);
    this.centralHaatModal = modal;

    modal.querySelector('#close-central-haat-btn')!.addEventListener('click', () => {
      modal.remove();
      this.centralHaatModal = null;
      this.activeModal = 'none';
    });

    const sellBtns = modal.querySelectorAll('.sell-crop-btn');
    sellBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const crop = (e.currentTarget as HTMLElement).getAttribute('data-crop') as CropType;
        const count = parseInt((e.currentTarget as HTMLElement).getAttribute('data-count') || '0', 10);

        const res = this.centralHaat.executeCropSale(crop, count);
        if (res.success) {
          this.state.coins = res.newCoinBalance;
          this.coinVal.innerText = `${this.state.coins}`;
          this.showFloatingReward(`+${res.coinsEarned} Coins from Central Haat!`, window.innerWidth / 2, window.innerHeight / 2);
          modal.remove();
          this.centralHaatModal = null;
          this.activeModal = 'none';
          this.state.saveToStorage();
        } else {
          this.showFloatingReward(res.error || 'Sale failed', window.innerWidth / 2, window.innerHeight / 2);
        }
      });
    });
  }

  // =========================================================================
  // 6. FARM COMPLETION CELEBRATION BANNER
  // =========================================================================
  public showFarmCompletedBanner(cropName: string, cropEmoji: string): void {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 60px; left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
      border: 2px solid #facc15;
      border-radius: 20px;
      padding: 14px 28px;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 16px 48px rgba(250, 204, 21, 0.45);
      z-index: 1000;
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    `;

    banner.innerHTML = `
      <div style="font-size: 13px; font-weight: 900; color: #fbbf24; letter-spacing: 1px;">
        🌾 3-TILE FARM ESTABLISHED!
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #fff;">
        Harvested: +3 ${cropName} ${cropEmoji}
      </div>
      <div style="font-size: 11px; font-weight: 700; color: #4ade80;">
        +1 Bonus Random Tile & +1 Placement Chance Awarded!
      </div>
    `;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.style.transform = 'translateX(-50%) translateY(0)';
      banner.style.opacity = '1';
    });

    setTimeout(() => {
      banner.style.transform = 'translateX(-50%) translateY(-20px)';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 600);
    }, 3800);
  }

  public showFloatingReward(text: string, x: number, y: number): void {
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      left: ${x}px; top: ${y}px;
      transform: translate(-50%, -50%);
      font-size: 20px;
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
      el.style.top = `${y - 50}px`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 850);
  }

  public showTimeSettingsModal(): void {
    if (this.timeModal) {
      this.timeModal.remove();
      this.timeModal = null;
      this.activeModal = 'none';
      return;
    }

    this.activeModal = 'time';
    const modal = document.createElement('div');
    modal.id = 'time-settings-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 440px;
      max-width: 90vw;
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(18px);
      border: 2px solid #f59e0b;
      border-radius: 20px;
      padding: 24px 28px;
      z-index: 150;
      box-shadow: 0 24px 64px rgba(0,0,0,0.85);
      color: #fff;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    const phase = this.dayNight.getPhaseInfo();

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="margin:0; font-size:18px; font-weight:900; color:#facc15; display:flex; gap:8px; align-items:center;">
            ⏰ Time & Day-Night Controls
          </h3>
          <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Current: <span id="time-dialog-current" style="color:#fde047; font-weight:800;">${phase.timeString} (${phase.label})</span></div>
        </div>
        <button id="close-time-modal-btn" style="background:transparent; border:none; color:#cbd5e1; font-size:20px; cursor:pointer;">✕</button>
      </div>

      <div style="background:rgba(255,255,255,0.06); padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:10px;">
        <div style="font-size:12px; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">1. TIME CYCLE PROGRESSION</div>
        <div style="display:flex; gap:8px;">
          <button id="time-freeze-toggle-btn" style="flex:1; background:${this.dayNight.isFrozen ? '#dc2626' : '#16a34a'}; border:none; border-radius:10px; color:#fff; font-weight:800; font-size:12px; padding:10px; cursor:pointer;">
            ${this.dayNight.isFrozen ? '▶ Resume Cycle' : '⏸ Hold / Freeze Time'}
          </button>
        </div>
        <div style="display:flex; gap:6px; align-items:center; margin-top:4px;">
          <span style="font-size:11px; color:#94a3b8; font-weight:700;">Speed:</span>
          <button class="time-speed-btn" data-speed="slow" style="flex:1; background:${this.dayNight.cycleSpeed === 'slow' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; color:${this.dayNight.cycleSpeed === 'slow' ? '#0f172a' : '#fff'}; border:none; border-radius:8px; padding:6px; font-weight:800; font-size:11px; cursor:pointer;">Slow (40m)</button>
          <button class="time-speed-btn" data-speed="normal" style="flex:1; background:${this.dayNight.cycleSpeed === 'normal' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; color:${this.dayNight.cycleSpeed === 'normal' ? '#0f172a' : '#fff'}; border:none; border-radius:8px; padding:6px; font-weight:800; font-size:11px; cursor:pointer;">Normal (20m)</button>
          <button class="time-speed-btn" data-speed="fast" style="flex:1; background:${this.dayNight.cycleSpeed === 'fast' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; color:${this.dayNight.cycleSpeed === 'fast' ? '#0f172a' : '#fff'}; border:none; border-radius:8px; padding:6px; font-weight:800; font-size:11px; cursor:pointer;">Fast (5m)</button>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.06); padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:10px;">
        <div style="font-size:12px; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">2. SET EXACT TIME OF DAY</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
          <button class="time-preset-btn" data-h="6" data-m="30" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:8px; font-weight:800; font-size:12px; color:#fff; cursor:pointer;">🌅 06:30 AM (Dawn)</button>
          <button class="time-preset-btn" data-h="12" data-m="0" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:8px; font-weight:800; font-size:12px; color:#fff; cursor:pointer;">☀️ 12:00 PM (Noon)</button>
          <button class="time-preset-btn" data-h="17" data-m="45" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:8px; font-weight:800; font-size:12px; color:#fff; cursor:pointer;">🌄 05:45 PM (Dusk)</button>
          <button class="time-preset-btn" data-h="21" data-m="0" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:8px; font-weight:800; font-size:12px; color:#fff; cursor:pointer;">🌙 09:00 PM (Night)</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.timeModal = modal;

    const closeBtn = modal.querySelector('#close-time-modal-btn') as HTMLElement;
    closeBtn.onclick = () => {
      modal.remove();
      this.timeModal = null;
      this.activeModal = 'none';
    };

    const freezeBtn = modal.querySelector('#time-freeze-toggle-btn') as HTMLElement;
    freezeBtn.onclick = () => {
      const isFrozen = this.dayNight.toggleFreeze();
      freezeBtn.style.background = isFrozen ? '#dc2626' : '#16a34a';
      freezeBtn.innerText = isFrozen ? '▶ Resume Cycle' : '⏸ Hold / Freeze Time';
    };

    const speedBtns = modal.querySelectorAll('.time-speed-btn');
    speedBtns.forEach((btn) => {
      (btn as HTMLElement).onclick = (e) => {
        const speed = (e.currentTarget as HTMLElement).getAttribute('data-speed') as any;
        this.dayNight.setSpeed(speed);
        speedBtns.forEach((b) => {
          (b as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
          (b as HTMLElement).style.color = '#fff';
        });
        (btn as HTMLElement).style.background = '#f59e0b';
        (btn as HTMLElement).style.color = '#0f172a';
      };
    });

    const presetBtns = modal.querySelectorAll('.time-preset-btn');
    presetBtns.forEach((btn) => {
      (btn as HTMLElement).onclick = (e) => {
        const el = e.currentTarget as HTMLElement;
        const h = parseInt(el.getAttribute('data-h') || '12', 10);
        const m = parseInt(el.getAttribute('data-m') || '0', 10);
        this.dayNight.setExactTime(h, m);
        const cur = modal.querySelector('#time-dialog-current') as HTMLElement;
        const newPhase = this.dayNight.getPhaseInfo();
        if (cur) cur.innerText = `${newPhase.timeString} (${newPhase.label})`;
        this.showFloatingReward(`Time set to ${newPhase.timeString}`, window.innerWidth / 2, window.innerHeight / 2);
      };
    });
  }

  public showAssetDiagnosticModal(): void {
    const existing = document.getElementById('ingame-asset-diagnostic-modal');
    if (existing) {
      existing.remove();
      this.activeModal = 'none';
      return;
    }

    this.activeModal = 'diagnostics';
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
    closeBtn.onclick = () => {
      modal.remove();
      this.activeModal = 'none';
    };
  }

  public destroy(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    const diagModal = document.getElementById('ingame-asset-diagnostic-modal');
    if (diagModal) diagModal.remove();
    if (this.timeModal) this.timeModal.remove();
    if (this.worldMapModal) this.worldMapModal.remove();
    if (this.centralHaatModal) this.centralHaatModal.remove();
    if (this.allianceModal) this.allianceModal.remove();
    this.activeModal = 'none';
  }
}
