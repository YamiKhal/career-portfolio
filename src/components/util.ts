import { twMerge } from "tailwind-merge";

export function joinClass(...classes: Array<string | false | undefined | null>) {
	return twMerge(classes.filter(Boolean) as string[]);
}