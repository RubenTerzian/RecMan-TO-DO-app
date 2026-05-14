import { memo, useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/atoms/Button/Button";
import { Select } from "@/components/atoms/Select/Select";
import styles from "./SelectionActionBar.module.css";

function MoveSelectionControlComponent() {
  const columns = useStore((state) => state.columns);
  const hasSelection = useStore((state) => state.selectedTaskIds.length > 0);
  const [moveTargetId, setMoveTargetId] = useState("");

  const handleSelectChange = useCallback(
    (event: { target: { value: string } }) => {
      setMoveTargetId(event.target.value);
    },
    [],
  );

  const handleMove = useCallback(() => {
    if (!moveTargetId) {
      return;
    }

    useStore.getState().moveSelectedTasks(moveTargetId);
    setMoveTargetId("");
  }, [moveTargetId]);

  const moveOptions = useMemo(
    () => [
      <option key="placeholder" value="" disabled>
        Select column
      </option>,
      ...columns.map((column) => (
        <option key={column.id} value={column.id}>
          {column.title}
        </option>
      )),
    ],
    [columns],
  );

  return (
    <div className={styles.moveGroup}>
      <span className={styles.moveLabel}>Move to</span>
      <Select
        className={styles.moveSelect}
        value={moveTargetId}
        onChange={handleSelectChange}
      >
        {moveOptions}
      </Select>
      <Button
        variant="secondary"
        className={styles.moveAction}
        disabled={!hasSelection || !moveTargetId}
        onClick={handleMove}
      >
        Move
      </Button>
    </div>
  );
}

export const MoveSelectionControl = memo(MoveSelectionControlComponent);
