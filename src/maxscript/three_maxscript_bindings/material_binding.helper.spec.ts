import "reflect-metadata";
import { parseMaterialProperty } from "./material_binding.helper";

require("../../jasmine.config")();

describe("MaterialBindingHelper", function() {

    describe("test1", function() {
        beforeEach(async function() {
        });
    
        afterEach(async function() {
        })

        it("checks that wrong type is rejected", function() {
            const res: any = parseMaterialProperty("1", "2", 3, {});
            expect(res).toBeTruthy();
            expect(res.message).toBe("Unknown materialType: 1");
        });

        it("checks that wrong type is rejected", function() {
            const res: any = parseMaterialProperty("VRayMtl", "applyGamma", 3, {});
            expect(res).toBeTruthy();
            expect(res.message).toBe("Unknown parameter: VRayMtl.applyGamma");
        });

        it("checks that number is converted to diffuse color and clamped", function() {
            const res1: any = parseMaterialProperty("VRayMtl", "diffuse", 1.01, {});
            expect(res1).toBeTruthy();
            expect(res1).toBe("color 255 255 255");

            const res2: any = parseMaterialProperty("VRayMtl", "diffuse", -1000, {});
            expect(res2).toBeTruthy();
            expect(res2).toBe("color 0 0 0");
        });

        it("checks that string is converted to diffuse color", function() {
            const res: any = parseMaterialProperty("VRayMtl", "diffuse", "150", {});
            expect(res).toBeTruthy();
            expect(res).toBe("color 150 150 150");
        });

        it("checks that string of two numbers is rejected as RGB Color", function() {
            const res: any = parseMaterialProperty("VRayMtl", "diffuse", "150 120", {});
            expect(res).toBeTruthy();
            expect(res.message).toBe("Can't convert to RGB Color: 150 120");
        });

        it("checks that string of three numbers is rejected as RGB Color", function() {
            const res: any = parseMaterialProperty("VRayMtl", "diffuse", "10 12 103", {});
            expect(res).toBeTruthy();
            expect(res).toBe("color 10 12 103");
        });

        it("checks that string of three numbers is rejected as RGB Color", function() {
            const res: any = parseMaterialProperty("VRayMtl", "diffuse", "color 10 12 103", {});
            expect(res).toBeTruthy();
            expect(res).toBe("color 10 12 103");
        });

        it("checks that $.color is resolved as RGB Color", function() {
            const res: any = parseMaterialProperty("VRayMtl", "diffuse", "$.color", { color: 0xFF00AC });
            expect(res).toBeTruthy();
            expect(res).toBe("color 255 0 172");
        });

        it("checks that $.color, $.specular and $.emissive are resolved to RGB Color", function() {
            const res0: any = parseMaterialProperty("VRayMtl", "diffuse", "$.color", { color: 0xFF00AC });
            expect(res0).toBeTruthy();
            expect(res0).toBe("color 255 0 172");

            const res1: any = parseMaterialProperty("VRayMtl", "reflection_exitColor", "$.specular", { specular: 0xDD0102 });
            expect(res1).toBeTruthy();
            expect(res1).toBe("color 221 1 2");

            const res2: any = parseMaterialProperty("VRayMtl", "selfIllumination", "$.emissive", { emissive: 0x0305EE });
            expect(res2).toBeTruthy();
            expect(res2).toBe("color 3 5 238");
        });

        it("checks that $.value can be included into RGB Color", function() {
            const res0: any = parseMaterialProperty("VRayMtl", "refraction", "$.opacity", { opacity: 0.9 });
            expect(res0).toBeTruthy();
            expect(res0).toBe("color 230 230 230");
        });

    });
});
