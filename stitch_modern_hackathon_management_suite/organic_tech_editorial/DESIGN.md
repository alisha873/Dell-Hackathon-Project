---
name: Organic Tech Editorial
colors:
  surface: '#fff8f3'
  surface-dim: '#e4d8cc'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fef2e5'
  surface-container: '#f8ecdf'
  surface-container-high: '#f2e6da'
  surface-container-highest: '#ece1d4'
  on-surface: '#201b13'
  on-surface-variant: '#414847'
  inverse-surface: '#362f27'
  inverse-on-surface: '#fbefe2'
  outline: '#727877'
  outline-variant: '#c1c8c6'
  surface-tint: '#49635f'
  primary: '#49635f'
  on-primary: '#ffffff'
  primary-container: '#97b3ae'
  on-primary-container: '#2c4642'
  inverse-primary: '#b0ccc7'
  secondary: '#7a564e'
  on-secondary: '#ffffff'
  secondary-container: '#ffcfc5'
  on-secondary-container: '#7a564f'
  tertiary: '#3b4ed6'
  on-tertiary: '#ffffff'
  tertiary-container: '#9ca7ff'
  on-tertiary-container: '#122ab8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce8e3'
  primary-fixed-dim: '#b0ccc7'
  on-primary-fixed: '#04201d'
  on-primary-fixed-variant: '#324c48'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#eabcb2'
  on-secondary-fixed: '#2e140f'
  on-secondary-fixed-variant: '#5f3f37'
  tertiary-fixed: '#dfe0ff'
  tertiary-fixed-dim: '#bcc2ff'
  on-tertiary-fixed: '#000c61'
  on-tertiary-fixed-variant: '#1c32be'
  background: '#fff8f3'
  on-background: '#201b13'
  surface-variant: '#ece1d4'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is built on the intersection of high-end editorial publishing and modern SaaS efficiency. It targets a sophisticated audience of organizers and developers who value clarity over clutter. The aesthetic is "Organic Tech"—a departure from the cold, neon-lit tropes of traditional hacking environments in favor of a soft, feminine, and grounded atmosphere.

The style leverages **Minimalism** with a **Tactile** edge. It utilizes heavy whitespace to create a sense of calm and focus, while employing soft shadows and organic color transitions to make the digital interface feel physical and premium. Every interaction should evoke a sense of professional ease and curated quality, similar to a high-fashion lookbook or a premium productivity tool.

## Colors
The palette is grounded in "Warm Stone" and "Off White" to prevent the interface from feeling clinical. 

- **Primary (Sage Green):** Used for main structural highlights, success states, and primary brand moments.
- **Secondary (Peach):** A soft counterpoint to the sage, used for secondary call-to-actions and illustrative accents.
- **Tertiary (Indigo):** Reserved strictly for interactive "power" moments—primary buttons, active focus states, and critical paths—providing a sharp, professional contrast to the organic base.
- **Neutral (Warm Stone):** Used for borders, subtle backgrounds, and secondary text to maintain the warm, premium feel.
- **Background (Off White):** The canvas for all views, providing a softer reading experience than pure white.

## Typography
The typography strategy creates a distinct hierarchy between "Editorial Expression" and "Functional Data."

- **Headlines:** Uses *Playfair Display*. It should be set with tight letter-spacing for large displays to emphasize its elegant, high-contrast serifs.
- **Body & UI:** Uses *Geist*. This monospaced-influenced sans-serif brings a touch of technical precision to the system without feeling aggressive. It ensures high legibility for project descriptions, code snippets, and management tables.
- **Labels:** Small caps or medium-weight Geist are used for metadata to distinguish it clearly from body prose.

## Layout & Spacing
This design system utilizes a **Fixed Grid** for marketing and dashboard overview pages to maintain an editorial "center-weighted" feel, while employing a **Fluid Grid** for dense management views.

- **Grid:** A 12-column system on desktop with generous 24px gutters.
- **Negative Space:** Content should be allowed to "breathe." Avoid filling every corner of the screen. Use a minimum of 48px (stack-lg) between distinct logical sections.
- **Responsive Behavior:** On mobile, margins shrink to 20px, and the 12-column grid collapses to a 1-column stack. Typography scales down significantly to ensure the serif headlines remain readable without excessive wrapping.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and **Ambient Shadows** rather than stark borders.

- **Surface Levels:** The base is Off White (#F0EEEA). Cards and containers use pure White (#FFFFFF) to pop forward.
- **Shadows:** Use extremely soft, long-range shadows. A typical "Elevated" state should use a shadow with a 20px-30px blur and only 4-6% opacity, tinted with the Warm Stone (#D6CBBF) color instead of pure black to maintain the organic feel.
- **Borders:** Use soft, low-contrast outlines in Warm Stone (#D6CBBF) at 0.5px or 1px thickness to define boundaries without creating visual noise.

## Shapes
The shape language is defined by oversized, welcoming radii. 

- **Components:** Standard buttons and input fields use a `rounded-lg` (16px) radius.
- **Containers:** Dashboard cards and main content areas use `rounded-xl` (24px) or even 32px to reinforce the "soft" brand personality.
- **Interactive States:** Hovering over a card should slightly increase its elevation and potentially soften its corners further via a subtle scale transform.

## Components
- **Buttons:** 
  - *Primary:* Indigo (#5B6EF5) background with white text. High contrast, 16px roundedness.
  - *Secondary:* Sage Green (#97B3AE) at 15% opacity with Sage text.
  - *Tertiary:* Ghost style with underline on hover, using Playfair Display for a "link" feel in editorial sections.
- **Input Fields:** Off-white backgrounds with a subtle Warm Stone border. Focus state uses a 2px Indigo glow.
- **Chips/Badges:** Pill-shaped, using the secondary Peach (#F2C3B9) or Blush (#F0DDD6) backgrounds with darkened text for status indicators (e.g., "Pending," "Under Review").
- **Cards:** White background, 24px rounded corners, ambient shadow. Cards should have generous internal padding (min 32px).
- **Lists:** Clean, borderless rows separated by subtle 1px Warm Stone lines. Use Geist for list items to maintain a professional, data-rich feel.
- **Progress Bars:** Use Sage Green for the track and Indigo for the progress indicator, emphasizing completion and technical advancement.