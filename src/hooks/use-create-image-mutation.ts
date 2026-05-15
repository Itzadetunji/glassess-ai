"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import type {
	CreateImageInput,
	CreateImageResponse,
} from "#/lib/virtual-try-on-contract.ts";
import { api } from "#/lib/api/client.ts";

/**
 * Generates a glasses try-on image via `POST /api/virtual-try-on` (Axios + Replicate on the server).
 */
export function useCreateImageMutation() {
	return useMutation({
		mutationKey: ["virtual-try-on"],
		retry: 0,
		mutationFn: async (
			payload: CreateImageInput,
		): Promise<CreateImageResponse> => {
			try {
				const res = await api.post<CreateImageResponse>(
					"/api/virtual-try-on",
					payload,
				);
				return res.data;
			} catch (err) {
				if (axios.isAxiosError(err) && err.response?.data !== undefined) {
					const raw = err.response.data as Partial<CreateImageResponse>;
					const msg =
						typeof raw?.message === "string"
							? raw.message
							: `Request failed (${err.response.status})`;
					throw new Error(msg);
				}
				throw err instanceof Error ? err : new Error("Try-on failed");
			}
		},
	});
}
