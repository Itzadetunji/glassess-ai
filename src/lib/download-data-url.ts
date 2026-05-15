/** Triggers a browser download for a data URL (e.g. `data:image/png;base64,...`). */
export function downloadDataUrl(dataUrl: string, filename: string) {
	const match = /^data:image\/([^;,]+)/i.exec(dataUrl);
	const ext = match?.[1]?.replace(/\+/g, "") ?? "png";
	const safeName = filename.includes(".")
		? filename
		: `${filename}.${ext === "jpeg" ? "jpg" : ext}`;

	const anchor = document.createElement("a");
	anchor.href = dataUrl;
	anchor.download = safeName;
	anchor.rel = "noopener";
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
}
