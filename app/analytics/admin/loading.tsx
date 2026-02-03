'use client';

import { TargetIcon } from "@/components/icons/dashboard";
import { CategoryIcon } from "@/components/icons";
import { MultiIconLoader } from "@/components/multi-icon-loader";

export default function Loading() {
  return (
    <MultiIconLoader
      title="Loading admin analytics"
      subtitle="Crunching growth, retention, and funnel metrics."
      icons={[
        { node: <TargetIcon />, label: "Growth" },
        { node: <CategoryIcon category="Study" />, label: "Insights" },
      ]}
    />
  );
}
