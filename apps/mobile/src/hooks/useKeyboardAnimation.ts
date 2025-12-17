import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface UseKeyboardAnimationOptions {
  translateY?: number;
  durationUp?: number;
  durationDown?: number;
}

export const useKeyboardAnimation = (options: UseKeyboardAnimationOptions = {}) => {
  const { translateY: translateAmount = -100, durationUp = 250, durationDown = 100 } = options;
  const translateY = useSharedValue(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      translateY.value = withTiming(translateAmount, { duration: durationUp });
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      translateY.value = withTiming(0, { duration: durationDown });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [translateY, translateAmount, durationUp, durationDown]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return { animatedStyle };
};
