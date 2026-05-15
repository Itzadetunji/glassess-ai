import { z } from "zod";
import { FRAME_TYPES, type FrameTypeKey } from "#/lib/constants.ts";

export type Base64Image = `data:image/${string};base64,${string}`;

export type CreateImageResponse =
	| {
			status: "success";
			message: string;
			data: { image: Base64Image };
	  }
	| {
			status: "error";
			message: string;
	  };

/** Payload for `createImage` server function / `useCreateImageMutation` */
export const createImageInputSchema = z.object({
	imageDataUrl: z.string().min(100, "Expected a non-empty image data URL"),
	frameType: z.enum(
		Object.keys(FRAME_TYPES) as [FrameTypeKey, ...FrameTypeKey[]],
	),
});

export type CreateImageInput = z.infer<typeof createImageInputSchema>;
