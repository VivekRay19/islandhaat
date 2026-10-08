export class IslandHaatTitle {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'island-haat-coded-title';
    this.element.style.cssText = `
      position: absolute;
      top: 6%;
      left: 50%;
      transform: translateX(-50%);
      width: 440px;
      max-width: 88vw;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: auto;
      cursor: default;
      z-index: 25;
      animation: titleBreathingFloat 6s ease-in-out infinite;
      transition: filter 0.3s ease, transform 0.3s ease;
    `;

    // Add keyframes style if not exists
    if (!document.getElementById('island-haat-title-styles')) {
      const style = document.createElement('style');
      style.id = 'island-haat-title-styles';
      style.innerHTML = `
        @keyframes titleBreathingFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
        #island-haat-coded-title:hover {
          filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.45));
        }
      `;
      document.head.appendChild(style);
    }

    this.renderSVG();
  }

  private renderSVG(): void {
    this.element.innerHTML = `
      <svg viewBox="0 0 500 320" width="100%" height="100%" style="overflow:visible; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.45));">
        <defs>
          <!-- Sun Gradients -->
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fffbeb"/>
            <stop offset="40%" stop-color="#fde047"/>
            <stop offset="85%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </radialGradient>

          <!-- Island Text Gradients (Warm Golden-Orange 3D) -->
          <linearGradient id="islandFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="30%" stop-color="#facc15"/>
            <stop offset="70%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>

          <linearGradient id="islandExtrudeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>

          <!-- Haat Text Gradients (Cream Dimensional) -->
          <linearGradient id="haatFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="40%" stop-color="#fffbeb"/>
            <stop offset="80%" stop-color="#fef3c7"/>
            <stop offset="100%" stop-color="#fde68a"/>
          </linearGradient>

          <linearGradient id="haatExtrudeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#78350f"/>
            <stop offset="100%" stop-color="#271003"/>
          </linearGradient>

          <!-- Foliage Gradients -->
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="50%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#15803d"/>
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#86efac"/>
            <stop offset="60%" stop-color="#16a34a"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>

          <!-- Clay Pot Gradient -->
          <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fb923c"/>
            <stop offset="50%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </linearGradient>

          <!-- Textile Banner Gradient -->
          <linearGradient id="clothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/>
            <stop offset="50%" stop-color="#e11d48"/>
            <stop offset="100%" stop-color="#881337"/>
          </linearGradient>

          <!-- Tagline Plaque Gradient -->
          <linearGradient id="plaqueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef3c7"/>
            <stop offset="40%" stop-color="#fde68a"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>

        <!-- ============================================================== -->
        <!-- LAYER 1: RADIANT SUN BEHIND TITLE                             -->
        <!-- ============================================================== -->
        <g id="logo-sun" transform="translate(250, 48)">
          <!-- Sun Rays -->
          <path d="M0 -34 L-4 -46 L4 -46 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <path d="M24 -24 L36 -32 L31 -22 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <path d="M34 0 L46 -4 L46 4 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <path d="M24 24 L36 32 L31 22 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <path d="M-24 -24 L-36 -32 L-31 -22 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <path d="M-34 0 L-46 -4 L-46 4 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <path d="M-24 24 L-36 32 L-31 22 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>
          <!-- Sun Disc -->
          <circle cx="0" cy="0" r="30" fill="url(#sunGrad)" stroke="#78350f" stroke-width="3.5"/>
          <circle cx="0" cy="0" r="26" fill="none" stroke="#fef08a" stroke-width="2" opacity="0.6"/>
        </g>

        <!-- ============================================================== -->
        <!-- LAYER 2: LUSH FOLIAGE, PALM FRONDS & LEAVES                   -->
        <!-- ============================================================== -->
        <!-- Left Palm Fronds -->
        <g id="left-leaves" transform="translate(190, 80) rotate(-18)">
          <path d="M0 0 C-30 -25 -70 -10 -85 20 C-65 25 -40 15 0 0 Z" fill="url(#leafGrad1)" stroke="#14532d" stroke-width="3"/>
          <path d="M0 0 C-40 -5 -80 20 -75 55 C-55 45 -35 25 0 0 Z" fill="url(#leafGrad2)" stroke="#14532d" stroke-width="3"/>
          <path d="M0 0 C-15 -35 -45 -45 -65 -30 C-50 -15 -30 -5 0 0 Z" fill="url(#leafGrad1)" stroke="#14532d" stroke-width="2.5"/>
          <!-- Leaf Vein Highlights -->
          <path d="M0 0 C-30 -12 -55 5 -75 22" fill="none" stroke="#bbf7d0" stroke-width="1.8" opacity="0.7"/>
        </g>

        <!-- Right Palm Fronds -->
        <g id="right-leaves" transform="translate(310, 80) rotate(18)">
          <path d="M0 0 C30 -25 70 -10 85 20 C65 25 40 15 0 0 Z" fill="url(#leafGrad1)" stroke="#14532d" stroke-width="3"/>
          <path d="M0 0 C40 -5 80 20 75 55 C55 45 35 25 0 0 Z" fill="url(#leafGrad2)" stroke="#14532d" stroke-width="3"/>
          <path d="M0 0 C15 -35 45 -45 65 -30 C50 -15 30 -5 0 0 Z" fill="url(#leafGrad2)" stroke="#14532d" stroke-width="2.5"/>
          <!-- Leaf Vein Highlights -->
          <path d="M0 0 C30 -12 55 5 75 22" fill="none" stroke="#bbf7d0" stroke-width="1.8" opacity="0.7"/>
        </g>

        <!-- ============================================================== -->
        <!-- LAYER 3: CLAY POT & TEXTILE BANNER                            -->
        <!-- ============================================================== -->
        <!-- Terracotta Clay Pot (Left) -->
        <g id="clay-pot" transform="translate(195, 175) rotate(-10)">
          <!-- Pot Shadow -->
          <ellipse cx="0" cy="18" rx="18" ry="6" fill="rgba(0,0,0,0.3)"/>
          <!-- Pot Body -->
          <path d="M-14 -12 C-26 0 -24 20 0 22 C24 20 26 0 14 -12 Z" fill="url(#potGrad)" stroke="#431407" stroke-width="3"/>
          <!-- Pot Rim -->
          <ellipse cx="0" cy="-12" rx="14" ry="4" fill="#fed7aa" stroke="#431407" stroke-width="2.5"/>
          <!-- Pot Chevron Pattern -->
          <path d="M-12 2 L-6 8 L0 2 L6 8 L12 2" fill="none" stroke="#fef3c7" stroke-width="2.2" stroke-linecap="round"/>
        </g>

        <!-- Handwoven Textile Runner (Right) -->
        <g id="textile-banner" transform="translate(315, 160) rotate(8)">
          <!-- Banner Cloth -->
          <path d="M-14 -10 L14 -10 L12 26 L-12 26 Z" fill="url(#clothGrad)" stroke="#4c0519" stroke-width="2.5"/>
          <!-- Geometric Patterns -->
          <circle cx="0" cy="0" r="4" fill="#fde047"/>
          <path d="M-8 12 L0 6 L8 12 L0 18 Z" fill="none" stroke="#fde047" stroke-width="1.8"/>
          <!-- Hanging Tassels -->
          <line x1="-8" y1="26" x2="-8" y2="34" stroke="#fbbf24" stroke-width="2"/>
          <line x1="0" y1="26" x2="0" y2="35" stroke="#fbbf24" stroke-width="2"/>
          <line x1="8" y1="26" x2="8" y2="34" stroke="#fbbf24" stroke-width="2"/>
        </g>

        <!-- Frangipani Flower (Right) -->
        <g id="flower" transform="translate(318, 120)">
          <circle cx="0" cy="0" r="6" fill="#facc15"/>
          <circle cx="-6" cy="-4" r="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
          <circle cx="6" cy="-4" r="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
          <circle cx="7" cy="5" r="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
          <circle cx="-7" cy="5" r="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
          <circle cx="0" cy="8" r="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
        </g>

        <!-- ============================================================== -->
        <!-- LAYER 4: 3D DIMENSIONAL "ISLAND" LETTERING                     -->
        <!-- ============================================================== -->
        <g id="island-word" transform="translate(250, 115)">
          <!-- Deep Extrusion Shadow Layer -->
          <text x="0" y="8" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="56" font-weight="900" letter-spacing="3" fill="#271003" stroke="#271003" stroke-width="14" stroke-linejoin="round">ISLAND</text>
          
          <!-- Mid Extrusion Layer -->
          <text x="0" y="5" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="56" font-weight="900" letter-spacing="3" fill="url(#islandExtrudeGrad)" stroke="#451a03" stroke-width="10" stroke-linejoin="round">ISLAND</text>
          
          <!-- Main Golden Face -->
          <text x="0" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="56" font-weight="900" letter-spacing="3" fill="url(#islandFaceGrad)" stroke="#451a03" stroke-width="4" stroke-linejoin="round">ISLAND</text>

          <!-- Top Specular Bevel Highlight -->
          <text x="0" y="-1" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="56" font-weight="900" letter-spacing="3" fill="none" stroke="#fffbeb" stroke-width="1.5" opacity="0.75" stroke-linejoin="round">ISLAND</text>
        </g>

        <!-- ============================================================== -->
        <!-- LAYER 5: 3D DIMENSIONAL "HAAT" LETTERING                       -->
        <!-- ============================================================== -->
        <g id="haat-word" transform="translate(250, 178)">
          <!-- Deep Extrusion Shadow Layer -->
          <text x="0" y="8" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="64" font-weight="900" letter-spacing="4" fill="#1e0a02" stroke="#1e0a02" stroke-width="16" stroke-linejoin="round">HAAT</text>

          <!-- Mid Extrusion Layer -->
          <text x="0" y="5" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="64" font-weight="900" letter-spacing="4" fill="url(#haatExtrudeGrad)" stroke="#3e1a00" stroke-width="10" stroke-linejoin="round">HAAT</text>

          <!-- Main Cream Face -->
          <text x="0" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="64" font-weight="900" letter-spacing="4" fill="url(#haatFaceGrad)" stroke="#3e1a00" stroke-width="4" stroke-linejoin="round">HAAT</text>

          <!-- Top Specular Bevel Highlight -->
          <text x="0" y="-1" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="64" font-weight="900" letter-spacing="4" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.9" stroke-linejoin="round">HAAT</text>
        </g>

        <!-- ============================================================== -->
        <!-- LAYER 6: CARVED WOODEN TAGLINE PLAQUE                          -->
        <!-- ============================================================== -->
        <g id="tagline-plaque" transform="translate(250, 222)">
          <!-- Plaque Drop Shadow -->
          <rect x="-160" y="-10" width="320" height="28" rx="14" fill="rgba(0,0,0,0.4)"/>

          <!-- Plaque Base -->
          <rect x="-160" y="-12" width="320" height="26" rx="13" fill="url(#plaqueGrad)" stroke="#451a03" stroke-width="3.5"/>

          <!-- Inner Plaque Border -->
          <rect x="-156" y="-9" width="312" height="20" rx="10" fill="none" stroke="#fef08a" stroke-width="1.5" opacity="0.8"/>

          <!-- Tagline Text -->
          <text x="0" y="2" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="12" font-weight="900" letter-spacing="1.5" fill="#3e1a00">
            BUILD • TRADE • CULTURE • GROW
          </text>
        </g>
      </svg>
    `;
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
