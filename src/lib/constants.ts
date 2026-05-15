export const FRAME_TYPES = {
	square: {
		name: "Square frames",
		description:
			"Straight temples and squared lenses—sharp, geometric styles that suit round or oval faces.",
		images: ["/frames/square/1.png", "/frames/square/2.png"],
	},
	rectangle: {
		name: "Rectangle frames",
		description:
			"Classic rectangular silhouettes—versatile shapes that balance softer facial features.",
		images: ["/frames/rectangle/1.png", "/frames/rectangle/2.png"],
	},
} as const;

export type FrameTypeKey = keyof typeof FRAME_TYPES;
