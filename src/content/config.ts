import { defineCollection, z } from 'astro:content';

const dogs = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.enum(['sire', 'dam']),
    birthdate: z.string(),
    photo: z.string(),
    hipScore: z.string().optional(),
    dnaPanel: z.string().optional(),
    description: z.string()
  })
});

const litters = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    sire: z.string(),
    dam: z.string(),
    birthdate: z.string(),
    readyDate: z.string(),
    status: z.enum(['available', 'reserved', 'planned', 'past']),
    puppyCount: z.number().optional(),
    availableCount: z.number().optional(),
    photos: z.array(z.string()).default([]),
    description: z.string()
  })
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    family: z.string(),
    year: z.string(),
    quote: z.string(),
    featured: z.boolean().default(false)
  })
});

export const collections = { dogs, litters, testimonials };
