import { IntroMusic } from '../audio/IntroMusic';
import { LobbyService } from '../multiplayer/LobbyService';
import { ServerRoom } from '../multiplayer/MultiplayerTypes';
import { IndianState } from '../culture/CultureTypes';
import { CULTURE_PROFILES } from '../culture/CultureRegistry';
import { ISLAND_CROPS } from '../farming/CropConfig';

export class MultiplayerLobbyScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private music = IntroMusic.get();
  private lobbyService = LobbyService.get();
  private room: ServerRoom;

  private cultureCardsContainer!: HTMLElement;
  private playerListContainer!: HTMLElement;
  private startBtn!: HTMLButtonElement;
  private readyBtn!: HTMLButtonElement;
  private hostStatusText!: HTMLElement;
  private headerInfoEl!: HTMLElement;

  private onGameStartCallback?: (room: ServerRoom, chosenCulture: IndianState) => void;
  private onLeaveCallback?: () => void;

  constructor(container: HTMLElement, initialRoom: ServerRoom) {
    this.container = container;
    this.room = initialRoom;

    this.root = document.createElement('div');
    this.root.id = 'multiplayer-lobby-root';
    this.root.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100vw; height: 100vh;
      overflow-y: auto;
      background: radial-gradient(circle at 50% 25%, #1e293b 0%, #0f172a 60%, #080d16 100%);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      user-select: none;
      z-index: 25;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
      box-sizing: border-box;
      color: #fff;
    `;
    this.container.appendChild(this.root);

    this.buildUI();
    this.setupLobbyListeners();
  }

  public setCallbacks(opts: {
    onGameStart: (room: ServerRoom, chosenCulture: IndianState) => void;
    onLeave: () => void;
  }): void {
    this.onGameStartCallback = opts.onGameStart;
    this.onLeaveCallback = opts.onLeave;
  }

  private setupLobbyListeners(): void {
    this.lobbyService.onLobbyUpdated = (updatedRoom) => {
      this.room = updatedRoom;
      this.renderAll();
    };

    this.lobbyService.onGameStarted = (startedRoom) => {
      this.room = startedRoom;
      const myMember = this.room.members.find(m => m.playerId === this.lobbyService.getLocalPlayerId());
      const myCulture = myMember?.culture || 'bihar';
      this.onGameStartCallback?.(this.room, myCulture);
    };

    this.lobbyService.onServerClosed = (reason) => {
      alert(reason);
      this.onLeaveCallback?.();
    };
  }

  private buildUI(): void {
    const mainBox = document.createElement('div');
    mainBox.style.cssText = `
      width: 980px;
      max-width: 95vw;
      display: flex;
      flex-direction: column;
      gap: 24px;
      animation: fadeIn 0.3s ease-out;
    `;
    this.root.appendChild(mainBox);

    // Top Navigation & Server Info Header
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 20px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 12px 32px rgba(0,0,0,0.4);
    `;
    mainBox.appendChild(topBar);

    this.headerInfoEl = document.createElement('div');
    topBar.appendChild(this.headerInfoEl);

    // Right Actions (Copy Code & Leave)
    const rightActions = document.createElement('div');
    rightActions.style.cssText = 'display:flex; align-items:center; gap:12px;';
    topBar.appendChild(rightActions);

    const copyCodeBtn = document.createElement('button');
    copyCodeBtn.id = 'copy-invite-code-btn';
    copyCodeBtn.style.cssText = `
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.6);
      border-radius: 12px;
      color: #fef08a;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    `;
    copyCodeBtn.innerHTML = `<span>📋</span> Copy Code (<strong style="color:#fff;">${this.room.code}</strong>)`;
    copyCodeBtn.onclick = () => {
      this.music.playButtonClick();
      navigator.clipboard.writeText(this.room.code);
      copyCodeBtn.innerHTML = `<span>✅</span> Copied!`;
      setTimeout(() => {
        copyCodeBtn.innerHTML = `<span>📋</span> Copy Code (<strong style="color:#fff;">${this.room.code}</strong>)`;
      }, 2000);
    };
    rightActions.appendChild(copyCodeBtn);

    const leaveBtn = document.createElement('button');
    leaveBtn.style.cssText = `
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 12px;
      color: #fca5a5;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    `;
    leaveBtn.textContent = 'Leave Server';
    leaveBtn.onclick = () => {
      this.music.playButtonClick();
      if (confirm('Are you sure you want to leave this server lobby?')) {
        this.lobbyService.leaveServer();
        this.onLeaveCallback?.();
      }
    };
    rightActions.appendChild(leaveBtn);

    // Section 1: Culture Selection Cards Grid
    const cultureSection = document.createElement('div');
    cultureSection.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
        <h3 style="font-size:20px; font-weight:800; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
          <span>🦚</span> Reserve Your Cultural Island
        </h3>
        <span style="font-size:12px; color:#94a3b8;">Rule: Each player must choose a unique culture. Exactly 1 per server.</span>
      </div>
    `;
    mainBox.appendChild(cultureSection);

    this.cultureCardsContainer = document.createElement('div');
    this.cultureCardsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    `;
    cultureSection.appendChild(this.cultureCardsContainer);

    // Section 2: Player Roster & Ready Section
    const rosterSection = document.createElement('div');
    rosterSection.style.cssText = `
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.4);
    `;
    mainBox.appendChild(rosterSection);

    const rosterHeader = document.createElement('div');
    rosterHeader.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
    rosterHeader.innerHTML = `
      <h3 style="font-size:18px; font-weight:800; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
        <span>👥</span> Connected Adventurers
      </h3>
    `;
    rosterSection.appendChild(rosterHeader);

    this.playerListContainer = document.createElement('div');
    this.playerListContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    `;
    rosterSection.appendChild(this.playerListContainer);

    // Bottom Controls Bar (Ready Toggle & Host Start Game)
    const bottomControls = document.createElement('div');
    bottomControls.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 20px;
      margin-top: 8px;
    `;
    rosterSection.appendChild(bottomControls);

    // Local Ready Toggle Button
    this.readyBtn = document.createElement('button');
    this.readyBtn.style.cssText = `
      padding: 12px 28px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    `;
    this.readyBtn.onclick = () => {
      this.music.playButtonClick();
      const res = this.lobbyService.toggleReady();
      if (!res.success) {
        alert(res.reason || 'Cannot ready up yet.');
      }
    };
    bottomControls.appendChild(this.readyBtn);

    // Host Start Button & Status
    const hostControlsWrapper = document.createElement('div');
    hostControlsWrapper.style.cssText = 'display:flex; flex-direction:column; align-items:flex-end; gap:6px;';
    bottomControls.appendChild(hostControlsWrapper);

    this.startBtn = document.createElement('button');
    this.startBtn.style.cssText = `
      padding: 14px 36px;
      border-radius: 14px;
      border: none;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.15s ease;
    `;
    this.startBtn.textContent = '🚀 Start Shared World →';
    this.startBtn.onclick = () => {
      this.music.playButtonClick();
      const res = this.lobbyService.startGame();
      if (!res.success) {
        alert(res.reason || 'Cannot start game.');
      }
    };
    hostControlsWrapper.appendChild(this.startBtn);

    this.hostStatusText = document.createElement('div');
    this.hostStatusText.style.cssText = 'font-size:12px; color:#94a3b8; font-weight:600;';
    hostControlsWrapper.appendChild(this.hostStatusText);

    this.renderAll();
  }

  private renderAll(): void {
    const localId = this.lobbyService.getLocalPlayerId();
    const myMember = this.room.members.find(m => m.playerId === localId);
    const isHost = this.room.hostId === localId;

    // 1. Render Top Header
    this.headerInfoEl.innerHTML = `
      <div style="font-size:12px; font-weight:800; color:#fbbf24; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">
        ${this.room.name}
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:20px; font-weight:900; color:#fff;">Server Lobby</span>
        <span style="background:rgba(56, 189, 248, 0.2); color:#38bdf8; font-size:12px; font-weight:800; padding:3px 10px; border-radius:20px;">
          ${this.room.members.length} / ${this.room.maxPlayers} Players
        </span>
        <span style="background:rgba(34, 197, 94, 0.2); color:#4ade80; font-size:12px; font-weight:800; padding:3px 10px; border-radius:20px;">
          Status: Waiting
        </span>
      </div>
    `;

    // 2. Render Culture Selection Cards
    const cultures: IndianState[] = ['bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan'];
    this.cultureCardsContainer.innerHTML = '';

    cultures.forEach(cult => {
      const profile = CULTURE_PROFILES[cult];
      const holder = this.room.members.find(m => m.culture === cult);
      const isMine = myMember?.culture === cult;
      const isTaken = !!holder && !isMine;

      const card = document.createElement('div');
      card.style.cssText = `
        background: ${isMine ? 'rgba(245, 158, 11, 0.15)' : isTaken ? 'rgba(15, 23, 42, 0.5)' : 'rgba(30, 41, 59, 0.7)'};
        border: 2px solid ${isMine ? '#f59e0b' : isTaken ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)'};
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        cursor: ${isTaken ? 'not-allowed' : 'pointer'};
        opacity: ${isTaken ? '0.55' : '1'};
        transition: all 0.15s ease;
        position: relative;
        box-shadow: ${isMine ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none'};
      `;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:28px;">${this.getCultureEmoji(cult)}</span>
          <span style="
            font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 8px;
            background: ${isMine ? '#f59e0b' : isTaken ? '#64748b' : 'rgba(74, 222, 128, 0.2)'};
            color: ${isMine ? '#3e1c00' : isTaken ? '#cbd5e1' : '#4ade80'};
          ">
            ${isMine ? '✓ YOUR SELECTION' : isTaken ? `TAKEN: ${holder.playerName}` : 'AVAILABLE'}
          </span>
        </div>
        <div>
          <div style="font-size:16px; font-weight:800; color:#fff;">${profile.stateName}</div>
          <div style="font-size:11px; color:#fbbf24; font-weight:700;">${profile.regionTitle}</div>
        </div>
        <div style="font-size:11px; color:#94a3b8; line-height:1.4;">
          Specialty: <span style="color:#cbd5e1;">${profile.specialist.roleTitle}</span> • Crop: <span style="color:#38bdf8;">${ISLAND_CROPS[cult]?.displayName || 'Grain'}</span>
        </div>
      `;

      if (!isTaken) {
        card.onmouseenter = () => {
          card.style.transform = 'translateY(-3px)';
          card.style.borderColor = isMine ? '#f59e0b' : '#38bdf8';
        };
        card.onmouseleave = () => {
          card.style.transform = 'translateY(0)';
          card.style.borderColor = isMine ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)';
        };
        card.onclick = () => {
          this.music.playButtonClick();
          const res = this.lobbyService.reserveCulture(cult);
          if (!res.success) {
            alert(res.reason || 'Could not select culture.');
          }
        };
      }

      this.cultureCardsContainer.appendChild(card);
    });

    // 3. Render Player List
    this.playerListContainer.innerHTML = '';
    this.room.members.forEach(m => {
      const isSelf = m.playerId === localId;
      const cultProfile = m.culture ? CULTURE_PROFILES[m.culture] : null;

      const pCard = document.createElement('div');
      pCard.style.cssText = `
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid ${isSelf ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      pCard.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:22px;">${m.culture ? this.getCultureEmoji(m.culture) : '👤'}</div>
          <div>
            <div style="font-size:14px; font-weight:800; color:#fff; display:flex; align-items:center; gap:6px;">
              ${m.playerName} ${isSelf ? '<span style="font-size:10px; color:#38bdf8; font-weight:700;">(YOU)</span>' : ''}
              ${m.isHost ? '<span style="font-size:11px; background:#f59e0b; color:#3e1c00; font-weight:800; padding:1px 6px; border-radius:6px;">👑 HOST</span>' : ''}
            </div>
            <div style="font-size:11px; color:#94a3b8;">
              ${cultProfile ? `${cultProfile.stateName} (${cultProfile.regionTitle})` : '<em style="color:#f59e0b;">Choosing Island...</em>'}
            </div>
          </div>
        </div>
        <div>
          <span style="
            font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 8px;
            background: ${m.isReady ? 'rgba(74, 222, 128, 0.2)' : 'rgba(234, 179, 8, 0.2)'};
            color: ${m.isReady ? '#4ade80' : '#facc15'};
          ">
            ${m.isReady ? '✓ READY' : '⏳ CHOOSING'}
          </span>
        </div>
      `;

      this.playerListContainer.appendChild(pCard);
    });

    // 4. Update Ready Button
    const isReady = !!myMember?.isReady;
    this.readyBtn.style.background = isReady
      ? 'rgba(74, 222, 128, 0.25)'
      : 'linear-gradient(180deg, #ffc83b 0%, #f59e0b 100%)';
    this.readyBtn.style.color = isReady ? '#4ade80' : '#3e1c00';
    this.readyBtn.style.border = isReady ? '1px solid #4ade80' : 'none';
    this.readyBtn.textContent = isReady ? '✓ You Are Ready (Click to Cancel)' : 'Ready Up for Voyage';

    // 5. Update Host Controls
    if (isHost) {
      this.startBtn.style.display = 'block';
      const count = this.room.members.length;
      const allReady = this.room.members.every(m => m.isReady);
      const allHaveCulture = this.room.members.every(m => !!m.culture);
      const canStart = count >= 2 && allReady && allHaveCulture;

      if (canStart) {
        this.startBtn.disabled = false;
        this.startBtn.style.background = 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)';
        this.startBtn.style.color = '#fff';
        this.startBtn.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.5)';
        this.startBtn.style.cursor = 'pointer';
        this.hostStatusText.textContent = 'All adventurers ready! Host can start now.';
        this.hostStatusText.style.color = '#4ade80';
      } else {
        this.startBtn.disabled = true;
        this.startBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        this.startBtn.style.color = '#64748b';
        this.startBtn.style.boxShadow = 'none';
        this.startBtn.style.cursor = 'not-allowed';

        if (count < 2) {
          this.hostStatusText.textContent = `Need at least 2 players to start (${count}/2 joined). Share invite code!`;
        } else if (!allHaveCulture) {
          this.hostStatusText.textContent = 'Waiting for all players to pick an island culture...';
        } else {
          this.hostStatusText.textContent = 'Waiting for all players to click Ready...';
        }
        this.hostStatusText.style.color = '#94a3b8';
      }
    } else {
      this.startBtn.style.display = 'none';
      this.hostStatusText.textContent = 'Waiting for host to start the voyage...';
      this.hostStatusText.style.color = '#38bdf8';
    }
  }

  private getCultureEmoji(cult: IndianState): string {
    switch (cult) {
      case 'bihar': return '🦚';
      case 'maharashtra': return '🚩';
      case 'west_bengal': return '🪔';
      case 'karnataka': return '🐘';
      case 'gujarat': return '🧵';
      case 'rajasthan': return '🏰';
    }
  }

  public destroy(): void {
    this.root.remove();
  }
}
