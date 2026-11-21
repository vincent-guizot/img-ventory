import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// jsdom lacks these browser APIs used by the upload queue.
if (!URL.createObjectURL) URL.createObjectURL = () => "blob:preview";
if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
