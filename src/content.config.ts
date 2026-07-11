import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		date: z.string().transform((s) => {
			const [day, month, year] = s.split("/");
			return new Date(`${year}-${month}-${day}`);
		}),
	}),
});

export const collections = {
	blog,
};
