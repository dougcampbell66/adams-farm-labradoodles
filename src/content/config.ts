import { defineCollection, z } from 'astro:content';

const dogs = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.enum(['sire', 'dam']),
    status: z.enum(['active', 'retired']).default('active'),
    registeredName: z.string().optional(),
    regNumber: z.string().optional(),
    color: z.string().optional(),
    microchip: z.string().optional(),
    parents: z.string().optional(),
    coi: z.string().optional(),
    healthTests: z.array(z.object({
      test: z.string(),
      date: z.string(),
      result: z.string()
    })).optional(),
    gallery: z.array(z.string()).optional(),
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
    description: z.string().optional()
  })
});

const puppies = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    collar: z.string().optional(),
    status: z.enum(['available', 'reserved']),
    sex: z.enum(['Male', 'Female']).optional(),
    photo: z.string(),
    litter: z.string()
  })
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    family: z.string(),
    year: z.string().nullish(),
    quote: z.string(),
    featured: z.boolean().default(false)
  })
});

export const collections = { dogs, litters, puppies, testimonials };
