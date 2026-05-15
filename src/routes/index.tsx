import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Upload, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HomeFormValues = {
	csvFile: File | null;
	password: string;
};

const defaultHomeFormValues: HomeFormValues = {
	csvFile: null,
	password: "",
};

export function Home() {
	const form = useForm({
		defaultValues: defaultHomeFormValues,
		onSubmit: async () => {
			// Hook for upload + auth flow later
		},
	});

	return (
		<div className="flex-1 flex flex-col items-center justify-center">
			<Card className="w-full max-w-sm">
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
								name="csvFile"
								validators={{
									onSubmit: ({ value }) =>
										value ? undefined : "Please upload a CSV file",
								}}
							>
								{(field) => (
									<div className="grid gap-2">
										<div className="min-w-[240px] flex-1 space-y-1.5">
											<Label>Photo</Label>
											<form.Subscribe selector={(state) => state.isSubmitting}>
												{(isSubmitting) => (
													<FileUpload
														maxFiles={1}
														maxSize={10 * 1024 * 1024}
														accept=".jpg, .jpeg, .png"
														className="w-full"
														value={field.state.value ? [field.state.value] : []}
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
							<form.Field
								name="password"
								validators={{
									onSubmit: ({ value }) =>
										value.trim().length > 0
											? undefined
											: "Password is required",
								}}
							>
								{(field) => (
									<div className="grid gap-2">
										<div className="flex items-center">
											<Label htmlFor="password">Password</Label>
											<a
												href="/forgot-password"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</a>
										</div>
										<Input
											id="password"
											type="password"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors[0] != null ? (
											<p className="text-sm text-destructive">
												{String(field.state.meta.errors[0])}
											</p>
										) : null}
									</div>
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
										Login
									</Button>
								</>
							)}
						</form.Subscribe>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}

export const Route = createFileRoute("/")({ component: Home });
