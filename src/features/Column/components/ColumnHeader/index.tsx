import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  title: string;
  subtitle: string;
  taskCount: number;
};

export function ColumnHeader({
  title,
  subtitle,
  taskCount,
}: ColumnHeaderProps) {
  return (
    <header className={styles.columnHeader}>
      <div>
        <p className={styles.subtitle}>{subtitle}</p>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <span className={styles.count}>{taskCount}</span>
    </header>
  );
}
