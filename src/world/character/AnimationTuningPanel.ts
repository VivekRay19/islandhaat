import { CharacterController, AnimationTuningSettings, ANIMATION_PRESETS } from './CharacterController';

export class AnimationTuningPanel {
  private character: CharacterController;
  private container!: HTMLElement;
  private toggleButton!: HTMLElement;
  private isOpen: boolean = false;

  // Sliders and Value Displays
  private legSpeedSlider!: HTMLInputElement;
  private legSpeedVal!: HTMLElement;
  private armSpeedSlider!: HTMLInputElement;
  private armSpeedVal!: HTMLElement;
  private legSwingSlider!: HTMLInputElement;
  private legSwingVal!: HTMLElement;
  private armSwingSlider!: HTMLInputElement;
  private armSwingVal!: HTMLElement;
  private blendSpeedSlider!: HTMLInputElement;
  private blendSpeedVal!: HTMLElement;

  private dogSpeedSlider!: HTMLInputElement;
  private dogSpeedVal!: HTMLElement;
  private dogSwingSlider!: HTMLInputElement;
  private dogSwingVal!: HTMLElement;

  private linkedGaitCheckbox!: HTMLInputElement;
  private diagnosticCheckbox!: HTMLInputElement;
  private presetButtons: Map<string, HTMLButtonElement> = new Map();

  constructor(character: CharacterController) {
    this.character = character;
    this.createToggleButton();
    this.createPanel();
    this.syncUIFromSettings();
    this.bindKeyboardShortcut();
  }

  private createToggleButton(): void {
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'anim-tuning-toggle-btn';
    this.toggleButton.style.cssText = `
      position: fixed;
      top: 18px;
      right: 280px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.6);
      color: #fef08a;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3px;
      cursor: pointer;
      z-index: 9999;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
    `;
    this.toggleButton.innerHTML = `🛠️ <span>Anim Tuner</span> <span style="font-size:10px; color:#94a3b8;">[T]</span>`;
    
    this.toggleButton.onmouseenter = () => {
      this.toggleButton.style.background = 'rgba(30, 41, 59, 0.95)';
      this.toggleButton.style.borderColor = '#fbbf24';
      this.toggleButton.style.transform = 'translateY(-1px)';
    };
    this.toggleButton.onmouseleave = () => {
      this.toggleButton.style.background = 'rgba(15, 23, 42, 0.85)';
      this.toggleButton.style.borderColor = 'rgba(245, 158, 11, 0.6)';
      this.toggleButton.style.transform = 'translateY(0)';
    };
    this.toggleButton.onclick = () => this.toggle();

    document.body.appendChild(this.toggleButton);
  }

