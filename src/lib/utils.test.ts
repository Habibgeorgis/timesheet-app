import { describe,expect,it } from "vitest";
import { formatDuration,initials } from "./utils";
describe("display helpers",()=>{it("formats whole and partial hours",()=>{expect(formatDuration(480)).toBe("8h");expect(formatDuration(495)).toBe("8h 15m")});it("creates compact initials",()=>{expect(initials("Alex Morgan")).toBe("AM");expect(initials("Maya Chen Patel")).toBe("MC")})});
