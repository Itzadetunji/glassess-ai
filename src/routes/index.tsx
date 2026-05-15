import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Upload, X } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
} from "#/components/ui-extended/file-upload";
import { FRAME_TYPES, type FrameTypeKey } from "#/lib/constants.ts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type HomeFormValues = {
	photo: File | null;
	frameType: FrameTypeKey;
};

const defaultFrameType = Object.keys(FRAME_TYPES)[0] as FrameTypeKey;

const defaultHomeFormValues: HomeFormValues = {
	photo: null,
	frameType: defaultFrameType,
};

export function Home() {
	const form = useForm({
		defaultValues: defaultHomeFormValues,
		onSubmit: async () => {
			// Hook for upload + auth flow later
		},
	});

	const frameTypeEntries = Object.entries(FRAME_TYPES) as [
		FrameTypeKey,
		(typeof FRAME_TYPES)[FrameTypeKey],
	][];

	return (
		<TooltipProvider delayDuration={200}>
			<div className="flex-1 flex flex-col items-center justify-center">
				<Card className="relative w-full max-w-sm">
					<CardHeader>
						<CardTitle>Try Out New Glassess</CardTitle>
						<CardDescription>
							Upload your photo and select what frames you would like to try on
						</CardDescription>
					</CardHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<CardContent>
							<div className="flex flex-col gap-6">
								<form.Field
									name="photo"
									validators={{
										onSubmit: ({ value }) =>
											value ? undefined : "Please upload a CSV file",
									}}
								>
									{(field) => (
										<div className="grid gap-2">
											<div className="min-w-[240px] flex-1 space-y-1.5">
												<Label>Photo</Label>
												<form.Subscribe
													selector={(state) => state.isSubmitting}
												>
													{(isSubmitting) => (
														<FileUpload
															maxFiles={2}
															maxSize={10 * 1024 * 1024}
															accept=".jpg, .jpeg, .png"
															className="w-full"
															value={
																field.state.value ? [field.state.value] : []
															}
															onValueChange={(files: File[]) =>
																field.handleChange(files[0] ?? null)
															}
															disabled={isSubmitting}
														>
															<FileUploadDropzone className="py-3">
																<div className="flex items-center gap-2">
																	<Upload className="size-4 text-muted-foreground" />
																	<span className="text-sm">Drop photo or</span>
																	<FileUploadTrigger asChild>
																		<Button
																			variant="link"
																			size="sm"
																			className="h-auto p-0"
																			type="button"
																		>
																			browse
																		</Button>
																	</FileUploadTrigger>
																</div>
															</FileUploadDropzone>
															<FileUploadList className="gap-1">
																{field.state.value ? (
																	<FileUploadItem
																		value={field.state.value}
																		className="p-2"
																	>
																		<FileUploadItemPreview className="size-8" />
																		<FileUploadItemMetadata size="sm" />
																		<FileUploadItemDelete asChild>
																			<Button
																				variant="ghost"
																				size="icon"
																				className="size-6"
																				type="button"
																			>
																				<X className="size-3" />
																			</Button>
																		</FileUploadItemDelete>
																	</FileUploadItem>
																) : null}
															</FileUploadList>
														</FileUpload>
													)}
												</form.Subscribe>
												{field.state.meta.errors[0] != null ? (
													<p className="text-sm text-destructive">
														{String(field.state.meta.errors[0])}
													</p>
												) : null}
											</div>
										</div>
									)}
								</form.Field>
								<form.Field name="frameType">
									{(field) => (
										<>
											<div className="grid gap-2">
												<div className="flex items-center">
													<Label>Select frame (hover previews)</Label>
												</div>
												<p className="text-xs text-muted-foreground">
													Chosen type:{" "}
													<span className="text-foreground">
														{FRAME_TYPES[field.state.value].name}
													</span>
												</p>

												<div className="flex w-max items-center gap-4 pb-1">
													{frameTypeEntries.map(([key, spec]) => {
														const thumb = spec.images[0];
														return (
															<Tooltip key={key}>
																<TooltipTrigger asChild>
																	<button
																		type="button"
																		className={`rounded-md border p-2 shadow-xs transition-colors ${
																			field.state.value === key
																				? "ring-2 ring-primary ring-offset-2 ring-offset-background"
																				: "opacity-90 hover:opacity-100"
																		}`}
																		onClick={() => field.handleChange(key)}
																	>
																		<img
																			src={thumb}
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
																		<span className="font-medium">
																			{spec.name}
																		</span>
																		<span className="text-muted-foreground">
																			{" "}
																			— {spec.description}
																		</span>
																	</p>
																	<div className="flex gap-2">
																		{spec.images.map((src) => (
																			<div
																				key={src}
																				className="rounded border bg-background p-1.5"
																			>
																				<img
																					src={src}
																					alt=""
																					className="size-16 object-contain"
																				/>
																			</div>
																		))}
																	</div>
																</TooltipContent>
															</Tooltip>
														);
													})}
												</div>

												{field.state.meta.errors[0] != null ? (
													<p className="text-sm text-destructive">
														{String(field.state.meta.errors[0])}
													</p>
												) : null}
											</div>
										</>
									)}
								</form.Field>
							</div>
						</CardContent>
						<CardFooter className="flex-col gap-2 pt-8">
							<form.Subscribe selector={(state) => state.isSubmitting}>
								{(isSubmitting) => (
									<>
										<Button
											type="submit"
											className="w-full"
											disabled={isSubmitting}
										>
											Get
										</Button>
									</>
								)}
							</form.Subscribe>
						</CardFooter>
					</form>
				</Card>
			</div>
		</TooltipProvider>
	);
}

export const Route = createFileRoute("/")({ component: Home });
