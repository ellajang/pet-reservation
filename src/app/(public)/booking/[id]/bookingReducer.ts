import { TIME_SLOTS as DEFAULT_SLOTS } from "@/shared/lib/constants";
import type { Service } from "@/shared/types";

// === Types ===

export type { Service };

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ExistingPet {
  id: string;
  name: string;
  breed: string;
  size_category: string;
}

export interface ExistingCustomer {
  id: string;
  name: string;
  phone: string;
  pets: ExistingPet[];
}

export type Step = 1 | 2 | 3 | 4 | 5;

export interface BookingState {
  step: Step;
  services: Service[];
  checking: boolean;
  isNewCustomer: boolean;
  existingCustomer: ExistingCustomer | null;
  selectedPetId: string;
  form: {
    phone: string;
    name: string;
    petName: string;
    breed: string;
    weight: string;
    gender: string;
    neutered: boolean;
    specialNotes: string;
    sizeCategory: string;
    serviceId: string;
    date: string;
    time: string;
  };
  submitted: boolean;
  submitting: boolean;
  timeSlots: TimeSlot[];
  loadingSlots: boolean;
}

export type BookingAction =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_SERVICES"; services: Service[] }
  | { type: "SET_CHECKING"; value: boolean }
  | { type: "SET_EXISTING_CUSTOMER"; customer: ExistingCustomer; petId?: string; sizeCategory?: string }
  | { type: "SET_NEW_CUSTOMER" }
  | { type: "UPDATE_FORM"; field: string; value: string | boolean }
  | { type: "SELECT_PET"; petId: string; sizeCategory: string }
  | { type: "SELECT_SERVICE"; serviceId: string }
  | { type: "SELECT_TIME"; time: string }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_SUBMITTED" }
  | { type: "SET_TIME_SLOTS"; slots: TimeSlot[] }
  | { type: "SET_LOADING_SLOTS"; value: boolean };

// === Initial State ===

export const initialBookingState: BookingState = {
  step: 1,
  services: [],
  checking: false,
  isNewCustomer: false,
  existingCustomer: null,
  selectedPetId: "",
  form: {
    phone: "", name: "", petName: "", breed: "", weight: "",
    gender: "male", neutered: false, specialNotes: "",
    sizeCategory: "small", serviceId: "", date: "", time: "",
  },
  submitted: false,
  submitting: false,
  timeSlots: DEFAULT_SLOTS.map((t) => ({ time: t, available: true })),
  loadingSlots: false,
};

// === Reducer ===

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_SERVICES":
      return { ...state, services: action.services };
    case "SET_CHECKING":
      return { ...state, checking: action.value };
    case "SET_EXISTING_CUSTOMER":
      return {
        ...state,
        isNewCustomer: false,
        existingCustomer: action.customer,
        selectedPetId: action.petId || "",
        form: {
          ...state.form,
          name: action.customer.name,
          sizeCategory: action.sizeCategory || "small",
        },
        step: 3,
        checking: false,
      };
    case "SET_NEW_CUSTOMER":
      return { ...state, isNewCustomer: true, step: 2, checking: false };
    case "UPDATE_FORM":
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case "SELECT_PET":
      return {
        ...state,
        selectedPetId: action.petId,
        form: { ...state.form, sizeCategory: action.sizeCategory },
      };
    case "SELECT_SERVICE":
      return { ...state, form: { ...state.form, serviceId: action.serviceId }, step: 4 };
    case "SELECT_TIME":
      return { ...state, form: { ...state.form, time: action.time }, step: 5 };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };
    case "SET_SUBMITTED":
      return { ...state, submitted: true, submitting: false };
    case "SET_TIME_SLOTS":
      return { ...state, timeSlots: action.slots, loadingSlots: false };
    case "SET_LOADING_SLOTS":
      return { ...state, loadingSlots: action.value };
  }
}
