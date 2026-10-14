import { IntroMusic } from '../audio/IntroMusic';
import { LobbyService } from '../multiplayer/LobbyService';
import { ServerRoom } from '../multiplayer/MultiplayerTypes';

export class ServerMenuScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private music = IntroMusic.get();
  private lobbyService = LobbyService.get();

  private activeTab: 'create' | 'join' = 'create';
  private statusMessageEl!: HTMLElement;

  private onRoomReadyCallback?: (room: ServerRoom) => void;
  private onBackCallback?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    this.root = document.createElement('div');
    this.root.id = 'server-menu-root';
    this.root.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100vw; height: 100vh;
      overflow: hidden;
      background: radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 60%, #080d16 100%);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      user-select: none;
      z-index: 25;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
    `;
    this.container.appendChild(this.root);

    this.buildUI();
  }

  public setCallbacks(opts: {
    onRoomReady: (room: ServerRoom) => void;
    onBack: () => void;
  }): void {
    this.onRoomReadyCallback = opts.onRoomReady;
    this.onBackCallback = opts.onBack;
  }

  private buildUI(): void {
    const panel = document.createElement('div');
    panel.style.cssText = `
      width: 620px;
      max-width: 92vw;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 28px;
      padding: 36px 40px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      gap: 24px;
    `;
    this.root.appendChild(panel);

    // Header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.innerHTML = `
      <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">
        Multiplayer Archipelago
      </div>
      <h2 style="font-size: 28px; font-weight: 900; margin: 0; color: #fff;">
        Multiplayer Server
      </h2>
    `;
    panel.appendChild(header);

    // Tab Switcher (Create Server / Join Server)
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 14px;
      padding: 4px;
      gap: 4px;
    `;
    panel.appendChild(tabContainer);

    const createTabBtn = document.createElement('button');
    const joinTabBtn = document.createElement('button');

    const updateTabs = () => {
      const isCreate = this.activeTab === 'create';
      createTabBtn.style.background = isCreate ? 'linear-gradient(180deg, #ffc83b 0%, #f59e0b 100%)' : 'transparent';
      createTabBtn.style.color = isCreate ? '#3e1c00' : '#94a3b8';
      createTabBtn.style.boxShadow = isCreate ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none';

      joinTabBtn.style.background = !isCreate ? 'linear-gradient(180deg, #ffc83b 0%, #f59e0b 100%)' : 'transparent';
      joinTabBtn.style.color = !isCreate ? '#3e1c00' : '#94a3b8';
      joinTabBtn.style.boxShadow = !isCreate ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none';

      createForm.style.display = isCreate ? 'flex' : 'none';
      joinForm.style.display = !isCreate ? 'flex' : 'none';
      this.clearStatus();
    };

    [createTabBtn, joinTabBtn].forEach(btn => {
      btn.style.cssText = `
        flex: 1;
        padding: 10px 0;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
    });

    createTabBtn.textContent = '👑 Create a New Server';
    createTabBtn.onclick = () => {
      this.music.playButtonClick();
      this.activeTab = 'create';
      updateTabs();
    };

    joinTabBtn.textContent = '🔑 Join with Code';
    joinTabBtn.onclick = () => {
      this.music.playButtonClick();
      this.activeTab = 'join';
      updateTabs();
    };

    tabContainer.appendChild(createTabBtn);
    tabContainer.appendChild(joinTabBtn);

    // Form 1: Create Server
    const createForm = document.createElement('div');
    createForm.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
    panel.appendChild(createForm);

    createForm.innerHTML = `
      <div>
        <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Server Name</label>
        <input id="create-server-name" type="text" value="Sangam Archipelago" maxlength="28" style="
          width: 100%; box-sizing: border-box; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; font-size: 15px; color: #fff; outline: none; transition: border 0.2s;
        " />
      </div>
      <div>
        <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Your Adventurer Name</label>
        <input id="create-host-name" type="text" value="${this.lobbyService.getPlayerName()}" maxlength="20" style="
          width: 100%; box-sizing: border-box; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; font-size: 15px; color: #fff; outline: none; transition: border 0.2s;
        " />
      </div>
      <div style="font-size: 12px; color: #64748b; line-height: 1.4;">
        Capacity: <strong>Up to 6 Players</strong> (1 per unique Indian culture: Bihar, Maharashtra, West Bengal, Karnataka, Gujarat, Rajasthan). An invite code will be generated for your friends.
      </div>
    `;

    const createBtn = document.createElement('button');
    createBtn.style.cssText = `
      width: 100%; padding: 14px 0; border: none; border-radius: 14px;
      background: linear-gradient(180deg, #ffc83b 0%, #f59e0b 50%, #d97706 100%);
      color: #3e1c00; font-size: 15px; font-weight: 800; cursor: pointer;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4); transition: transform 0.15s ease;
    `;
    createBtn.textContent = 'Create Server & Open Lobby →';
    createBtn.onmouseenter = () => { createBtn.style.transform = 'translateY(-2px)'; };
    createBtn.onmouseleave = () => { createBtn.style.transform = 'translateY(0)'; };
    createBtn.onclick = async () => {
      this.music.playButtonClick();
      const sNameInput = createForm.querySelector('#create-server-name') as HTMLInputElement;
      const hNameInput = createForm.querySelector('#create-host-name') as HTMLInputElement;
      createBtn.disabled = true;
      createBtn.textContent = 'Generating Server...';
      this.showStatus('Creating room session on Supabase Realtime...', '#38bdf8');

      const res = await this.lobbyService.createServer(sNameInput.value, hNameInput.value);
      if (res.success && res.room) {
        this.onRoomReadyCallback?.(res.room);
      } else {
        createBtn.disabled = false;
        createBtn.textContent = 'Create Server & Open Lobby →';
        this.showStatus(res.error || 'Failed to create server.', '#f87171');
      }
    };
    createForm.appendChild(createBtn);

    // Form 2: Join Server
    const joinForm = document.createElement('div');
    joinForm.style.cssText = 'display: none; flex-direction: column; gap: 16px;';
    panel.appendChild(joinForm);

    joinForm.innerHTML = `
      <div>
        <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Invitation Code</label>
        <input id="join-invite-code" type="text" placeholder="e.g. HAAT-8K2P" maxlength="12" style="
          width: 100%; box-sizing: border-box; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; font-size: 18px; font-weight: 800; letter-spacing: 2px; color: #facc15; text-transform: uppercase; outline: none; transition: border 0.2s;
        " />
      </div>
      <div>
        <label style="display:block; font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">Your Adventurer Name</label>
        <input id="join-player-name" type="text" value="${this.lobbyService.getPlayerName()}" maxlength="20" style="
          width: 100%; box-sizing: border-box; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; font-size: 15px; color: #fff; outline: none; transition: border 0.2s;
        " />
      </div>
    `;

    const joinBtn = document.createElement('button');
    joinBtn.style.cssText = `
      width: 100%; padding: 14px 0; border: none; border-radius: 14px;
      background: linear-gradient(180deg, #ffc83b 0%, #f59e0b 50%, #d97706 100%);
      color: #3e1c00; font-size: 15px; font-weight: 800; cursor: pointer;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4); transition: transform 0.15s ease;
    `;
    joinBtn.textContent = 'Connect to Server →';
    joinBtn.onmouseenter = () => { joinBtn.style.transform = 'translateY(-2px)'; };
    joinBtn.onmouseleave = () => { joinBtn.style.transform = 'translateY(0)'; };
    joinBtn.onclick = async () => {
      this.music.playButtonClick();
      const codeInput = joinForm.querySelector('#join-invite-code') as HTMLInputElement;
      const pNameInput = joinForm.querySelector('#join-player-name') as HTMLInputElement;
      joinBtn.disabled = true;
      joinBtn.textContent = 'Connecting...';
      this.showStatus('Locating server & checking capacity...', '#38bdf8');

      const res = await this.lobbyService.joinServer(codeInput.value, pNameInput.value);
      if (res.success && res.room) {
        this.onRoomReadyCallback?.(res.room);
      } else {
        joinBtn.disabled = false;
        joinBtn.textContent = 'Connect to Server →';
        this.showStatus(res.error || 'Could not connect to server.', '#f87171');
      }
    };
    joinForm.appendChild(joinBtn);

    // Status Message Area
    this.statusMessageEl = document.createElement('div');
    this.statusMessageEl.style.cssText = `
      font-size: 13px; font-weight: 700; text-align: center; min-height: 20px;
    `;
    panel.appendChild(this.statusMessageEl);

    // Back to Mode Select Button
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      background: transparent; border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px; color: #cbd5e1; padding: 10px 24px; font-size: 13px;
      font-weight: 700; cursor: pointer; transition: all 0.15s ease; align-self: center;
    `;
    backBtn.textContent = '← Back to Mode Select';
    backBtn.onclick = () => {
      this.music.playButtonClick();
      this.onBackCallback?.();
    };
    panel.appendChild(backBtn);

    updateTabs();
  }

  private showStatus(msg: string, color: string): void {
    this.statusMessageEl.textContent = msg;
    this.statusMessageEl.style.color = color;
  }

  private clearStatus(): void {
    this.statusMessageEl.textContent = '';
  }

  public destroy(): void {
    this.root.remove();
  }
}
