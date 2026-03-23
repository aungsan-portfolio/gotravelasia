import app from "../server/_core/index.js";

export default (req: any, res: any) => {
  try {
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ 
      error: "Express Initialization Failed", 
      message: err?.message || "Unknown error",
      stack: err?.stack
    });
  }
};
