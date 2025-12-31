/**
 * @file use-scenarios.ts
 * @description Hooks for scenario management
 */

import React, { useEffect } from 'react';
import { useScenarioStore } from '@/stores/scenario-store';

/**
 * Convenience hook that automatically fetches scenarios for a project
 */
export const useScenarios = (projectId?: string) => {
  const store = useScenarioStore();

  // Auto-fetch scenarios when projectId changes
  React.useEffect(() => {
    if (projectId && store.scenarios.length === 0) {
      store.fetchScenarios(projectId);
    }
  }, [projectId, store.scenarios.length, store.fetchScenarios]);

  return store;
};

export default useScenarios;