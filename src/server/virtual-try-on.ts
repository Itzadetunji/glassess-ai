/**
 * Virtual try-on via Replicate [black-forest-labs/flux-2-pro](https://replicate.com/black-forest-labs/flux-2-pro/api/schema).
 * Requires `REPLICATE_API_TOKEN` in the environment.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FRAME_TYPES, type FrameTypeKey } from "#/lib/constants.ts";
import type {
	CreateImageInput,
	CreateImageResponse,
} from "#/lib/virtual-try-on-contract.ts";

const REPLICATE_MODEL = "black-forest-labs/flux-2-pro";
const REPLICATE_BASE = "https://api.replicate.com/v1";

function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } {
	const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
	if (!match) {
		throw new Error(
			"Invalid image: expected a data URL (e.g. data:image/png;base64,...)",
		);
	}
	const mimeType = match[1]?.toLowerCase() ?? "image/png";
	const buffer = Buffer.from(match[2] ?? "", "base64");
	if (buffer.length === 0) {
		throw new Error("Invalid image: empty payload");
	}
	return { buffer, mimeType };
}

function fileExtensionForMime(mimeType: string): string {
	if (mimeType.includes("png")) return "png";
	if (mimeType.includes("webp")) return "webp";
	if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
	return "png";
}

async function replicateUploadImage(
	token: string,
	buffer: Buffer,
	mimeType: string,
	filename: string,
): Promise<string> {
	const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
	const formData = new FormData();
	formData.append("content", blob, filename);

	const res = await fetch(`${REPLICATE_BASE}/files`, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Replicate file upload failed (${res.status}): ${body}`);
	}

	const json = (await res.json()) as { urls?: { get?: string } };
	const url = json.urls?.get;
	if (!url) {
		throw new Error("Replicate file upload response missing urls.get");
	}
	return url;
}

function publicFilePath(urlPath: string): string {
	const segments = urlPath.replace(/^\//, "").split("/").filter(Boolean);
	return path.join(process.cwd(), "public", ...segments);
}

async function waitForPredictionOutput(
	token: string,
	getUrl: string,
	maxAttempts = 180,
	intervalMs = 1000,
): Promise<unknown> {
	for (let i = 0; i < maxAttempts; i++) {
		const res = await fetch(getUrl, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) {
			const body = await res.text();
			throw new Error(`Replicate poll failed (${res.status}): ${body}`);
		}
		const pred = (await res.json()) as {
			status: string;
			error?: string;
			output?: unknown;
		};

		if (pred.status === "succeeded") {
			return pred.output;
		}
		if (pred.status === "failed" || pred.status === "canceled") {
			throw new Error(pred.error ?? `Prediction ${pred.status}`);
		}
		await new Promise((r) => setTimeout(r, intervalMs));
	}
	throw new Error("Replicate prediction timed out");
}

function outputToImageUrl(output: unknown): string {
	if (typeof output === "string") return output;
	if (Array.isArray(output) && typeof output[0] === "string") {
		return output[0];
	}
	throw new Error(
		"Unexpected Replicate output shape (expected image URL string)",
	);
}

async function fetchUrlAsBase64Image(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch result image (${res.status})`);
	}
	const buf = Buffer.from(await res.arrayBuffer());
	const mime =
		res.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/png";
	return `data:${mime};base64,${buf.toString("base64")}`;
}

function buildFluxPrompt(frameType: FrameTypeKey): string {
	const frame = FRAME_TYPES[frameType];
	return [
		"Edit ONLY the following: add realistic prescription-style eyeglasses to the person's face.",
		`The eyewear MUST match these frame references (shape, thickness, silhouette, and general style): ${frame.name}.`,
		`Style notes: ${frame.description}`,
		"The FIRST input image is the scene to preserve: keep the SAME background, environment, pose, framing, focal length, lighting, clothing, hair, skin, jewelry, facial expression, and image quality.",
		"Output must look like the same photograph with eyeglasses composited naturally (correct perspective on nose and ears, realistic shadows and reflections).",
		"Do not crop, recolor the scene, relight the room, change resolution, or alter anything except adding the glasses.",
	].join(" ");
}

export async function runVirtualTryOn(
	data: CreateImageInput,
): Promise<CreateImageResponse> {
	const token = process.env.REPLICATE_API_TOKEN;
	if (!token) {
		return {
			status: "error",
			message:
				"Missing REPLICATE_API_TOKEN. Add it to your environment to run image generation.",
		};
	}

	try {
		const { buffer, mimeType } = parseDataUrl(data.imageDataUrl);
		const ext = fileExtensionForMime(mimeType);
		const userImageUrl = await replicateUploadImage(
			token,
			buffer,
			mimeType,
			`subject.${ext}`,
		);

		const frameImages = FRAME_TYPES[data.frameType].images;
		const frameUrls: string[] = [];
		for (const rel of frameImages) {
			const abs = publicFilePath(rel);
			const fileBuf = await readFile(abs);
			const fname = path.basename(abs);
			const frameUrl = await replicateUploadImage(
				token,
				fileBuf,
				"image/png",
				fname.endsWith(".png") ? fname : `${fname}.png`,
			);
			frameUrls.push(frameUrl);
		}

		const inputImages = [userImageUrl, ...frameUrls].slice(0, 8);

		const prompt = buildFluxPrompt(data.frameType);

		const createRes = await fetch(
			`${REPLICATE_BASE}/models/${REPLICATE_MODEL}/predictions`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					input: {
						prompt,
						input_images: inputImages,
						aspect_ratio: "match_input_image",
						output_format: "png",
					},
				}),
			},
		);

		if (!createRes.ok) {
			const body = await createRes.text();
			throw new Error(
				`Replicate prediction failed to start (${createRes.status}): ${body}`,
			);
		}

		const prediction = (await createRes.json()) as {
			urls?: { get?: string };
		};
		const getUrl = prediction.urls?.get;
		if (!getUrl) {
			throw new Error("Replicate prediction response missing urls.get");
		}

		const output = await waitForPredictionOutput(token, getUrl);
		const imageUrl = outputToImageUrl(output);
		const imageDataUrl = await fetchUrlAsBase64Image(imageUrl);

		return {
			status: "success",
			message: "Generated try-on image",
			data: { image: imageDataUrl },
		};
	} catch (e) {
		const message =
			e instanceof Error
				? e.message
				: "Unknown error during image generation";
		return { status: "error", message };
	}
}
