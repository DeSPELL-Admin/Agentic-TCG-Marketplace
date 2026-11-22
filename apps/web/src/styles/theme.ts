export const theme = {
  color: {
    canvas: '#F5F5F7', surface: '#FFFFFF', ink: '#302C49', muted: '#665F76',
    coral: '#C94F57', primary: '#B6404B', primaryHover: '#9F3440', link: '#8B303E',
    mat: '#DCD6ED', soft: '#FBE8E9', lavenderSoft: '#F0EDF7', coralSoft: '#F8EEF0',
    line: '#DED9E5', input: '#897F97', focus: '#51417C',
    success: '#176B4A', successBg: '#E6F4EB', warning: '#875100', warningBg: '#FFF4CD',
    error: '#9F244A', errorBg: '#FFF0F3', demo: '#545068', demoBg: '#ECEAF2',
  },
  radius: { badge: 5, control: 10, card: 14, panel: 12, mat: 24 },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, section: 48 },
  breakpoint: { mobile: 640, tablet: 960 },
} as const;
export type AppTheme = typeof theme;
