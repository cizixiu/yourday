# Project Guidelines

## Adding New Calendar Styles (Themes)

When implementing a new design theme in `src/App.tsx`, ensure the following aspects are handled to maintain consistency with the application's features:

1.  **Color Variable Scope Control**: 
    - The "Primary Color" (自定义配色/`primaryColor`) should only be applied to major decorative or highlighted elements (e.g., the English month name, the main large day number).
    - Auxiliary information (e.g., "YYYY.MM", "Weekday", "Fortune text", labels) should generally follow the standard text color (`var(--color-text)`) or a muted version of it to maintain high legibility and professional aesthetic.

2.  **Manual Mode Support (Tear-off Feature)**:
    - If a theme uses a complete custom layout inside `App.tsx`, you MUST explicitly include the "Tear-off" button logic (`isManualMode`) within the theme's structure.
    - Ideally, implement it as a relative/absolute element that doesn't obstruct content but remains accessible.

3.  **Chinese Calendar Alignment**:
    - Festivals (节日) and Solar Terms (节气) should be treated as high-priority information. 
    - In clean/modern themes, ensure they are positioned near the date or secondary date info with appropriate font sizing (consistent with Ganzhi/干支 details).

4.  **Theme Class Application**:
    - Every theme must apply its unique ID as a class to the main `calendar-container` (e.g., `theme-neo-traditional`). 
    - Make sure the `themes` array contains the correct Tailwind classes for the background and border to ensure the container reflects the theme's core identity.

5.  **Consistency with Interaction Elements**:
    - Ensure all custom interaction components (like the footer "Your Day" text or current quote) respect user settings like font type and custom text even if the layout is radically different from the 'classic' style.
