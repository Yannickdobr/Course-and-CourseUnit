"use client";

import { computeRevenue } from "@/types/studio";
import styles from "./PircingPanel.module.css";

interface Props {
  priceFull: number;
  promoCode: string;
  onChange: (patch: { priceFull?: number; promoCode?: string }) => void;
}

export default function PricingPanel({ priceFull, promoCode, onChange }: Props) {
  const revenue = computeRevenue(priceFull);
  const fmt = (n: number) => n.toLocaleString("fr-FR") + " XAF";

  return (
    <div className={styles.wrap}>
      {/* Inputs */}
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="priceFull" className={styles.label}>
            Prix cours complet
          </label>
          <div className={styles.inputWrap}>
            <input
              id="priceFull"
              type="number"
              min={0}
              step={500}
              value={priceFull}
              onChange={(e) => onChange({ priceFull: Math.max(0, Number(e.target.value)) })}
              className={styles.input}
            />
            <span className={styles.unit}>XAF</span>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="promoCode" className={styles.label}>
            Code promo actif
          </label>
          <input
            id="promoCode"
            type="text"
            value={promoCode}
            placeholder="Ex : LAUNCH30"
            onChange={(e) => onChange({ promoCode: e.target.value.toUpperCase() })}
            className={styles.inputFull}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summary}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Prix affiché</p>
          <p className={styles.cardVal}>{fmt(priceFull)}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Votre revenu (70%)</p>
          <p className={`${styles.cardVal} ${styles.green}`}>{fmt(revenue)}</p>
        </div>
      </div>

      <p className={styles.hint}>
        <i className="ti ti-info-circle" aria-hidden="true" style={{ marginRight: 5 }} />
        La plateforme prélève 30% sur chaque vente. Les formateurs Premium bénéficient de 80% (−20%).
      </p>
    </div>
  );
}
