import { useMemo } from "react";
import Select from "./Select";
import { MIN_YEAR } from "../../lib/constants";

interface YearSelectProps {
  id?: string;
  value: number;
  onChange: (year: number) => void;
}

export default function YearSelect({ id, value, onChange }: YearSelectProps) {
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - MIN_YEAR + 1 }, (_, i) => String(current - i));
  }, []);

  return <Select id={id} value={String(value)} onChange={(e) => onChange(Number(e.target.value))} options={years} />;
}
