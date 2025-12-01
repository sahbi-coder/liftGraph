import React, { useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { YStack, Text, Button, Input } from 'tamagui';
import { Headphones } from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

export default function ContactUsScreen() {
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    // TODO: Implement send message functionality
    console.log('Send message:', { subject, email, message });
    // Reset form
    setSubject('');
    setEmail('');
    setMessage('');
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          gap: 24,
          paddingBottom: 40,
        }}
      >
        {/* Get in Touch Section */}
        <YStack alignItems="center" space="$3" marginTop="$2">
          <YStack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor={colors.niceOrange}
            justifyContent="center"
            alignItems="center"
          >
            <Headphones size={60} color={colors.white} />
          </YStack>
          <Text color={colors.white} fontSize="$8" fontWeight="bold" textAlign="center">
            Get in Touch
          </Text>
          <Text color={colors.midGray} fontSize="$5" textAlign="center" paddingHorizontal="$4">
            We're here to help you achieve your goals
          </Text>
        </YStack>

        {/* Send Message */}
        <YStack space="$4">
          <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
            Send Message
          </Text>
          <YStack space="$4">
            <YStack space="$2">
              <Text color={colors.white} fontSize="$4" fontWeight="500">
                Subject
              </Text>
              <Input
                value={subject}
                onChangeText={setSubject}
                placeholder="General Inquiry"
                backgroundColor={colors.darkGray}
                borderColor={colors.midGray}
                color={colors.white}
                placeholderTextColor={colors.midGray}
                fontSize="$5"
                padding="$3"
              />
            </YStack>
            <YStack space="$2">
              <Text color={colors.white} fontSize="$4" fontWeight="500">
                Email
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                backgroundColor={colors.darkGray}
                borderColor={colors.midGray}
                color={colors.white}
                placeholderTextColor={colors.midGray}
                fontSize="$5"
                padding="$3"
              />
            </YStack>
            <YStack space="$2">
              <Text color={colors.white} fontSize="$4" fontWeight="500">
                Message
              </Text>
              <YStack
                backgroundColor={colors.darkGray}
                borderRadius="$3"
                padding="$3"
                minHeight={120}
              >
                <TextInput
                  style={{
                    color: colors.white,
                    fontSize: 16,
                    textAlignVertical: 'top',
                    flex: 1,
                    minHeight: 100,
                  }}
                  placeholder="Tell us how we can help you..."
                  placeholderTextColor={colors.midGray}
                  multiline
                  value={message}
                  onChangeText={setMessage}
                />
              </YStack>
            </YStack>
            <Button
              size="$5"
              backgroundColor="$primaryButton"
              color="$secondaryButtonText"
              fontWeight="600"
              borderRadius="$4"
              onPress={() => handleSendMessage()}
              pressStyle={{ opacity: 0.85 }}
              alignSelf="stretch"
            >
              Send Message
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
