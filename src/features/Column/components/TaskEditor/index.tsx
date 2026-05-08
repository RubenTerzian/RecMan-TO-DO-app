import styles from "./TaskEditor.module.css";
import { Input } from "@/components/atoms/Input";

export function TaskEditor() {
  return <Input className={styles.taskEditor} defaultValue="" />;
}
