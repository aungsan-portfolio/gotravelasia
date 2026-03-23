export default (req: any, res: any) => {
  res.json({ debug: "VERSION_3_DESTRUCTIVE_CHECK", now: new Date().toISOString() });
};
