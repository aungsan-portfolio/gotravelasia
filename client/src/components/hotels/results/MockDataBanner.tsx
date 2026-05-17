import { AlertTriangle } from "lucide-react";

export function MockDataBanner() {
  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-bold text-amber-900">
            Development Mode (Mock Data)
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            You are viewing static sample data because live hotel inventory is currently disabled or unavailable. Prices and availability are not real.
          </p>
        </div>
      </div>
    </div>
  );
}
