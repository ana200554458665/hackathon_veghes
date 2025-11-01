import { Router, Request, Response } from "express";

const router = Router();
const scores: { game: string; user: string; score: number }[] = [];

// ✅ Trimite toate scorurile (GET /api/scores)
router.get("/", (_req: Request, res: Response) => {
  res.json(scores);
});

// ✅ Primește un scor nou (POST /api/scores)
router.post("/", (req: Request, res: Response) => {
  const { game, user, score } = req.body;
  if (!game || !user || typeof score !== "number") {
    return res.status(400).json({ error: "game, user și score sunt obligatorii" });
  }
  scores.push({ game, user, score });
  res.status(201).json({ message: "Scor salvat!" });
});

export default router;
