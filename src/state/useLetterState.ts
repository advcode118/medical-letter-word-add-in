import { useState } from "react";
import { SelectedItem } from "../types/catalog";
import { todayIsoDate } from "../utils/dates";

export interface PatientDetails {
  patientName: string;
  dateOfBirth: string;
  patientId: string;
  letterDate: string;
  clinicianName: string;
  clinicianRole: string;
}

export interface LetterState {
  patient: PatientDetails;
  catalogSelections: Record<string, SelectedItem[]>;
  textValues: Record<string, string>;
  otherValues: Record<string, string>;
}

export function createInitialPatient(): PatientDetails {
  return {
    patientName: "",
    dateOfBirth: "",
    patientId: "",
    letterDate: todayIsoDate(),
    clinicianName: "",
    clinicianRole: "",
  };
}

export function createInitialLetterState(): LetterState {
  return {
    patient: createInitialPatient(),
    catalogSelections: {},
    textValues: {},
    otherValues: {},
  };
}

export function useLetterState() {
  const [state, setState] = useState<LetterState>(createInitialLetterState);

  const patchPatient = (patch: Partial<PatientDetails>) => {
    setState((current) => ({
      ...current,
      patient: { ...current.patient, ...patch },
    }));
  };

  const setCatalogSelection = (sectionId: string, items: SelectedItem[]) => {
    setState((current) => ({
      ...current,
      catalogSelections: { ...current.catalogSelections, [sectionId]: items },
    }));
  };

  const setTextValue = (sectionId: string, value: string) => {
    setState((current) => ({
      ...current,
      textValues: { ...current.textValues, [sectionId]: value },
    }));
  };

  const setOtherValue = (sectionId: string, value: string) => {
    setState((current) => ({
      ...current,
      otherValues: { ...current.otherValues, [sectionId]: value },
    }));
  };

  const clearSelections = () => {
    setState((current) => ({
      ...current,
      catalogSelections: {},
      textValues: {},
      otherValues: {},
    }));
  };

  const resetForm = () => {
    setState(createInitialLetterState());
  };

  return {
    state,
    patchPatient,
    setCatalogSelection,
    setTextValue,
    setOtherValue,
    clearSelections,
    resetForm,
  };
}
