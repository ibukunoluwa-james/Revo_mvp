export interface ReceiptData {
  receiptId: string;
  amount: number;
  streamName: string;
  payerPhone: string;
  time: string;
}

/** Green-check receipt summary for the most recent collection. */
export default function ReceiptCard({ receipt }: { receipt: ReceiptData | null }) {
  if (!receipt) {
    return (
      <div className="bg-white rounded-xl border border-rg-border p-5">
        <p className="text-[11px] font-medium text-rg-text-muted uppercase tracking-[.05em] mb-3">
          Last receipt
        </p>
        <div className="py-8 text-center">
          <div className="w-11 h-11 rounded-full bg-rg-page border border-rg-border flex items-center justify-center mx-auto mb-3">
            <i
              className="ti ti-receipt text-rg-text-muted text-[18px]"
              aria-hidden="true"
            />
          </div>
          <p className="text-[13px] text-rg-text-muted">
            No collection recorded yet.
          </p>
        </div>
      </div>
    );
  }

  const rows: { label: string; value: string; gold?: boolean; teal?: boolean }[] =
    [
      {
        label: "Amount",
        value: `₦${receipt.amount.toLocaleString()}`,
        gold: true,
      },
      { label: "Type", value: receipt.streamName },
      { label: "Payer", value: receipt.payerPhone },
      { label: "Status", value: "Synced", teal: true },
    ];

  return (
    <div className="bg-white rounded-xl border border-rg-border p-5">
      <p className="text-[11px] font-medium text-rg-text-muted uppercase tracking-[.05em] mb-3">
        Last receipt
      </p>

      <div className="w-11 h-11 rounded-full bg-emerald-50 border-[1.5px] border-rg-teal flex items-center justify-center mx-auto mb-3">
        <i
          className="ti ti-check text-rg-teal text-[18px]"
          aria-hidden="true"
        />
      </div>

      <p className="text-[15px] font-medium text-rg-text-primary text-center mb-0.5">
        Collection recorded
      </p>
      <p className="text-[12px] text-rg-text-muted text-center mb-4">
        SMS sent to taxpayer · {receipt.time}
      </p>

      <div className="text-center px-4 py-3 bg-rg-gold-bg rounded-[8px] border border-rg-gold-border mb-3.5">
        <p className="text-[10px] text-amber-700 uppercase tracking-[.1em] mb-1">
          Receipt ID
        </p>
        <p className="text-[22px] font-medium text-rg-gold-text tracking-widest font-mono">
          {receipt.receiptId}
        </p>
      </div>

      {rows.map(({ label, value, gold, teal }) => (
        <div
          key={label}
          className="flex justify-between py-2 border-b border-rg-border-light last:border-0 text-[13px]"
        >
          <span className="text-rg-text-muted">{label}</span>
          <span
            className={`font-medium ${
              gold
                ? "text-rg-gold-text"
                : teal
                  ? "text-rg-teal"
                  : "text-rg-text-primary"
            }`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
