const MaterialTypes = {
    // to see supported materials: print superclasses[27].classes, and m = VRayMtl(); showProperties m;

    VRayMtl: {
        diffuse: "RGB color",
        diffuse_roughness: "float",
        selfIllumination: "RGB color",
        selfIllumination_gi: "boolean",
        selfIllumination_multiplier: "float",
        compensate_camera_exposure: "boolean",
        reflection: "RGB color",
        reflection_glossiness: "float",
        hilight_glossiness: "float",
        reflection_subdivs: "integer",
        reflection_fresnel: "boolean",
        reflection_maxDepth: "integer",
        reflection_exitColor: "RGB color",
        reflection_useInterpolation: "boolean",
        reflection_ior: "float",
        reflection_metalness: "float",
        reflection_lockGlossiness: "boolean",
        reflection_lockIOR: "boolean",
        reflection_dimDistance: "worldUnits",
        reflection_dimDistance_on: "boolean",
        reflection_dimDistance_falloff: "float",
        reflection_affectAlpha: "integer",
        refraction: "RGB color",
        refraction_glossiness: "float",
        refraction_subdivs: "integer",
        refraction_ior: "float",
        refraction_fogColor: "RGB color",
        refraction_fogMult: "float",
        refraction_fogBias: "float",
        refraction_affectShadows: "boolean",
        refraction_affectAlpha: "integer",
        refraction_maxDepth: "integer",
        refraction_exitColor: "RGB color",
        refraction_useExitColor: "boolean",
        refraction_useInterpolation: "boolean",
        refraction_dispersion: "float",
        refraction_dispersion_on: "boolean",
        translucency_on: "integer",
        translucency_thickness: "worldUnits",
        translucency_scatterCoeff: "float",
        translucency_fbCoeff: "float",
        translucency_multiplier: "float",
        translucency_color: "RGB color",
        brdf_type: "integer",
        anisotropy: "float",
        anisotropy_rotation: "float",
        anisotropy_derivation: "integer",
        anisotropy_axis: "integer",
        anisotropy_channel: "integer",
        soften: "float",
        brdf_fixDarkEdges: "boolean",
        gtr_gamma: "float",
        gtr_oldGamma: "boolean",
        brdf_useRoughness: "boolean",
        option_traceDiffuse: "boolean",
        option_traceReflection: "boolean",
        option_traceRefraction: "boolean",
        option_doubleSided: "boolean",
        option_reflectOnBack: "boolean",
        option_useIrradMap: "boolean",
        refraction_fogUnitsScale_on: "boolean",
        option_traceDiffuseAndGlossy: "integer",
        option_cutOff: "float",
        preservationMode: "integer",
        option_environment_priority: "integer",
        effect_id: "integer",
        override_effect_id: "boolean",
        option_clampTextures: "boolean",
        option_opacityMode: "integer",
        option_glossyFresnel: "boolean",
        texmap_diffuse: "texturemap",
        texmap_diffuse_on: "boolean",
        texmap_diffuse_multiplier: "float",
        texmap_reflection: "texturemap",
        texmap_reflection_on: "boolean",
        texmap_reflection_multiplier: "float",
        texmap_refraction: "texturemap",
        texmap_refraction_on: "boolean",
        texmap_refraction_multiplier: "float",
        texmap_bump: "texturemap",
        texmap_bump_on: "boolean",
        texmap_bump_multiplier: "float",
        texmap_reflectionGlossiness: "texturemap",
        texmap_reflectionGlossiness_on: "boolean",
        texmap_reflectionGlossiness_multiplier: "float",
        texmap_refractionGlossiness: "texturemap",
        texmap_refractionGlossiness_on: "boolean",
        texmap_refractionGlossiness_multiplier: "float",
        texmap_refractionIOR: "texturemap",
        texmap_refractionIOR_on: "boolean",
        texmap_refractionIOR_multiplier: "float",
        texmap_displacement: "texturemap",
        texmap_displacement_on: "boolean",
        texmap_displacement_multiplier: "float",
        texmap_translucent: "texturemap",
        texmap_translucent_on: "boolean",
        texmap_translucent_multiplier: "float",
        texmap_environment: "texturemap",
        texmap_environment_on: "boolean",
        texmap_hilightGlossiness: "texturemap",
        texmap_hilightGlossiness_on: "boolean",
        texmap_hilightGlossiness_multiplier: "float",
        texmap_reflectionIOR: "texturemap",
        texmap_reflectionIOR_on: "boolean",
        texmap_reflectionIOR_multiplier: "float",
        texmap_opacity: "texturemap",
        texmap_opacity_on: "boolean",
        texmap_opacity_multiplier: "float",
        texmap_roughness: "texturemap",
        texmap_roughness_on: "boolean",
        texmap_roughness_multiplier: "float",
        texmap_anisotropy: "texturemap",
        texmap_anisotropy_on: "boolean",
        texmap_anisotropy_multiplier: "float",
        texmap_anisotropy_rotation: "texturemap",
        texmap_anisotropy_rotation_on: "boolean",
        texmap_anisotropy_rotation_multiplier: "float",
        texmap_refraction_fog: "texturemap",
        texmap_refraction_fog_on: "boolean",
        texmap_refraction_fog_multiplier: "float",
        texmap_self_illumination: "texturemap",
        texmap_self_illumination_on: "boolean",
        texmap_self_illumination_multiplier: "float",
        texmap_gtr_tail_falloff: "texturemap",
        texmap_gtr_tail_falloff_on: "boolean",
        texmap_gtr_tail_falloff_multiplier: "float",
        texmap_metalness: "texturemap",
        texmap_metalness_on: "boolean",
        texmap_metalness_multiplier: "float",
        reflect_minRate: "integer",
        reflect_maxRate: "integer",
        reflect_interpSamples: "integer",
        reflect_colorThreshold: "float",
        reflect_normalThreshold: "float",
        refract_minRate: "integer",
        refract_maxRate: "integer",
        refract_interpSamples: "integer",
        refract_colorThreshold: "float",
        refract_normalThreshold: "float"
    }
}

