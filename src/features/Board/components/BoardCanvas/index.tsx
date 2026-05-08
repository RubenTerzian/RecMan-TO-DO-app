import type { ReactNode } from "react";
import styles from "./BoardCanvas.module.css";
import { BoardScroller } from "@/features/Board/components/BoardScroller/index";

type BoardCanvasProps = {
  children: ReactNode;
};

export function BoardCanvas({ children }: BoardCanvasProps) {
  return (
    <section className={styles.boardCanvas} data-testid="board-canvas">
      <BoardScroller />
      <div className={styles.boardContent}>{children}</div>
    </section>
  );
}
