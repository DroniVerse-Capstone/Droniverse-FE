export type PredefinedModel = {
    id: string;
    name: string;
    url: string;
    defaultScale: number;
    previewScale?: number;
    minScale: number;
    maxScale: number;
    scalable?: boolean;
    rotatable?: boolean;
    collisionRadius?: number;
    category?: "drone" | "obstacle" | "decor";
};

export const PREDEFINED_MODELS: PredefinedModel[] = [
    {
        id: "drone",
        name: "Drone",
        url: "primitive:drone",
        defaultScale: 1.5,
        previewScale: 0.4,
        minScale: 1,
        maxScale: 1,
        scalable: false,
        rotatable: false,
        category: "drone",
    },
    {
        id: "box",
        name: "Box",
        url: "primitive:box",
        defaultScale: 2,
        previewScale: 0.3,
        minScale: 2,
        maxScale: 4.5,
        scalable: true,
        rotatable: true,
        collisionRadius: 0.5,
        category: "obstacle",
    },
    {
        id: "tree",
        name: "Tree",
        url: "primitive:tree",
        defaultScale: 40,
        previewScale: 0.5,
        minScale: 30,
        maxScale: 100,
        scalable: true,
        rotatable: true,
        collisionRadius: 0.6,
        category: "decor",
    },
    // // extra entries for scroll testing (unique ids, same preview primitive where needed)
    // {
    //     id: "box-01",
    //     name: "Box Variant 01",
    //     url: "primitive:box",
    //     defaultScale: 1.8,
    //     previewScale: 0.28,
    //     minScale: 1,
    //     maxScale: 3,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.5,
    //     category: "obstacle",
    // },
    // {
    //     id: "box-02",
    //     name: "Box Variant 02",
    //     url: "primitive:box",
    //     defaultScale: 1.6,
    //     previewScale: 0.26,
    //     minScale: 0.8,
    //     maxScale: 2.8,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.45,
    //     category: "obstacle",
    // },
    // {
    //     id: "box-03",
    //     name: "Box Variant 03 - Long name test",
    //     url: "primitive:box",
    //     defaultScale: 1.4,
    //     previewScale: 0.26,
    //     minScale: 0.6,
    //     maxScale: 2.6,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.45,
    //     category: "obstacle",
    // },
    // {
    //     id: "decor-01",
    //     name: "Decor Piece A",
    //     url: "primitive:box",
    //     defaultScale: 0.9,
    //     previewScale: 0.22,
    //     minScale: 0.5,
    //     maxScale: 1.6,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.35,
    //     category: "decor",
    // },
    // {
    //     id: "decor-02",
    //     name: "Decor Piece B",
    //     url: "primitive:box",
    //     defaultScale: 1.1,
    //     previewScale: 0.24,
    //     minScale: 0.6,
    //     maxScale: 1.8,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.4,
    //     category: "decor",
    // },
    // {
    //     id: "obj-wood-crate",
    //     name: "Wood Crate",
    //     url: "primitive:box",
    //     defaultScale: 1,
    //     previewScale: 0.25,
    //     minScale: 0.6,
    //     maxScale: 2,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.5,
    //     category: "obstacle",
    // },
    // {
    //     id: "obj-barrel",
    //     name: "Barrel",
    //     url: "primitive:box",
    //     defaultScale: 1,
    //     previewScale: 0.24,
    //     minScale: 0.6,
    //     maxScale: 1.8,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.45,
    //     category: "obstacle",
    // },
    // {
    //     id: "obj-sign",
    //     name: "Small Sign",
    //     url: "primitive:box",
    //     defaultScale: 0.8,
    //     previewScale: 0.2,
    //     minScale: 0.5,
    //     maxScale: 1.5,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.35,
    //     category: "decor",
    // },
    // {
    //     id: "obj-bench",
    //     name: "Park Bench Long Name Example",
    //     url: "primitive:box",
    //     defaultScale: 1.2,
    //     previewScale: 0.24,
    //     minScale: 0.8,
    //     maxScale: 1.6,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.5,
    //     category: "decor",
    // },
    // {
    //     id: "obj-pillar",
    //     name: "Stone Pillar",
    //     url: "primitive:box",
    //     defaultScale: 1.5,
    //     previewScale: 0.26,
    //     minScale: 1,
    //     maxScale: 2.4,
    //     scalable: true,
    //     rotatable: true,
    //     collisionRadius: 0.6,
    //     category: "decor",
    // },
];

export type Category = {
    id: string;
    name: string;
    icon: string;
    models: PredefinedModel[];
};

export function buildModelCategories(): Category[] {
    const mappingIcon: Record<string, string> = {
        all: "●",
        drone: "✈",
        obstacle: "■",
        decor: "✿",
        uncategorized: "●",
    };
    const groups: Record<string, PredefinedModel[]> = {};
    for (const m of PREDEFINED_MODELS) {
        const key = m.category ?? "uncategorized";
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
    }
    const cats: Category[] = [
        { id: "all", name: "All", icon: mappingIcon.all, models: PREDEFINED_MODELS },
    ];
    for (const k of Object.keys(groups)) {
        cats.push({
            id: k,
            name: k[0].toUpperCase() + k.slice(1),
            icon: mappingIcon[k] ?? "●",
            models: groups[k],
        });
    }
    return cats;
}


