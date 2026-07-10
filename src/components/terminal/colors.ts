// Tailwind theme color utilities in one place, so a reader can tell which
// "channel" a line belongs to and the palette stays consistent. Each maps to a
// --color-* var from @theme, so games and text follow the light/dark switch.
export const COLOR = {
	muted: "text-text-muted",
	text: "text-text",
	accent: "text-primary",
	heading: "text-secondary",
	info: "text-info",
	success: "text-success",
	warning: "text-warning",
	error: "text-error",
} as const;
