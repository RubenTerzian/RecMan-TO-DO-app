import styles from "./NoResultsState.module.css";

type NoResultsStateProps = {
  title: string;
  description: string;
  searchTerm: string;
  filter: string;
};

export function NoResultsState({
  title,
  description,
  searchTerm,
  filter,
}: NoResultsStateProps) {
  return (
    <div className={styles.noResultsState} data-testid="no-results-state">
      <p className={styles.kicker}>No results</p>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.tokens}>
        <span className={styles.token}>Search: {searchTerm}</span>
        <span className={styles.token}>Filter: {filter}</span>
      </div>
    </div>
  );
}