const threeJsColorMaterialProps = ["color", "specular", "emissive"];

const numberToRGBColor = function(value: number): string {
    //console.log(` >> numberToRGBColor: `, value);
    let i = Math.round(255 * value); // round it to int
    if (i < 0) i = 0; // clamp
    if (i > 255) i = 255; // clamp
    // i = 255 - i; // todo: hey, why did we have it before?!
    return `color ${i} ${i} ${i}`;
}

const numberToMaxScript = function(value: number, paramTypeDef: string): string|Error {
    //console.log(` >> numberToMaxScript: `, value, paramTypeDef);
    if (isNaN(value) || !isFinite(value)) {
        return new Error("Can't convert to maxscript: " + value);
    }

    if (paramTypeDef === "float") {
        return `${value}`; // return as is
    } else if (paramTypeDef === "integer") {
        const i = Math.floor(value) // truncate to int
        return `${i}`;
    } else if (paramTypeDef === "boolean") {
        const i = Math.floor(value); // truncate to int
        const b = !!i; // and convert to boolean
        return `${b}`;
    } else if (paramTypeDef === "RGB color") {
        return numberToRGBColor(value);
    } else {
        return new Error("Can't convert given value to material property type: " + value + " => " + paramTypeDef);
    }
}

const booleanToMaxScript = function(value: boolean, paramTypeDef: string): string|Error {
    //console.log(` >> booleanToMaxScript: `, value, paramTypeDef);
    if (paramTypeDef === "boolean") {
        return `${value}`; // return as is
    } else if (paramTypeDef === "float" || paramTypeDef === "integer") {
        const v = value ? 1 : 0;
        return `${v}`; // return as number
    } else if (paramTypeDef === "RGB color") {
        let c = value ? 255 : 0;
        return `color ${c} ${c} ${c}`;
    } else {
        return new Error("Can't convert given value to material property type: " + value + " => " + paramTypeDef);
    }
}