  private createPanel(): void {
    this.container = document.createElement('div');
    this.container.id = 'anim-tuning-panel';
    this.container.style.cssText = `
      position: fixed;
      top: 60px;
      right: 24px;
      width: 360px;
      max-height: 82vh;
      overflow-y: auto;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(245, 158, 11, 0.45);
      border-radius: 16px;
      padding: 18px 20px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      z-index: 10000;
      backdrop-filter: blur(14px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      display: none;
      flex-direction: column;
      gap: 14px;
      user-select: none;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;';
    header.innerHTML = `
      <div>
        <div style="font-size:15px; font-weight:800; color:#fbbf24; display:flex; align-items:center; gap:6px;">
          🎭 Animation Tuning Panel
        </div>
        <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Ultra-slow test & cadence calibration</div>
      </div>
      <button id="close-tuning-btn" style="background:transparent; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:2px 6px;">✕</button>
    `;
    this.container.appendChild(header);

    header.querySelector('#close-tuning-btn')!.addEventListener('click', () => this.close());

    // Presets Row
    const presetsSection = document.createElement('div');
    presetsSection.innerHTML = `<div style="font-size:11px; font-weight:700; color:#cbd5e1; margin-bottom:6px; letter-spacing:0.5px;">EXPERIMENT PRESETS</div>`;
    const presetsRow = document.createElement('div');
    presetsRow.style.cssText = 'display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;';

    const presetKeys: (keyof typeof ANIMATION_PRESETS)[] = [
      'ULTRA_SLOW',
      'VERY_SLOW',
      'SLOW',
      'MODERATE',
      'ORIGINAL'
    ];

    const presetLabels: Record<string, string> = {
      ULTRA_SLOW: 'ULTRA (0.15x)',
      VERY_SLOW: 'VERY SLOW (0.3x)',
      SLOW: 'SLOW (0.5x)',
      MODERATE: 'MODERATE (0.75x)',
      ORIGINAL: 'ORIGINAL (1.0x)'
    };

    presetKeys.forEach((key) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255,255,255,0.12);
        color: #e2e8f0;
        border-radius: 8px;
        padding: 6px 4px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: center;
      `;
      btn.textContent = presetLabels[key];
      btn.onclick = () => {
        this.character.applyPreset(key);
        this.syncUIFromSettings();
        this.highlightActivePreset(key);
      };
      this.presetButtons.set(key, btn);
      presetsRow.appendChild(btn);
    });

    presetsSection.appendChild(presetsRow);
    this.container.appendChild(presetsSection);

    // Human Animation Controls
    const humanSection = document.createElement('div');
    humanSection.style.cssText = 'display:flex; flex-direction:column; gap:10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;';
    humanSection.innerHTML = `<div style="font-size:11px; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">HUMAN SPECIALIST MOTION</div>`;

    // Sliders
    const legSpeedRow = this.createSliderRow('Leg Animation Speed', 0.15, 1.25, 0.05, (val) => {
      this.character.tuning.legSpeed = val;
      if (this.character.tuning.linkedGait) {
        this.character.tuning.armSpeed = val;
        this.armSpeedSlider.value = val.toString();
        this.armSpeedVal.textContent = `${val.toFixed(2)}x`;
      }
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.legSpeedSlider = legSpeedRow.slider;
    this.legSpeedVal = legSpeedRow.valText;
    humanSection.appendChild(legSpeedRow.row);

    const armSpeedRow = this.createSliderRow('Arm Animation Speed', 0.15, 1.25, 0.05, (val) => {
      this.character.tuning.armSpeed = val;
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.armSpeedSlider = armSpeedRow.slider;
    this.armSpeedVal = armSpeedRow.valText;
    humanSection.appendChild(armSpeedRow.row);

    const legSwingRow = this.createSliderRow('Leg Swing Intensity', 0.15, 1.00, 0.05, (val) => {
      this.character.tuning.legSwingIntensity = val;
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.legSwingSlider = legSwingRow.slider;
    this.legSwingVal = legSwingRow.valText;
    humanSection.appendChild(legSwingRow.row);

    const armSwingRow = this.createSliderRow('Arm Swing Intensity', 0.15, 1.00, 0.05, (val) => {
      this.character.tuning.armSwingIntensity = val;
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.armSwingSlider = armSwingRow.slider;
    this.armSwingVal = armSwingRow.valText;
    humanSection.appendChild(armSwingRow.row);

    const blendSpeedRow = this.createSliderRow('Animation Blend Speed', 0.25, 2.00, 0.05, (val) => {
      this.character.tuning.blendSpeed = val;
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.blendSpeedSlider = blendSpeedRow.slider;
    this.blendSpeedVal = blendSpeedRow.valText;
    humanSection.appendChild(blendSpeedRow.row);

    this.container.appendChild(humanSection);

    // Companion Dog Controls
    const dogSection = document.createElement('div');
    dogSection.style.cssText = 'display:flex; flex-direction:column; gap:10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;';
    dogSection.innerHTML = `<div style="font-size:11px; font-weight:800; color:#fbbf24; letter-spacing:0.5px;">COMPANION PUPPY GAIT</div>`;

    const dogSpeedRow = this.createSliderRow('Dog Leg Speed', 0.15, 1.25, 0.05, (val) => {
      this.character.tuning.dogSpeed = val;
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.dogSpeedSlider = dogSpeedRow.slider;
    this.dogSpeedVal = dogSpeedRow.valText;
    dogSection.appendChild(dogSpeedRow.row);

    const dogSwingRow = this.createSliderRow('Dog Swing Intensity', 0.15, 1.00, 0.05, (val) => {
      this.character.tuning.dogSwingIntensity = val;
      this.character.saveTuningSettings();
      this.clearPresetHighlights();
    });
    this.dogSwingSlider = dogSwingRow.slider;
    this.dogSwingVal = dogSwingRow.valText;
    dogSection.appendChild(dogSwingRow.row);

    this.container.appendChild(dogSection);

    // Toggles Section
    const togglesSection = document.createElement('div');
    togglesSection.style.cssText = 'display:flex; flex-direction:column; gap:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;';

    // Linked Gait Toggle
    const linkedRow = document.createElement('label');
    linkedRow.style.cssText = 'display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:#e2e8f0; font-weight:600;';
    this.linkedGaitCheckbox = document.createElement('input');
    this.linkedGaitCheckbox.type = 'checkbox';
    this.linkedGaitCheckbox.style.cursor = 'pointer';
    this.linkedGaitCheckbox.onchange = () => {
      this.character.tuning.linkedGait = this.linkedGaitCheckbox.checked;
      this.updateArmSpeedSliderState();
      if (this.character.tuning.linkedGait) {
        this.character.tuning.armSpeed = this.character.tuning.legSpeed;
        this.armSpeedSlider.value = this.character.tuning.legSpeed.toString();
        this.armSpeedVal.textContent = `${this.character.tuning.legSpeed.toFixed(2)}x`;
      }
      this.character.saveTuningSettings();
    };
    linkedRow.appendChild(this.linkedGaitCheckbox);
    linkedRow.appendChild(document.createTextNode('Linked Gait (Synchronise Arm & Leg Cadence)'));
    togglesSection.appendChild(linkedRow);

    // Diagnostic Slow Walk Mode
    const diagRow = document.createElement('label');
    diagRow.style.cssText = 'display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:#e2e8f0; font-weight:600;';
    this.diagnosticCheckbox = document.createElement('input');
    this.diagnosticCheckbox.type = 'checkbox';
    this.diagnosticCheckbox.style.cursor = 'pointer';
    this.diagnosticCheckbox.onchange = () => {
      this.character.tuning.diagnosticSlowWalk = this.diagnosticCheckbox.checked;
      this.character.saveTuningSettings();
    };
    diagRow.appendChild(this.diagnosticCheckbox);
    diagRow.appendChild(document.createTextNode('Diagnostic Mode (0.4x World Walk Speed)'));
    togglesSection.appendChild(diagRow);

    this.container.appendChild(togglesSection);

    // Action Buttons Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex; gap:10px; margin-top:4px;';

    const resetBtn = document.createElement('button');
    resetBtn.style.cssText = `
      flex: 1;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fca5a5;
      border-radius: 8px;
      padding: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    `;
    resetBtn.textContent = '↺ Reset to Ultra Slow';
    resetBtn.onclick = () => {
      this.character.applyPreset('ULTRA_SLOW');
      this.syncUIFromSettings();
      this.highlightActivePreset('ULTRA_SLOW');
    };
    footer.appendChild(resetBtn);

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      flex: 1;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.5);
      color: #93c5fd;
      border-radius: 8px;
      padding: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    `;
    closeBtn.textContent = 'Close Panel';
    closeBtn.onclick = () => this.close();
    footer.appendChild(closeBtn);

    this.container.appendChild(footer);
    document.body.appendChild(this.container);
  }

  private createSliderRow(
    label: string,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void
  ): { row: HTMLElement; slider: HTMLInputElement; valText: HTMLElement } {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; flex-direction:column; gap:4px;';

    const top = document.createElement('div');
    top.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#cbd5e1;';
    const title = document.createElement('span');
    title.textContent = label;
    const valText = document.createElement('span');
    valText.style.cssText = 'font-weight:800; color:#fbbf24; font-variant-numeric:tabular-nums;';
    valText.textContent = `${min.toFixed(2)}x`;
    top.appendChild(title);
    top.appendChild(valText);
    row.appendChild(top);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = min.toString();
    slider.style.cssText = `
      width: 100%;
      height: 6px;
      border-radius: 4px;
      background: #334155;
      outline: none;
      cursor: pointer;
      accent-color: #f59e0b;
    `;

    slider.oninput = () => {
      const val = parseFloat(slider.value);
      valText.textContent = `${val.toFixed(2)}x`;
      onChange(val);
    };

    row.appendChild(slider);
    return { row, slider, valText };
  }

  public syncUIFromSettings(): void {
    const t = this.character.tuning;
    this.legSpeedSlider.value = t.legSpeed.toString();
    this.legSpeedVal.textContent = `${t.legSpeed.toFixed(2)}x`;

    this.armSpeedSlider.value = t.armSpeed.toString();
    this.armSpeedVal.textContent = `${t.armSpeed.toFixed(2)}x`;

    this.legSwingSlider.value = t.legSwingIntensity.toString();
    this.legSwingVal.textContent = `${t.legSwingIntensity.toFixed(2)}x`;

    this.armSwingSlider.value = t.armSwingIntensity.toString();
    this.armSwingVal.textContent = `${t.armSwingIntensity.toFixed(2)}x`;

    this.blendSpeedSlider.value = t.blendSpeed.toString();
    this.blendSpeedVal.textContent = `${t.blendSpeed.toFixed(2)}x`;

    this.dogSpeedSlider.value = t.dogSpeed.toString();
    this.dogSpeedVal.textContent = `${t.dogSpeed.toFixed(2)}x`;

    this.dogSwingSlider.value = t.dogSwingIntensity.toString();
    this.dogSwingVal.textContent = `${t.dogSwingIntensity.toFixed(2)}x`;

    this.linkedGaitCheckbox.checked = t.linkedGait;
    this.diagnosticCheckbox.checked = t.diagnosticSlowWalk;

    this.updateArmSpeedSliderState();
  }

  private updateArmSpeedSliderState(): void {
    if (this.character.tuning.linkedGait) {
      this.armSpeedSlider.disabled = true;
      this.armSpeedSlider.style.opacity = '0.5';
    } else {
      this.armSpeedSlider.disabled = false;
      this.armSpeedSlider.style.opacity = '1.0';
    }
  }

  private highlightActivePreset(presetKey: string): void {
    this.presetButtons.forEach((btn, key) => {
      if (key === presetKey) {
        btn.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
        btn.style.borderColor = '#fde047';
        btn.style.color = '#fff';
      } else {
        btn.style.background = 'rgba(30, 41, 59, 0.8)';
        btn.style.borderColor = 'rgba(255,255,255,0.12)';
        btn.style.color = '#e2e8f0';
      }
    });
  }

  private clearPresetHighlights(): void {
    this.presetButtons.forEach((btn) => {
      btn.style.background = 'rgba(30, 41, 59, 0.8)';
      btn.style.borderColor = 'rgba(255,255,255,0.12)';
      btn.style.color = '#e2e8f0';
    });
  }

  private bindKeyboardShortcut(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 't' || e.key === 'T') {
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.toggleButton.style.background = 'rgba(245, 158, 11, 0.9)';
    this.toggleButton.style.color = '#0f172a';
    this.syncUIFromSettings();
  }

  public close(): void {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.toggleButton.style.background = 'rgba(15, 23, 42, 0.85)';
    this.toggleButton.style.color = '#fef08a';
  }

  public setVisible(visible: boolean): void {
    this.toggleButton.style.display = visible ? 'flex' : 'none';
    if (!visible && this.isOpen) {
      this.close();
    }
  }

  public destroy(): void {
    this.container?.remove();
    this.toggleButton?.remove();
  }
}
