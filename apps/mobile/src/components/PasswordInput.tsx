import React, { useState } from 'react';
import { XStack, Input, Button } from 'tamagui';
import { Eye, EyeOff } from '@tamagui/lucide-icons';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function PasswordInput({
  value,
  onChangeText,
  placeholder = 'Password',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <XStack position="relative" alignItems="center">
      <Input
        size="$4"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        borderColor="$inputFieldBorder"
        backgroundColor="$inputFieldBackground"
        placeholderTextColor="$inputFieldPlaceholderText"
        color="$inputFieldText"
        focusStyle={{ borderColor: '$inputFieldFocusBorder' }}
        paddingRight="$10"
        flex={1}
      />
      <Button
        opacity={0.8}
        unstyled
        position="absolute"
        right="$3"
        onPress={() => setShowPassword(!showPassword)}
        padding="$2"
        pressStyle={{ opacity: 0.5 }}
      >
        {showPassword ? <EyeOff size={20} color="white" /> : <Eye size={20} color="white" />}
      </Button>
    </XStack>
  );
}
