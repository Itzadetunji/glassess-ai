import { createServerFn } from "@tanstack/react-start";

export type HelloWorldResponse = { message: string };

export const getHelloWorldJson = createServerFn({
	method: "GET",
}).handler(async (): Promise<HelloWorldResponse> => {
	return { message: "hello world" };
});
