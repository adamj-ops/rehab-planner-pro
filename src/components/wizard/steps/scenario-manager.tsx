/**
 * @file scenario-manager.tsx
 * @description Simple scenario management component for review summary
 */

"use client";

import React from "react";
import { BudgetScenario } from "@/types/scenario";
import ScenarioComparisonPanel from "./scenario-comparison-panel";

interface ScenarioManagerProps {
  scenarios: BudgetScenario[];
  onCreateScenario: () => void;
  onEditScenario: (scenario: BudgetScenario) => void;
  onDeleteScenario: (id: string) => void;
  onApplyScenario: (id: string) => void;
  onCompareScenarios: (scenarioIds: string[]) => void;
}

export default function ScenarioManager({
  scenarios,
  onCreateScenario,
  onEditScenario,
  onDeleteScenario,
  onApplyScenario,
  onCompareScenarios
}: ScenarioManagerProps) {
  return (
    <ScenarioComparisonPanel
      scenarios={scenarios}
      onCreateScenario={onCreateScenario}
      onEditScenario={onEditScenario}
      onDeleteScenario={onDeleteScenario}
      onApplyScenario={onApplyScenario}
      onCompareScenarios={onCompareScenarios}
    />
  );
}