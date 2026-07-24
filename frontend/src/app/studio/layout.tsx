import StudioSidebar from "./components/StudioSidebar";
import styles from "./layout.module.css";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <StudioSidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
