"use client";

import { useState } from "react";
import styles from "./WithdrawForm.module.css";

const METHODS = [
  { id: "orange", label: "Orange Money", icon: "ti-device-mobile" },
  { id: "mtn",    label: "MTN MoMo",     icon: "ti-device-mobile" },
  { id: "wave",   label: "Wave",         icon: "ti-wave-sine" },
  { id: "bank",   label: "Virement",     icon: "ti-building-bank" },
] as const;

const MIN_WITHDRAW = 5000;

export default function WithdrawForm({ balance }: { balance: number }) {
  const [method, setMethod] = useState<string>("orange");
  const [amount, setAmount] = useState<number>(0);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fmtXAF = (n: number) => n.toLocaleString("fr-FR") + " XAF";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (amount < MIN_WITHDRAW) {
      setError(`Le montant minimum de retrait est de ${fmtXAF(MIN_WITHDRAW)}.`);
      return;
    }
    if (amount > balance) {
      setError("Le montant dépasse votre solde disponible.");
      return;
    }
    if (account.trim().length < 6) {
      setError("Renseignez un numéro / compte valide.");
      return;
    }

    setLoading(true);
    try {
      /* await fetch("/api/studio/withdraw", { method:"POST", body: JSON.stringify({ method, amount, account }) }) */
      await new Promise((r) => setTimeout(r, 800));
      setSuccess(true);
      setAmount(0);
      setAccount("");
    } finally {
      setLoading(false);
    }
  }

  const isMobile = method !== "bank";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {success && (
        <p className={styles.success}>
          <i className="ti ti-circle-check" aria-hidden="true" />
          Demande de retrait envoyée ! Le versement sera traité sous 48h ouvrées.
        </p>
      )}
      {error && (
        <p className={styles.error}>
          <i className="ti ti-alert-circle" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className={styles.field}>
        <span className={styles.label}>Méthode de versement</span>
        <div className={styles.methods}>
          {METHODS.map((m) => (
            <button
              type="button"
              key={m.id}
              className={`${styles.method} ${method === m.id ? styles.methodActive : ""}`}
              onClick={() => setMethod(m.id)}
              aria-pressed={method === m.id}
            >
              <i className={`ti ${m.icon}`} aria-hidden="true" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.amountRow}>
          <label htmlFor="amount" className={styles.label}>Montant à retirer</label>
          <button type="button" className={styles.maxBtn} onClick={() => setAmount(balance)}>
            Max ({fmtXAF(balance)})
          </button>
        </div>
        <div className={styles.inputWrap}>
          <input
            id="amount"
            type="number"
            min={0}
            step={500}
            className={styles.input}
            value={amount || ""}
            placeholder="0"
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          />
          <span className={styles.unit}>XAF</span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="account" className={styles.label}>
          {isMobile ? "Numéro de téléphone" : "IBAN / Numéro de compte"}
        </label>
        <input
          id="account"
          type="text"
          className={styles.input}
          value={account}
          placeholder={isMobile ? "Ex : 6 70 00 00 00" : "Ex : CM21 1000 1000 0000"}
          onChange={(e) => setAccount(e.target.value)}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={loading}>
        <i className="ti ti-send" aria-hidden="true" />
        {loading ? "Envoi en cours…" : "Confirmer le retrait"}
      </button>
    </form>
  );
}
