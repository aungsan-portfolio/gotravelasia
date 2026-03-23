// Build: 2026-03-23 23:08:09
export default async (req, res) => { try { const { default: app } = await import('../server/_core/index.js'); return app(req, res); } catch (err) { res.status(500).json({ error: 'DYNAMIC_IMPORT_FAILED', msg: err.message, stack: err.stack }); } };
