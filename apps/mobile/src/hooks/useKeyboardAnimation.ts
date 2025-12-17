import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface UseKeyboardAnimationOptions {
  translateY?: number;
  duration?: number;
}

export const useKeyboardAnimation = (options: UseKeyboardAnimationOptions = {}) => {
  const { translateY: translateAmount = -100, duration = 250 } = options;
  const translateY = useSharedValue(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      translateY.value = withTiming(translateAmount, { duration });
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      translateY.value = withTiming(0, { duration });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [translateY, translateAmount, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return { animatedStyle };
};
