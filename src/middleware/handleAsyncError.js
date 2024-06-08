







 export const handleError = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
