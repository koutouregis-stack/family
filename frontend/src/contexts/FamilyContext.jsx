import React, { createContext, useState } from 'react';
import { familyService } from '../services';

export const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const [families, setFamilies] = useState([]);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.getFamilies();
      setFamilies(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectFamily = async (familyId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.getFamily(familyId);
      setCurrentFamily(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (nom_famille, description) => {
    try {
      setLoading(true);
      setError(null);
      const response = await familyService.createFamily(nom_famille, description);
      setFamilies([...families, response.data.family]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMembers = async (familyId) => {
    try {
      setLoading(true);
      const response = await familyService.getMembers(familyId);
      setMembers(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        families,
        currentFamily,
        members,
        loading,
        error,
        getFamilies,
        selectFamily,
        createFamily,
        getMembers
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};