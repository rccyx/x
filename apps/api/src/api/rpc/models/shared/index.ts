import { z } from "zod";

export const id = z.string().min(1).max(255);
export const email = z.string().email().max(255);
export const slug = z.string().min(1).max(255);
export const token = z.string().min(1).max(255);
