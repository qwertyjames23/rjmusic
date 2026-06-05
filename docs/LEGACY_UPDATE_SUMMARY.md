# Legacy Design Match Complete

I have updated the Landing Page components to exactly match the legacy designs (Stitch visual style):

1. **Themes & Colors**:
    * Hardcoded legacy hex colors `#050505` (bg), `#1a1a1a` (cards), `#136dec` (primary) into the Tailwind config.
    * Enforced dark mode globally.

2. **Typography**:
    * Added `Space Grotesk` (headings) and `Noto Sans` (body) from Google Fonts.
    * Applied `font-display` and `font-body` utilities.

3. **Component Overhauls**:
    * **Navbar**: Strict sticky layout, border colors, and input styling.
    * **Hero**: Matched gradient overlays, glow text effects, and button box-shadows.
    * **Category Grid**: Dark cards with circular icon backgrounds and specific hover states.
    * **Product Card**: Updated to use legacy border colors and text styles.

4. **Verification**:
    * Build passed successfully.

You can verify the visual fidelity by running the app.
