/**
 * Frame catalog — assets live at `/frames/<key>/<variant>.webp` (variants `1` and `2`).
 */
export const FRAME_TYPES = {
	aviator: {
		name: "Aviator",
		description:
			"Teardrop lenses with a thin bridge—classic pilot-inspired metal frames.",
	},
	browline: {
		name: "Browline",
		description:
			"A bold upper rim that echoes the brow—retro desk-and-boardroom energy.",
	},
	"cat-eye": {
		name: "Cat-eye",
		description: "Upswept outer corners for a playful vintage glam silhouette.",
	},
	geometric: {
		name: "Geometric",
		description:
			"Angular, modern shapes beyond basic rectangles—statement eyewear.",
	},
	oval: {
		name: "Oval",
		description: "Soft elliptical lenses—often flattering on squarer jawlines.",
	},
	oversized: {
		name: "Oversized",
		description:
			"Larger lenses and rims for coverage and a bold fashion presence.",
	},
	rectangle: {
		name: "Rectangle",
		description: "Straight-edged rectangles—versatile everyday proportions.",
	},
	round: {
		name: "Round",
		description: "Circular lenses—minimalist or retro intellectual vibes.",
	},
	square: {
		name: "Square",
		description:
			"Squared lenses and temples—sharp geometry for softer face shapes.",
	},
} as const;

export type FrameTypeKey = keyof typeof FRAME_TYPES;

/** Public URL for a frame asset (`public/frames/...`). */
export function frameAssetUrl(frameType: FrameTypeKey, variant: 1 | 2): string {
	return `/frames/${frameType}/${variant}.webp`;
}
