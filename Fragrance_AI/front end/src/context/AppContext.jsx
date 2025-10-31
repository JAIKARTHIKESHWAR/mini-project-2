// AppContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    name: 'Fragrance Explorer',
    email: '',
    preferences: {
      mood: '',
      occasion: '',
      intensity: '',
      weather: '',
      timeOfDay: ''
    }
  },
  currentFragrance: null,
  customBlends: [],
  recommendations: [],
  scentHistory: [],
  isLoading: false,
  currentPage: 'home'
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    case 'LOGOUT':
      return {
        ...state,
        user: {
          name: 'Fragrance Explorer',
          email: '',
          preferences: {
            mood: '',
            occasion: '',
            intensity: '',
            weather: '',
            timeOfDay: ''
          }
        }
      };
    case 'SET_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        }
      };
    case 'ADD_BLEND':
      return {
        ...state,
        customBlends: [...state.customBlends, action.payload]
      };
    case 'SET_RECOMMENDATIONS':
      return {
        ...state,
        recommendations: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.payload
      };
    case 'ADD_SCENT_HISTORY':
      return {
        ...state,
        scentHistory: [...state.scentHistory, action.payload]
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
