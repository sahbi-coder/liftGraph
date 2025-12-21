import { useState, useCallback } from 'react';

interface UseWorkoutDeleteModalReturn {
  isDeleteModalVisible: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  isDeleting: boolean;
  setIsDeleting: (value: boolean) => void;
}

/**
 * Manages the delete confirmation modal state for workout deletion.
 */
export function useWorkoutDeleteModal(): UseWorkoutDeleteModalReturn {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = useCallback(() => {
    setIsDeleteModalVisible(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalVisible(false);
  }, []);

  return {
    isDeleteModalVisible,
    openDeleteModal,
    closeDeleteModal,
    isDeleting,
    setIsDeleting,
  };
}
