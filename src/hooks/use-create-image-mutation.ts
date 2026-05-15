"use client";

import { useMutation } from "@tanstack/react-query";

import type {
	CreateImageInput,
	CreateImageResponse,
} from "#/lib/virtual-try-on-contract.ts";
import { createImage } from "#/server/create-image.ts";

/**
 * Runs virtual try-on on the server via the `createImage` server function (TanStack Start RPC).
 */
export function useCreateImageMutation() {
	return useMutation({
		mutationKey: ["virtual-try-on"],
		retry: 0,
		mutationFn: async (
			payload: CreateImageInput,
		): Promise<CreateImageResponse> => {
			const result = await createImage({ data: payload });
			if (result.status === "error") {
				throw new Error(result.message);
			}
			return result;
		},
	});
}