const parseMaterialProperty = function(materialType: string, paramName: string, anyValue: any, materialThreeJson: any): string|Error {
    const materialTypeDef = MaterialTypes[materialType];
    if (!materialTypeDef) {
        return new Error("Unknown materialType: " + materialType);
    }

    const paramTypeDef = materialTypeDef[paramName];
    if (!paramTypeDef) {
        return new Error("Unknown parameter: " + materialType + "." + paramName);
    }

    if (typeof anyValue === "number") {
        return numberToMaxScript(anyValue, paramTypeDef);
    }

    if (typeof anyValue === "boolean") {
        return booleanToMaxScript(anyValue, paramTypeDef);
    }

    if (typeof anyValue !== "string") {
        return new Error("Unsupported value type: " + anyValue + ", " + (typeof anyValue));
    }

    const strValue: string = anyValue;

    let unresolved = [];
    let parts = strValue
        .split(" ")
        .map(p => {
            if (p.startsWith("$.")) {
                const key = p.replace("$.", "");
                const value = materialThreeJson[key];
                //console.log(` >> \"${key}\" => \"${value}\"`)
                if (threeJsColorMaterialProps.includes(key) && paramTypeDef === "RGB color") {
                    let color = {
                        r: (value >> 16) & 0xFF,
                        g: (value >> 8)  & 0xFF,
                        b: (value)       & 0xFF,
                        type: "__rgb",
                    };
                    return color;
                } else {
                    if (value === null || value === undefined) {
                        unresolved.push(p);
                        return null;
                    } else {
                        return value;
                    }
                }
            } else {
                return p;
            }
        });

    //console.log(` >> parts: `, parts);
    
    if (unresolved.length > 0) {
        return new Error("Can't resolve references: " + unresolved.join(", "));
    }

    switch (paramTypeDef) {
        case "integer":
            {
                if (parts.length > 1) {
                    return new Error("Can't convert to integer: " + strValue);
                }
                const p0 = parseFloat(parts[0]);
                if (isNaN(p0) || !isFinite(p0)) {
                    return new Error("Can't parse to integer: " + strValue);
                }
                const i0 = Math.floor(p0);
                return `${i0}`;
            }
        case "float":
            {
                if (parts.length > 1) {
                    return new Error("Can't convert to float: " + strValue);
                }
                const p0 = parseFloat(parts[0]);
                if (isNaN(p0) || !isFinite(p0)) {
                    return new Error("Can't parse to float: " + strValue);
                }
                return `${p0}`;
            }
        case "boolean":
            {
                if (parts.length > 1) {
                    return new Error("Can't convert to boolean: " + strValue);
                }
                if (parts[0].toLocaleLowerCase() === "true") {
                    return "true";
                } else if (parts[0].toLocaleLowerCase() === "false") {
                    return "false";
                } else {
                    return new Error("Can't parse to boolean: " + strValue);
                }
            }
        case "texturemap":
            {
                return new Error("Not implemented: " + strValue + " => " + paramTypeDef);
            }
        case "RGB color":
            {
                if (parts.length > 0 && parts[0] === "color") {
                    parts.shift();
                }
                if (parts.length !== 1 && parts.length !== 3) {
                    return new Error("Can't convert to RGB Color: " + strValue);
                }
                if (parts.length === 1 && typeof parts[0] === "object" && parts[0].type === "__rgb") {
                    const p0 = parts[0];
                    return `color ${p0.r} ${p0.g} ${p0.b}`;
                }
                if (parts.length === 1 && typeof parts[0] === "string") {
                    const p0 = parts[0];
                    return `color ${p0} ${p0} ${p0}`;
                }
                if (!parts.every(e => typeof e === "number" || typeof e === "string" || typeof e === "boolean")) {
                    return new Error("Can't convert to RGB Color: " + strValue);
                }

                const res: any[] = parts.map(p => {
                    if (typeof p === "number") {
                        return numberToMaxScript(p, paramTypeDef);
                    } else if (typeof p === "boolean") {
                        return booleanToMaxScript(p, paramTypeDef);
                    } else if (typeof p === "string") {
                        const v = parseFloat(p);
                        let i = Math.floor(v); // truncate to int
                        if (i < 0) i = 0; // clamp
                        if (i > 255) i = 255; // clamp
                        return `${i}`;
                    } else {
                        console.log(" ERROR | Can't convert to RGB Color component: " + p + " strValue: " + strValue);
                        return "0";
                    }
                });

                if (res[0] !== "color" && !res[0].startsWith("color")) {
                    res.unshift("color");
                }

                return res.join(" ");
            }
        default:
            return new Error("Unsupported param type: " + paramTypeDef);
    }
}

export { parseMaterialProperty }