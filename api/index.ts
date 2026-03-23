export default (req: any, res: any) => {
  res.json({ hello: "from vercel", timestamp: new Date().toISOString() });
};
