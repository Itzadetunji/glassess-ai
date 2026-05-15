import { cn } from "#/lib/utils.ts";

export type TryOnPreviewImageProps = {
	src: string;
	alt: string;
	className?: string;
};

export function TryOnPreviewImage({
	src,
	alt,
	className,
}: TryOnPreviewImageProps) {
	return (
		<img
			src={src}
			alt={alt}
			className={cn(
				"w-full max-h-80 rounded-md border object-contain bg-muted/30",
				className,
			)}
		/>
	);
}
