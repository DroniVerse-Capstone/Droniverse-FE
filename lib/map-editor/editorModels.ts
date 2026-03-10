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
    hasColor?: boolean;
    collisionRadius?: number;
    category?: "drone" | "obstacle" | "decor" | "goal" | "bonus" | "checkpoint";
    constraints: ModelConstraints;
    defaultScoreValue?: number;  // for bonus items
    defaultRadius?: number;      // for checkpoints
};

export type AxisConstraint = {
    enabled: boolean;
    min?: number;
    max?: number;
    locked?: boolean;
    lockedValue?: number;
};

export type ModelConstraints = {
    translate: {
        x: AxisConstraint;
        y: AxisConstraint;
        z: AxisConstraint;
    };
    rotate: {
        x: AxisConstraint;
        y: AxisConstraint;
        z: AxisConstraint;
    };
    scale: {
        uniform: boolean;
        x: AxisConstraint;
        y: AxisConstraint;
        z: AxisConstraint;
    };
};

export type MapObject = {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    modelUrl: string;
    color?: string;
    collisionRadius?: number;
    scaleLimits?: { min: number; max: number };
    scalable?: boolean;
    rotatable?: boolean;
    isClamped?: boolean;
    // Extended fields
    objectType?: "obstacle" | "bonus" | "checkpoint";
    scoreValue?: number;   // bonus items only
    radius?: number;       // checkpoints only (drives visual ring size)
};

export const MAX_ALTITUDE = 50;

export function applyConstraints(
    obj: MapObject,
    constraints: ModelConstraints,
    mapHalfSize: number
): MapObject {
    let [px, py, pz] = obj.position;
    let [rx, ry, rz] = obj.rotation;
    let [sx, sy, sz] = obj.scale;

    const tc = constraints.translate;
    const rc = constraints.rotate;
    const sc = constraints.scale;

    // 1. Scale constraints
    if (!sc.x.enabled) {
        sx = obj.scale[0];
    } else {
        if (sc.x.min !== undefined) sx = Math.max(sc.x.min, sx);
        if (sc.x.max !== undefined) sx = Math.min(sc.x.max, sx);
    }

    if (!sc.y.enabled) {
        sy = obj.scale[1];
    } else {
        if (sc.y.min !== undefined) sy = Math.max(sc.y.min, sy);
        if (sc.y.max !== undefined) sy = Math.min(sc.y.max, sy);
    }

    if (!sc.z.enabled) {
        sz = obj.scale[2];
    } else {
        if (sc.z.min !== undefined) sz = Math.max(sc.z.min, sz);
        if (sc.z.max !== undefined) sz = Math.min(sc.z.max, sz);
    }

    if (sc.uniform && sc.x.enabled) {
        sy = sx;
        sz = sx;
    }

    const baseRadius = obj.collisionRadius ?? 1;
    const effectiveRadius = baseRadius * sx;
    const horizontalLimit = Math.max(0, mapHalfSize - effectiveRadius);

    // X
    if (tc.x.enabled) {
        if (tc.x.min !== undefined) px = Math.max(tc.x.min, px);
        if (tc.x.max !== undefined) px = Math.min(tc.x.max, px);
    }
    px = Math.max(-horizontalLimit, Math.min(horizontalLimit, px));

    // Z
    if (tc.z.enabled) {
        if (tc.z.min !== undefined) pz = Math.max(tc.z.min, pz);
        if (tc.z.max !== undefined) pz = Math.min(tc.z.max, pz);
    }
    pz = Math.max(-horizontalLimit, Math.min(horizontalLimit, pz));

    // Y (Altitude)
    if (tc.y.locked) {
        py = tc.y.lockedValue ?? 0;
    } else {
        if (tc.y.min !== undefined) py = Math.max(tc.y.min, py);
        if (tc.y.max !== undefined) py = Math.min(tc.y.max, py);
    }

    let finalFloor = tc.y.min ?? 0;
    if (obj.objectType === "bonus") {
        const animBuffer = 0.3;
        finalFloor = Math.max(finalFloor, effectiveRadius + animBuffer);
    }

    py = Math.max(finalFloor, Math.min(MAX_ALTITUDE, py));

    // 3. Rotation constraints
    if (rc.x.locked) rx = rc.x.lockedValue ?? 0;
    else if (!rc.x.enabled) rx = obj.rotation[0];

    if (rc.y.locked) ry = rc.y.lockedValue ?? 0;
    else if (!rc.y.enabled) ry = obj.rotation[1];

    if (rc.z.locked) rz = rc.z.lockedValue ?? 0;
    else if (!rc.z.enabled) rz = obj.rotation[2];

    if (rc.y.enabled) {
        if (rc.y.min !== undefined) ry = Math.max(rc.y.min, ry);
        if (rc.y.max !== undefined) ry = Math.min(rc.y.max, ry);
    }

    return {
        ...obj,
        position: [px, py, pz],
        rotation: [rx, ry, rz],
        scale: [sx, sy, sz],
    };
}

const DRONE_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, locked: true, lockedValue: 0 },
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: true },
        z: { enabled: false },
    },
    scale: {
        uniform: true,
        x: { enabled: false },
        y: { enabled: false },
        z: { enabled: false },
    },
};

