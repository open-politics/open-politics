import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TutorialState {
  showSchemaBuilderTutorial: boolean;
  toggleSchemaBuilderTutorial: () => void;
  showClassificationRunnerTutorial: boolean;
  toggleClassificationRunnerTutorial: () => void;
  // Add more tutorial flags as needed
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      showSchemaBuilderTutorial: true, // Default to showing tutorial
      toggleSchemaBuilderTutorial: () => 
        set((state) => ({ 
          showSchemaBuilderTutorial: !state.showSchemaBuilderTutorial 
        })),
      showClassificationRunnerTutorial: true, // Default to showing tutorial
      toggleClassificationRunnerTutorial: () => 
        set((state) => ({ 
          showClassificationRunnerTutorial: !state.showClassificationRunnerTutorial 
        })),
    }),
    {
      name: 'tutorial-storage', // unique name for localStorage
    }
  )
);