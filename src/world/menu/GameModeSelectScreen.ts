import { IntroMusic } from '../audio/IntroMusic';

export class GameModeSelectScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private music = IntroMusic.get();

  private onSinglePlayerCallback?: () => void;
  private onMultiplayerCallback?: () => void;
  private onBackCallback?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    this.root = document.createElement('div');
    this.root.id = 'game-mode-select-root';
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
    onSinglePlayer: () => void;
    onMultiplayer: () => void;
    onBack: () => void;
  }): void {
    this.onSinglePlayerCallback = opts.onSinglePlayer;
    this.onMultiplayerCallback = opts.onMultiplayer;
    this.onBackCallback = opts.onBack;
  }

  private buildUI(): void {
    // Container Box
    const panel = document.createElement('div');
    panel.style.cssText = `
      width: 760px;
      max-width: 92vw;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 28px;
      padding: 40px 48px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      animation: fadeIn 0.3s ease-out;
    `;
    this.root.appendChild(panel);

    // Title & Subtitle
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.innerHTML = `
      <div style="font-size: 13px; font-weight: 800; letter-spacing: 2px; color: #fbbf24; text-transform: uppercase; margin-bottom: 6px;">
        Choose Your Journey
      </div>
      <h1 style="font-size: 34px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #ffffff 30%, #fef08a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Select Game Mode
      </h1>
      <p style="font-size: 15px; color: #94a3b8; margin: 8px 0 0; max-width: 500px;">
        Build a cozy solo cultural island or gather up to six friends in an interconnected archipelago session.
      </p>
    `;
    panel.appendChild(header);

    // Cards Grid (2 Options)
    const cardsGrid = document.createElement('div');
    cardsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      width: 100%;
    `;
    panel.appendChild(cardsGrid);

    // Card 1: Single Player
    const spCard = this.createModeCard({
      emoji: '🏝️',
      title: 'Single Player',
      badge: 'Classic Cozy Experience',
      badgeColor: '#38bdf8',
      desc: 'Build at your own pace. Select your cultural specialty, cultivate crops, explore your island, and visit the Central Haat.',
      buttonText: 'Start Solo Journey',
      isPrimary: false,
      onClick: () => {
        this.music.playButtonClick();
        this.onSinglePlayerCallback?.();
      }
    });
    cardsGrid.appendChild(spCard);

    // Card 2: Multiplayer
    const mpCard = this.createModeCard({
      emoji: '⛵',
      title: 'Multiplayer Lobby',
      badge: '2–6 Players Co-Op',
      badgeColor: '#4ade80',
      desc: 'Create or join a shared server with friends. Each player selects a unique Indian culture, trades crops, and sails between islands.',
      buttonText: 'Enter Multiplayer',
      isPrimary: true,
      onClick: () => {
        this.music.playButtonClick();
        this.onMultiplayerCallback?.();
      }
    });
    cardsGrid.appendChild(mpCard);

    // Back Button
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      color: #cbd5e1;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    backBtn.innerHTML = `<span>←</span> Back to Main Menu`;
    backBtn.onmouseenter = () => {
      this.music.playButtonHover();
      backBtn.style.borderColor = '#fbbf24';
      backBtn.style.color = '#fff';
      backBtn.style.transform = 'translateY(-2px)';
    };
    backBtn.onmouseleave = () => {
      backBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      backBtn.style.color = '#cbd5e1';
      backBtn.style.transform = 'translateY(0)';
    };
    backBtn.onclick = () => {
      this.music.playButtonClick();
      this.onBackCallback?.();
    };
    panel.appendChild(backBtn);
  }

  private createModeCard(opts: {
    emoji: string;
    title: string;
    badge: string;
    badgeColor: string;
    desc: string;
    buttonText: string;
    isPrimary: boolean;
    onClick: () => void;
  }): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(30, 41, 59, 0.6);
      border: 2px solid ${opts.isPrimary ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
      border-radius: 20px;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    `;

    card.innerHTML = `
      <div style="font-size: 52px; margin-bottom: 12px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));">
        ${opts.emoji}
      </div>
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${opts.badgeColor}; background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 20px; margin-bottom: 10px;">
        ${opts.badge}
      </div>
      <div style="font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 8px;">
        ${opts.title}
      </div>
      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; min-height: 56px;">
        ${opts.desc}
      </div>
      <div style="
        width: 100%;
        padding: 12px 0;
        border-radius: 14px;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.5px;
        background: ${opts.isPrimary ? 'linear-gradient(180deg, #ffc83b 0%, #f59e0b 50%, #d97706 100%)' : 'rgba(255,255,255,0.1)'};
        color: ${opts.isPrimary ? '#3e1c00' : '#fff'};
        box-shadow: ${opts.isPrimary ? '0 4px 16px rgba(245, 158, 11, 0.4)' : 'none'};
      ">
        ${opts.buttonText} →
      </div>
    `;

    card.onmouseenter = () => {
      this.music.playButtonHover();
      card.style.transform = 'translateY(-6px)';
      card.style.borderColor = opts.isPrimary ? '#f59e0b' : '#38bdf8';
      card.style.boxShadow = `0 16px 36px ${opts.isPrimary ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`;
    };

    card.onmouseleave = () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = opts.isPrimary ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)';
      card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
    };

    card.onclick = () => opts.onClick();

    return card;
  }

  public destroy(): void {
    this.root.remove();
  }
}
