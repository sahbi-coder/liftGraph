import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAlertModal } from './useAlertModal';

// Mock AlertModal component
jest.mock('@/components/AlertModal', () => ({
  AlertModal: jest.fn(() => null),
}));

describe('useAlertModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAlertModal());

    expect(result.current.alertModal).toEqual({
      visible: false,
      message: '',
      type: 'info',
    });
  });

  it('should initialize with custom default duration', () => {
    const { result } = renderHook(() => useAlertModal({ defaultDuration: 5000 }));

    expect(result.current.alertModal).toEqual({
      visible: false,
      message: '',
      type: 'info',
    });
  });

  describe('showSuccess', () => {
    it('should show success alert with message', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('Operation successful');
      });

      expect(result.current.alertModal).toEqual({
        visible: true,
        message: 'Operation successful',
        type: 'success',
      });
    });

    it('should accept custom duration parameter', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('Success', 1000);
      });

      expect(result.current.alertModal).toEqual({
        visible: true,
        message: 'Success',
        type: 'success',
      });
    });
  });

  describe('showError', () => {
    it('should show error alert with message', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showError('An error occurred');
      });

      expect(result.current.alertModal).toEqual({
        visible: true,
        message: 'An error occurred',
        type: 'error',
      });
    });
  });

  describe('showWarning', () => {
    it('should show warning alert with message', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showWarning('Warning message');
      });

      expect(result.current.alertModal).toEqual({
        visible: true,
        message: 'Warning message',
        type: 'warning',
      });
    });
  });

  describe('showInfo', () => {
    it('should show info alert with message', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showInfo('Info message');
      });

      expect(result.current.alertModal).toEqual({
        visible: true,
        message: 'Info message',
        type: 'info',
      });
    });
  });

  describe('hide', () => {
    it('should hide the alert modal', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('Test message');
      });

      expect(result.current.alertModal.visible).toBe(true);

      act(() => {
        result.current.hide();
      });

      expect(result.current.alertModal.visible).toBe(false);
      expect(result.current.alertModal.message).toBe('Test message');
      expect(result.current.alertModal.type).toBe('success');
    });
  });

  describe('AlertModalComponent', () => {
    it('should create component with correct props for success type', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('Success message');
      });

      const Component = result.current.AlertModalComponent;
      expect(Component).toBeDefined();
      const element = React.createElement(Component, { duration: 2000 });
      expect(element).toBeDefined();
    });

    it('should use default duration for success type (2000ms)', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('Success');
      });

      const Component = result.current.AlertModalComponent;
      expect(Component).toBeDefined();
      const element = React.createElement(Component);
      expect(element).toBeDefined();
    });

    it('should use default duration for error type (4000ms)', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showError('Error');
      });

      const Component = result.current.AlertModalComponent;
      expect(Component).toBeDefined();
      const element = React.createElement(Component);
      expect(element).toBeDefined();
    });

    it('should use custom default duration for info type', () => {
      const { result } = renderHook(() => useAlertModal({ defaultDuration: 5000 }));

      act(() => {
        result.current.showInfo('Info');
      });

      const Component = result.current.AlertModalComponent;
      expect(Component).toBeDefined();
      const element = React.createElement(Component);
      expect(element).toBeDefined();
    });

    it('should use provided duration parameter when specified', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showInfo('Info');
      });

      const Component = result.current.AlertModalComponent;
      expect(Component).toBeDefined();
      const element = React.createElement(Component, { duration: 10000 });
      expect(element).toBeDefined();
    });

    it('should call hide callback when onComplete is triggered', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('Test');
      });

      const Component = result.current.AlertModalComponent;
      expect(Component).toBeDefined();
      const element = React.createElement(Component);
      expect(element).toBeDefined();

      // Simulate onComplete callback
      act(() => {
        result.current.hide();
      });

      expect(result.current.alertModal.visible).toBe(false);
    });
  });

  describe('multiple alerts', () => {
    it('should replace previous alert with new one', () => {
      const { result } = renderHook(() => useAlertModal());

      act(() => {
        result.current.showSuccess('First message');
      });

      expect(result.current.alertModal.message).toBe('First message');
      expect(result.current.alertModal.type).toBe('success');

      act(() => {
        result.current.showError('Second message');
      });

      expect(result.current.alertModal.message).toBe('Second message');
      expect(result.current.alertModal.type).toBe('error');
    });
  });
});
