import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

import {
	createImageInputSchema,
	type CreateImageResponse,
} from "#/lib/virtual-try-on-contract.ts";
import { runVirtualTryOn } from "#/server/virtual-try-on.ts";

export const Route = createFileRoute("/api/virtual-try-on")({
	server: {
		handlers: {
			POST: async ({
				request,
			}: {
				request: Request;
			}): Promise<Response> => {
				let parsedBody: unknown;
				try {
					parsedBody = await request.json();
				} catch {
					const body: CreateImageResponse = {
						status: "error",
						message: "Invalid JSON body",
					};
					return json(body, { status: 400 });
				}

				const parsed = createImageInputSchema.safeParse(parsedBody);
				if (!parsed.success) {
					const body: CreateImageResponse = {
						status: "error",
						message:
							"Invalid payload: photo (data URL) and frame selection are required.",
					};
					return json(body, { status: 400 });
				}

				const result = await runVirtualTryOn(parsed.data);

				if (result.status === "success") {
					return json(result, { status: 200 });
				}
				return json(result, { status: 422 });
			},
		},
	},
});
