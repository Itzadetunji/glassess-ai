"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
} from "react";
import { FrameImage } from "#/components/frame-image.tsx";
import {
	FRAME_IMAGE_VARIANTS,
	FRAME_TYPES,
	type FrameTypeKey,
} from "#/lib/constants.ts";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export type FrameGalleryState = {
	frameKey: FrameTypeKey;
	variantIndex: number;
} | null;

export type FrameGalleryModalProps = {
	gallery: FrameGalleryState;
	onGalleryChange: Dispatch<SetStateAction<FrameGalleryState>>;
};

export function FrameGalleryModal({
	gallery,
	onGalleryChange,
}: FrameGalleryModalProps) {
	const stepGallery = useCallback(
		(delta: number) => {
			onGalleryChange((current) => {
				if (!current) return current;
				const n = FRAME_IMAGE_VARIANTS.length;
				const next = (current.variantIndex + delta + n) % n;
				return { ...current, variantIndex: next };
			});
		},
		[onGalleryChange],
	);

	useEffect(() => {
		if (!gallery) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				stepGallery(-1);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				stepGallery(1);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [gallery, stepGallery]);

	return (
		<Dialog
			open={gallery !== null}
			onOpenChange={(open) => {
				if (!open) onGalleryChange(null);
			}}
		>
			<DialogContent
				className="flex max-h-[92vh] max-w-[min(96vw,1100px)] flex-col gap-4 overflow-hidden border bg-background p-4 sm:p-6"
				showCloseButton
			>
				{gallery ? (
					<>
						<DialogHeader className="shrink-0 text-left">
							<DialogTitle>{FRAME_TYPES[gallery.frameKey].name}</DialogTitle>
							<DialogDescription className="text-balance">
								{FRAME_TYPES[gallery.frameKey].description}{" "}
								<span className="text-foreground/80">
									({gallery.variantIndex + 1} / {FRAME_IMAGE_VARIANTS.length})
								</span>
							</DialogDescription>
						</DialogHeader>
						<div className="flex min-h-0 flex-1 items-center justify-center gap-2 sm:gap-4">
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-10 shrink-0"
								aria-label="Previous frame image"
								onClick={() => stepGallery(-1)}
							>
								<ChevronLeft className="size-5" />
							</Button>
							<div className="flex min-h-0 flex-1 items-center justify-center">
								<FrameImage
									frameType={gallery.frameKey}
									variant={FRAME_IMAGE_VARIANTS[gallery.variantIndex]}
									alt=""
									className="max-h-[min(72vh,820px)] w-full max-w-full object-contain"
								/>
							</div>
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="size-10 shrink-0"
								aria-label="Next frame image"
								onClick={() => stepGallery(1)}
							>
								<ChevronRight className="size-5" />
							</Button>
						</div>
						<p className="text-center text-xs text-muted-foreground">
							Use arrow keys ← → to browse images.
						</p>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
