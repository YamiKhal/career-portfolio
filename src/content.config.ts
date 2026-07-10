import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const root = defineCollection({
    loader: glob({ base: './src/content/root', pattern: '**/*.{md,mdx}'}),
    schema: z.object({
        headerIntro: z.string(),
        headerLocation: z.string(),
        headerAge: z.string(),
        headerExp: z.string()
    })
})

export const collections = {
    root
}