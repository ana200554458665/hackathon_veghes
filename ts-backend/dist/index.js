"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.send("Heii din backend TypeScript! ");
});
app.listen(port, () => {
    console.log(`Server pornit pe http://localhost:${port}`);
});
