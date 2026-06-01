import { useContext } from 'react';
import { FamilyContext } from '../contexts/FamilyContext';

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within FamilyProvider');
  }
  return context;
};