const ROCK_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, locked: false }, // Rocks can be stacked or slightly varied
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: true },
        z: { enabled: false },
    },
    scale: {
        uniform: false,
        x: { enabled: true, min: 10, max: 40 },
        y: { enabled: true, min: 10, max: 40 },
        z: { enabled: true, min: 10, max: 40 },
    },
};

const TREE_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, locked: true, lockedValue: 0 },
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: true },
        z: { enabled: false },
    },
    scale: {
        uniform: false,
        x: { enabled: true, min: 30, max: 50 },
        y: { enabled: true, min: 30, max: 50 },
        z: { enabled: true, min: 30, max: 50 },
    },
};

const GRASS_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, locked: true, lockedValue: 0 },
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: true },
        z: { enabled: false },
    },
    scale: {
        uniform: true,
        x: { enabled: true, min: 0.5, max: 2 },
        y: { enabled: true, min: 0.5, max: 2 },
        z: { enabled: true, min: 0.5, max: 2 },
    },
};

const BOX_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, min: -0.5 },
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: true },
        z: { enabled: false },
    },
    scale: {
        uniform: false,
        x: { enabled: true, min: 2, max: 4.5 },
        y: { enabled: true, min: 2, max: 4.5 },
        z: { enabled: true, min: 2, max: 4.5 },
    },
};

const BONUS_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, min: 0 },
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: true },
        z: { enabled: false },
    },
    scale: {
        uniform: true,
        x: { enabled: true, min: 1, max: 3 },
        y: { enabled: true, min: 1, max: 3 },
        z: { enabled: true, min: 1, max: 3 },
    },
};

const CHECKPOINT_CONSTRAINTS: ModelConstraints = {
    translate: {
        x: { enabled: true },
        y: { enabled: true, min: 0, max: MAX_ALTITUDE },
        z: { enabled: true },
    },
    rotate: {
        x: { enabled: false },
        y: { enabled: false },
        z: { enabled: false },
    },
    scale: {
        uniform: true,
        x: { enabled: false },
        y: { enabled: false },
        z: { enabled: false },
    },
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
        rotatable: true,
        hasColor: false,
        collisionRadius: 0.8,
        category: "drone",
        constraints: DRONE_CONSTRAINTS,
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
        hasColor: true,
        collisionRadius: 1.0,
        category: "obstacle",
        constraints: BOX_CONSTRAINTS,
    },
    {
        id: "tree",
        name: "Tree 1",
        url: "primitive:tree",
        defaultScale: 40,
        previewScale: 1.5,
        minScale: 30,
        maxScale: 50,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 0.5,
        category: "decor",
        constraints: TREE_CONSTRAINTS,
    },
    {
        id: "tree2",
        name: "Tree 2",
        url: "primitive:tree2",
        defaultScale: 40,
        previewScale: 1.3,
        minScale: 30,
        maxScale: 50,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 0.5,
        category: "decor",
        constraints: TREE_CONSTRAINTS,
    },
    {
        id: "grass",
        name: "Grass",
        url: "primitive:grass",
        defaultScale: 1,
        previewScale: 2.8,
        minScale: 0.5,
        maxScale: 2,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 0,
        category: "decor",
        constraints: GRASS_CONSTRAINTS,
    },
    {
        id: "rock",
        name: "Rock",
        url: "primitive:rock",
        defaultScale: 20,
        previewScale: 2.5,
        minScale: 10,
        maxScale: 40,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 0.75,
        category: "decor",
        constraints: ROCK_CONSTRAINTS,
    },
    // ── Bonus Items ──────────────────────────────────────────
    {
        id: "diamond",
        name: "Diamond",
        url: "primitive:diamond",
        defaultScale: 2,
        previewScale: 1,
        minScale: 1,
        maxScale: 3,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 2.2,
        category: "bonus",
        defaultScoreValue: 20,
        constraints: BONUS_CONSTRAINTS,
    },
    {
        id: "star",
        name: "Star",
        url: "primitive:star",
        defaultScale: 2,
        previewScale: 1,
        minScale: 1,
        maxScale: 3,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 2.2,
        category: "bonus",
        defaultScoreValue: 40,
        constraints: BONUS_CONSTRAINTS,
    },
    {
        id: "heart",
        name: "Heart",
        url: "primitive:heart",
        defaultScale: 2,
        previewScale: 1,
        minScale: 1,
        maxScale: 3,
        scalable: true,
        rotatable: true,
        hasColor: false,
        collisionRadius: 2.0,
        category: "bonus",
        defaultScoreValue: 30,
        constraints: BONUS_CONSTRAINTS,
    },
    // ── Checkpoints ──────────────────────────────────────────
    {
        id: "checkpoint",
        name: "Checkpoint",
        url: "primitive:checkpoint",
        defaultScale: 1,
        previewScale: 1,
        minScale: 1,
        maxScale: 1,
        scalable: false,
        rotatable: false,
        hasColor: false,
        collisionRadius: 2,
        category: "checkpoint",
        defaultRadius: 5,
        constraints: CHECKPOINT_CONSTRAINTS,
    },
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
        goal: "⭐",
        bonus: "💎",
        checkpoint: "🔵",
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

export function getConstraintsForModel(modelUrl: string): ModelConstraints | null {
    const model = PREDEFINED_MODELS.find((m) => m.url === modelUrl);
    return model?.constraints ?? null;
}

export function getModelConfig(modelUrl: string): PredefinedModel | null {
    return PREDEFINED_MODELS.find((m) => m.url === modelUrl) ?? null;
}
