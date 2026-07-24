import Link from "next/link";
import styles from "./LegalPage.module.css";

export interface LegalSection {
  id: string;
  title: string;
  /* Chaque élément : string = paragraphe, string[] = liste à puces */
  body: (string | string[])[];
}

interface Props {
  title: string;
  updated: string;        // ex : "5 juin 2026"
  intro?: string;
  sections: LegalSection[];
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function LegalPage({ title, updated, intro, sections }: Props) {
  return (
    <main className={styles.page}>
      {/* Header */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden>/</span>
            <span>{title}</span>
          </nav>
          <h1 className={styles.title}>{title}</h1>
          <span className={styles.updated}>
            <i className="ti ti-calendar" aria-hidden="true" /> Dernière mise à jour : {updated}
          </span>
        </div>
      </section>

      <div className={styles.layout}>
        {intro && <p className={styles.paragraph}>{intro}</p>}

        {/* Sommaire */}
        <nav className={styles.toc} aria-label="Sommaire">
          <p className={styles.tocTitle}>Sommaire</p>
          <div className={styles.tocList}>
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={styles.tocLink}>
                <span className={styles.tocNum}>{i + 1}.</span> {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-h`}>
            <h2 id={`${s.id}-h`} className={styles.sectionTitle}>
              <span className={styles.sectionNum}>{i + 1}.</span> {s.title}
            </h2>
            {s.body.map((block, j) =>
              Array.isArray(block) ? (
                <ul key={j} className={styles.list}>
                  {block.map((li, k) => (
                    <li key={k} className={styles.listItem}>
                      <i className="ti ti-point" aria-hidden="true" /> {li}
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={j} className={styles.paragraph}>{block}</p>
              )
            )}
          </section>
        ))}

        <p className={styles.footerNote}>
          <i className="ti ti-info-circle" aria-hidden="true" />
          <span>
            Une question sur ce document ? Écrivez-nous à{" "}
            <Link href="/contact">contact@eduflex.pro</Link> — nous sommes là pour vous aider.
          </span>
        </p>
      </div>
    </main>
  );
}
