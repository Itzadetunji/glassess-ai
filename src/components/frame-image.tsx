import {
	type ComponentPropsWithoutRef,
	type MouseEvent,
	useEffect,
	useRef,
} from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	FRAME_IMAGE_VARIANTS,
	FRAME_TYPES,
	type FrameImageVariant,
	type FrameTypeKey,
	frameAssetUrl,
} from "#/lib/constants.ts";

export type FrameImageProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
	frameType: FrameTypeKey;
	variant: FrameImageVariant;
};

export function FrameImage({
	frameType,
	variant,
	alt = "",
	...rest
}: FrameImageProps) {
	return <img src={frameAssetUrl(frameType, variant)} alt={alt} {...rest} />;
}

export type FrameTypeSelectTileProps = {
	frameType: FrameTypeKey;
	selected: boolean;
	onSelect: () => void;
	onOpenGallery: () => void;
};

const singleClickDelayMs = 220;

export function FrameTypeSelectTile({
	frameType,
	selected,
	onSelect,
	onOpenGallery,
}: FrameTypeSelectTileProps) {
	const spec = FRAME_TYPES[frameType];
	const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearPendingClick = () => {
		if (clickTimerRef.current !== null) {
			clearTimeout(clickTimerRef.current);
			clickTimerRef.current = null;
		}
	};

	useEffect(() => {
		const timerRef = clickTimerRef;
		return () => {
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, []);

	const handleClick = () => {
		clearPendingClick();
		clickTimerRef.current = setTimeout(() => {
			clickTimerRef.current = null;
			onSelect();
		}, singleClickDelayMs);
	};

	const handleDoubleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		clearPendingClick();
		onSelect();
		onOpenGallery();
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className={`rounded-md border p-2 shadow-xs transition-colors min-w-fit ${
						selected
							? "ring-2 ring-primary ring-offset-2 ring-offset-background"
							: "opacity-90 hover:opacity-100"
					}`}
					onClick={handleClick}
					onDoubleClick={handleDoubleClick}
				>
					<FrameImage
						frameType={frameType}
						variant={1}
						alt={spec.name}
						className="size-18 object-contain"
					/>
				</button>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				className="max-w-none border bg-popover p-3 text-popover-foreground"
			>
				<p className="mb-2 max-w-xs text-xs text-balance">
					<span className="font-medium">{spec.name}</span>
					<span className="text-muted-foreground"> — {spec.description}</span>
				</p>
				<div className="flex gap-2">
					{FRAME_IMAGE_VARIANTS.map((variant) => (
						<div key={variant} className="rounded border bg-background p-1.5">
							<FrameImage
								frameType={frameType}
								variant={variant}
								alt=""
								className="size-16 object-contain"
							/>
						</div>
					))}
				</div>
				<p className="mt-2 text-[11px] text-muted-foreground">
					Click to select. Double-click or use Open Gallery for fullscreen
					(arrow keys to browse).
				</p>
			</TooltipContent>
		</Tooltip>
	);
}
