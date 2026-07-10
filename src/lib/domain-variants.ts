export type DomainVariant = "career" | "yamikhal";

export type VariantData = {
    type: string;
    displayName: string;
    description: string;
};

export function getDomainVariant(url: URL): DomainVariant {
    const host = url.hostname.split(".");
    if (host[0] === "career") return "career";
    return "yamikhal";
}

export function getVariantData(host: DomainVariant): VariantData {
    return variants[host] ?? variants.yamikhal;
}

export function getVariantFromDomain(url: URL): VariantData {
    const variant = getDomainVariant(url);
    return getVariantData(variant);
}

export const variants = {
    career: {
        type: "career",
        displayName: "Yamen Khalili",
        description: "Learn about projects made by Yamen Khalili"
    },
    yamikhal: {
        type: "yamikhal",
        displayName: "YamiKhal",
        description: "Learn about projects made by YamiKhal"
    }
} satisfies Record<DomainVariant, VariantData>