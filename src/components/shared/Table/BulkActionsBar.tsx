import React from "react";
import { Button } from "~/components/ui/button";

type Props = {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected?: () => void;
};

export default function BulkActionsBar({ selectedCount, onClearSelection, onDeleteSelected }: Props) {
  if (!selectedCount) return null;
  return (
    <div className="flex items-center justify-between gap-2 bg-muted/50 px-3 py-2 border-b border-border">
      <div className="text-sm">
        {selectedCount} selected
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onClearSelection}>Clear</Button>
        <Button size="sm" variant="destructive" onClick={onDeleteSelected}>Delete</Button>
      </div>
    </div>
  );
}

