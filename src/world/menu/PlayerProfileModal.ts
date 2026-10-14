import { SessionManager } from '../session/SessionManager';

export class PlayerProfileModal {
  private container: HTMLElement;
  private modalEl: HTMLElement | null = null;
  private onNameUpdated?: (newName: string) => void;

  constructor(container: HTMLElement = document.body) {
    this.container = container;
  }

  public show(onNameUpdated?: (newName: string) => void): void {
    this.onNameUpdated = onNameUpdated;
    this.close();

    const currentName = SessionManager.getPlayerName();

    const modal = document.createElement('div');
    modal.id = 'player-profile-modal-backdrop';
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(10, 15, 26, 0.78);
      backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    `;

    modal.innerHTML = `
      <div id="player-profile-card" style="
        background: linear-gradient(145deg, rgba(24, 33, 47, 0.96), rgba(15, 23, 42, 0.98));
        border: 1px solid rgba(245, 158, 11, 0.5);
        border-radius: 24px;
        padding: 32px;
        width: 90%;
        max-width: 440px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 24px rgba(245, 158, 11, 0.2);
        color: #fff;
        position: relative;
      ">
        <button id="profile-close-x" style="
          position: absolute;
          top: 18px; right: 20px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          width: 32px; height: 32px;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        ">✕</button>

        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
          <div style="
            width: 44px; height: 44px;
            border-radius: 14px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
          ">👤</div>
          <div>
            <h3 style="margin:0; font-size:20px; font-weight:800; color:#fff; letter-spacing:-0.3px;">Voyager Profile</h3>
            <p style="margin:2px 0 0; font-size:12px; color:#94a3b8;">Visible to other players and allies across islands</p>
          </div>
        </div>

        <div style="margin: 22px 0 16px;">
          <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
            Display Name
          </label>
          <div style="position:relative;">
            <input id="profile-name-input" type="text" maxlength="20" value="${currentName}" style="
              width: 100%;
              background: rgba(10, 16, 26, 0.85);
              border: 1.5px solid rgba(245, 158, 11, 0.4);
              border-radius: 14px;
              padding: 12px 55px 12px 16px;
              color: #fef08a;
              font-size: 16px;
              font-weight: 700;
              box-sizing: border-box;
              outline: none;
              transition: border 0.2s, box-shadow 0.2s;
            " />
            <span id="char-counter" style="
              position: absolute;
              right: 14px; top: 50%;
              transform: translateY(-50%);
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
            ">${currentName.length}/20</span>
          </div>
          <div id="profile-error-msg" style="
            font-size: 12px;
            color: #f87171;
            margin-top: 6px;
            min-height: 16px;
            font-weight: 600;
          "></div>
        </div>

        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 16px; margin-bottom:24px; font-size:12px; color:#94a3b8; line-height:1.5;">
          💡 Your name automatically synchronizes over active multiplayer sessions, island docks, and alliance banners.
        </div>

        <div style="display:flex; gap:12px;">
          <button id="profile-cancel-btn" style="
            flex: 1;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            color: #cbd5e1;
            font-size: 14px;
            font-weight: 700;
            padding: 12px;
            cursor: pointer;
            transition: all 0.15s;
          ">Cancel</button>

          <button id="profile-save-btn" style="
            flex: 1.5;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border: none;
            border-radius: 12px;
            color: #3e1c00;
            font-size: 14px;
            font-weight: 800;
            padding: 12px;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
            transition: transform 0.15s, box-shadow 0.15s;
          ">Save Name</button>
        </div>
      </div>
    `;

    this.container.appendChild(modal);
    this.modalEl = modal;

    const input = modal.querySelector<HTMLInputElement>('#profile-name-input')!;
    const charCounter = modal.querySelector<HTMLElement>('#char-counter')!;
    const errorMsg = modal.querySelector<HTMLElement>('#profile-error-msg')!;
    const saveBtn = modal.querySelector<HTMLButtonElement>('#profile-save-btn')!;
    const cancelBtn = modal.querySelector<HTMLButtonElement>('#profile-cancel-btn')!;
    const closeX = modal.querySelector<HTMLButtonElement>('#profile-close-x')!;

    input.focus();
    input.select();

    input.addEventListener('input', () => {
      charCounter.textContent = `${input.value.length}/20`;
      errorMsg.textContent = '';
      if (input.value.trim().length < 3) {
        input.style.borderColor = 'rgba(239, 68, 68, 0.6)';
      } else {
        input.style.borderColor = 'rgba(245, 158, 11, 0.8)';
      }
    });

    const handleSave = () => {
      const res = SessionManager.setPlayerName(input.value);
      if (!res.success) {
        errorMsg.textContent = res.error || 'Please enter a valid display name.';
        input.focus();
        return;
      }

      this.onNameUpdated?.(res.name);
      this.close();
    };

    saveBtn.onclick = handleSave;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') this.close();
    });

    cancelBtn.onclick = () => this.close();
    closeX.onclick = () => this.close();

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
  }

  public close(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
