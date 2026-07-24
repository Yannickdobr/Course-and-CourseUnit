"use client";

import { useState } from "react";
import { paymentApi } from "@/lib/api";
import styles from "./FinancialAidModal.module.css";

interface FinancialAidModalProps {
  courseId: string;
  userId: string;
  onClose: () => void;
}

export default function FinancialAidModal({ courseId, userId, onClose }: FinancialAidModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [income, setIncome] = useState<number | "">("");
  const [disadvantaged, setDisadvantaged] = useState<boolean>(false);
  const [motivation, setMotivation] = useState<number>(5);
  const [hours, setHours] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (income === "" || hours === "") {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await paymentApi.applyForFinancialAid({
        userId,
        courseId,
        monthlyIncome: Number(income),
        disadvantaged,
        motivationScore: Number(motivation) / 10, // Backend attend 0 à 1
        auditHours: Number(hours),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la soumission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
          <i className="ti ti-x" />
        </button>

        <h2 className={styles.title}>Demande d&apos;Aide Financière</h2>

        {success ? (
          <div className={styles.success}>
            <i className="ti ti-circle-check" />
            <h3>Demande soumise avec succès !</h3>
            <p>Notre équipe examinera votre demande et vous répondra très rapidement par email. Si elle est approuvée, vous aurez accès au cours immédiatement.</p>
            <button className={styles.submitBtn} onClick={onClose}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {step === 1 ? (
              <div className={styles.step}>
                <p className={styles.subtitle}>Informations générales (1/2)</p>
                <div className={styles.formGroup}>
                  <label htmlFor="income">Revenu mensuel (en FCFA) *</label>
                  <input
                    id="income"
                    type="number"
                    min="0"
                    placeholder="Ex: 50000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value ? Number(e.target.value) : "")}
                    required
                  />
                  <p className={styles.help}>Ce montant reste confidentiel.</p>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={disadvantaged}
                      onChange={(e) => setDisadvantaged(e.target.checked)}
                    />
                    <span>Je suis dans une situation particulière (étudiant, chômage, etc.)</span>
                  </label>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.nextBtn} onClick={() => setStep(2)}>
                    Suivant <i className="ti ti-arrow-right" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.step}>
                <p className={styles.subtitle}>Engagement et motivation (2/2)</p>
                <div className={styles.formGroup}>
                  <label htmlFor="motivation">Niveau de motivation (1 à 10) *</label>
                  <input
                    id="motivation"
                    type="range"
                    min="1"
                    max="10"
                    value={motivation}
                    onChange={(e) => setMotivation(Number(e.target.value))}
                  />
                  <div className={styles.rangeVal}>{motivation} / 10</div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="hours">Heures d&apos;étude par semaine *</label>
                  <input
                    id="hours"
                    type="number"
                    min="1"
                    max="40"
                    placeholder="Ex: 5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value ? Number(e.target.value) : "")}
                    required
                  />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions}>
                  <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                    Retour
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? "Envoi..." : "Soumettre la demande"}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
