---
name: Precision Institutional
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fc'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1eb'
  on-surface: '#1a1b22'
  on-surface-variant: '#444653'
  inverse-surface: '#2f3037'
  inverse-on-surface: '#f1f0fa'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#611e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#872d00'
  on-tertiary-container: '#ffa583'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1eb'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

This design system is engineered for high-consequence biometric banking environments where trust, clarity, and systematic precision are paramount. The aesthetic is rooted in **Corporate Modernism**, blending the functional density of developer tools with the refined polish of premium fintech interfaces.

The UI avoids decorative flourishes in favor of utility, employing heavy whitespace, a rigorous grid, and a neutral-leaning palette to reduce cognitive load during complex verification workflows. The emotional goal is to evoke a sense of absolute security and institutional stability, ensuring users feel they are interacting with a resilient, state-of-the-art financial infrastructure.

## Colors

The palette is anchored by a deep "Institutional Blue" primary, signifying authority and reliability. A "Teal" secondary is reserved for specialized biometric or secondary action states, providing subtle differentiation from standard navigation elements.

The system utilizes a functional semantic mapping:
- **Surface & Background:** Layers are defined by `Background` (#F8FAFC) for the canvas and `Surface` (#FFFFFF) for interactive cards and containers.
- **Feedback:** Success, Warning, and Error colors follow standard financial conventions but are adjusted for WCAG AA contrast compliance against white and off-white surfaces.
- **Neutrals:** A scale of cool grays (derived from the Slate palette) handles borders, secondary text, and iconography to maintain a cohesive, clean environment.

## Typography

The system uses **Inter** for all UI elements to leverage its exceptional legibility and systematic character widths. A secondary monospaced font (JetBrains Mono) is introduced sparingly for transaction IDs, biometric hashes, and data strings to emphasize technical accuracy.

- **Headlines:** Use tighter letter spacing and Semi-Bold weights to create a strong visual hierarchy.
- **Body Text:** Optimized for long-form data reading with standard 1.5x line height.
- **Labels:** Small caps or bold weights are used for metadata headers and form labels to distinguish them clearly from user input.

## Layout & Spacing

This design system adheres to a strict **8px linear grid**. All dimensions, padding, and margins must be multiples of 8 to ensure a predictable, mathematical rhythm across the interface.

- **Desktop:** 12-column fluid grid with 24px gutters. Side navigation is fixed at 280px.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Content is organized into "Sections" with 48px vertical spacing to prevent visual clutter. Data-heavy tables utilize "Compact" (4px/8px) spacing, while marketing or landing pages utilize "Spacious" (24px/32px) increments.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Ambient Shadows**. Instead of heavy shadows, the system uses "elevation strokes"—1px borders that are slightly darker than the surface color—to define boundaries.

- **Level 0 (Background):** #F8FAFC, flat. Used for the main app canvas.
- **Level 1 (Card/Surface):** White surface with a 1px border (#E2E8F0) and a very soft 2px blur shadow at 5% opacity.
- **Level 2 (Dropdowns/Modals):** White surface with a 1px border and a distinct 12px blur shadow at 10% opacity to indicate temporary interaction.
- **Interactive States:** Buttons use a subtle inner-glow on hover to simulate a tactile "lifted" effect rather than a traditional drop shadow.

## Shapes

The shape language balances approachability with professional rigor. A consistent **12px radius** is applied to primary containers, cards, and large buttons to soften the technical nature of the content.

- **Large Components (Cards, Modals):** 12px (rounded-lg).
- **Standard Components (Inputs, Buttons):** 8px (standard).
- **Small Components (Tags, Checkboxes):** 4px (rounded-sm).
- **Status Indicators:** Full circles (pill) for status badges to distinguish them from interactive buttons.

## Components

Components follow a "System-First" logic, prioritizing consistency and accessibility.

- **Buttons:** Primary buttons use a solid blue background with white text. Ghost buttons use a 1px slate border. All buttons have a minimum height of 40px for touch/click targets.
- **Input Fields:** Use a 1px border (#CBD5E1). On focus, the border shifts to Primary Blue with a 3px soft outer ring (20% opacity).
- **Data Tables:** Highly structured with 1px horizontal dividers. Header rows use a light gray background (#F1F5F9) and `label-sm` typography.
- **Status Chips:** Subtle background tints (e.g., 10% opacity of the semantic color) with high-contrast bold text.
- **Verification Cards:** Specific components for biometric status (Face, Fingerprint) feature a dedicated icon area and a progress-stepper style footer.
- **Accessibility:** All interactive elements include a visible focus ring (2px solid Primary Blue offset by 2px) to meet WCAG AA standards.