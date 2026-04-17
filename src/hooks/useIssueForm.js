import { useState, useCallback } from 'react';
import api from '../services/api';

const useIssueForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitIssue = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitIssue, loading, error };
};

export default useIssueForm;
