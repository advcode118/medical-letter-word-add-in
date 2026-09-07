import { useState } from "react";
import { SelectedItem } from "../types/catalog";
import { todayIsoDate } from "../utils/dates";

export interface LetterState {
  patientName: string;
  dateOfBirth: string;
  patientId: string;
  letterDate: string;
  clinicianName: string;
  clinicianRole: string;
  diagnoses: SelectedItem[];
  medications: SelectedItem[];
  investigations: SelectedItem[];
  treatments: SelectedItem[];
  assessment: string;
  plan: string;
  followUp: string;
}

export function createInitialLetterState(): LetterState {
  return {
    patientName: "",
    dateOfBirth: "",
    patientId: "",
    letterDate: todayIsoDate(),
    clinicianName: "",
    clinicianRole: "",
    diagnoses: [],
    medications: [],
    investigations: [],
    treatments: [],
    assessment: "",
    plan: "",
    followUp: "",
  };
}

export function useLetterState() {
  const [state, setState] = useState<LetterState>(createInitialLetterState);

  const clearSelections = () => {
    setState((current) => ({
      ...current,
      diagnoses: [],
      medications: [],
      investigations: [],
      treatments: [],
      assessment: "",
      plan: "",
      followUp: "",
    }));
  };

  const resetForm = () => {
    setState(createInitialLetterState());
  };

  return { state, setState, clearSelections, resetForm };
}
