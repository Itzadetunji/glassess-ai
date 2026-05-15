/**
 * Typed RPC wrapper for [`runVirtualTryOn`](./virtual-try-on.ts).
 * Call from the client with `createImage({ data })` or via `useCreateImageMutation`.
 */
import { createServerFn } from "@tanstack/react-start";
import {
	type Base64Image,
	type CreateImageResponse,
	createImageInputSchema,
} from "#/lib/virtual-try-on-contract.ts";
import { runVirtualTryOn } from "#/server/virtual-try-on.ts";

export type { Base64Image, CreateImageResponse };

/** @deprecated Use `CreateImageResponse` */
export type CreatImageResponse = CreateImageResponse;

export const createImage = createServerFn({ method: "POST" })
	.inputValidator(createImageInputSchema)
	.handler(async ({ data }): Promise<CreateImageResponse> => {
		return runVirtualTryOn(data);
	});

/** @deprecated typo — use `createImage` */
export const creatImage = createImage;
