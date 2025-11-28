import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import {
  Headphones,
  Mail,
  Phone,
  MessageCircle,
  Send,
  HelpCircle,
  BookOpen,
  ChevronRight,
} from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

export default function ContactUsScreen() {
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@powerliftpro.com?subject=Support Request').catch((err) =>
      console.error('Failed to open email:', err),
    );
  };

  const handlePhoneSupport = () => {
    Linking.openURL('tel:+15551234567').catch((err) => console.error('Failed to open phone:', err));
  };

  const handleLiveChat = () => {
    // TODO: Implement live chat functionality
    console.log('Open live chat');
  };

  const handleSendMessage = () => {
    // TODO: Implement send message functionality
    console.log('Send message:', { subject, email, message });
    // Reset form
    setSubject('');
    setEmail('');
    setMessage('');
  };

  const handleSocialMedia = (platform: string) => {
    const urls: Record<string, string> = {
      instagram: 'https://instagram.com/powerliftpro',
      youtube: 'https://youtube.com/@powerliftpro',
      facebook: 'https://facebook.com/powerliftpro',
      twitter: 'https://twitter.com/powerliftpro',
    };
    Linking.openURL(urls[platform] || '#').catch((err) =>
      console.error(`Failed to open ${platform}:`, err),
    );
  };

  const handleFAQ = () => {
    // TODO: Navigate to FAQ screen
    console.log('Open FAQ');
  };

  const handleUserGuide = () => {
    // TODO: Navigate to user guide screen
    console.log('Open user guide');
  };

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" paddingTop="$10" space="$6">
          {/* Get in Touch Section */}
          <YStack alignItems="center" space="$3">
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
              We're here to help you achieve your powerlifting goals
            </Text>
          </YStack>

          {/* Contact Methods */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              Contact Methods
            </Text>
            <YStack space="$2">
              <TouchableOpacity onPress={handleEmailSupport} activeOpacity={0.7}>
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$4"
                  space="$3"
                  alignItems="center"
                >
                  <YStack
                    width={48}
                    height={48}
                    borderRadius="$2"
                    backgroundColor={colors.niceOrange}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Mail size={24} color={colors.white} />
                  </YStack>
                  <YStack flex={1} space="$1">
                    <Text color={colors.white} fontSize="$5" fontWeight="600">
                      Email Support
                    </Text>
                    <Text color={colors.midGray} fontSize="$4">
                      support@powerliftpro.com
                    </Text>
                  </YStack>
                  <ChevronRight size={20} color={colors.midGray} />
                </XStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePhoneSupport} activeOpacity={0.7}>
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$4"
                  space="$3"
                  alignItems="center"
                >
                  <YStack
                    width={48}
                    height={48}
                    borderRadius="$2"
                    backgroundColor={colors.niceOrange}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Phone size={24} color={colors.white} />
                  </YStack>
                  <YStack flex={1} space="$1">
                    <Text color={colors.white} fontSize="$5" fontWeight="600">
                      Phone Support
                    </Text>
                    <Text color={colors.midGray} fontSize="$4">
                      +1 (555) 123-4567
                    </Text>
                  </YStack>
                  <ChevronRight size={20} color={colors.midGray} />
                </XStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLiveChat} activeOpacity={0.7}>
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$4"
                  space="$3"
                  alignItems="center"
                >
                  <YStack
                    width={48}
                    height={48}
                    borderRadius="$2"
                    backgroundColor={colors.niceOrange}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <MessageCircle size={24} color={colors.white} />
                  </YStack>
                  <YStack flex={1} space="$1">
                    <Text color={colors.white} fontSize="$5" fontWeight="600">
                      Live Chat
                    </Text>
                    <Text color={colors.midGray} fontSize="$4">
                      Available 9 AM - 6 PM EST
                    </Text>
                  </YStack>
                  <XStack space="$2" alignItems="center">
                    <YStack width={8} height={8} borderRadius={4} backgroundColor="#10b981" />
                    <Text color="#10b981" fontSize="$4" fontWeight="500">
                      Online
                    </Text>
                    <ChevronRight size={20} color={colors.midGray} />
                  </XStack>
                </XStack>
              </TouchableOpacity>
            </YStack>
          </YStack>

          {/* Send Message */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              Send Message
            </Text>
            <YStack space="$3">
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
                width="100%"
                backgroundColor={colors.niceOrange}
                color={colors.white}
                onPress={handleSendMessage}
                borderRadius="$3"
                padding="$4"
              >
                <XStack space="$2" alignItems="center">
                  <Send size={20} color={colors.white} />
                  <Text fontSize="$5" fontWeight="600" color={colors.white}>
                    Send Message
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </YStack>

          {/* Follow Us */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              Follow Us
            </Text>
            <XStack space="$2" flexWrap="wrap">
              <TouchableOpacity
                onPress={() => handleSocialMedia('instagram')}
                activeOpacity={0.7}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$3"
                  space="$2"
                  alignItems="center"
                  minWidth={140}
                >
                  <Feather name="instagram" size={24} color="#E4405F" />
                  <Text color={colors.white} fontSize="$4" fontWeight="500">
                    Instagram
                  </Text>
                </XStack>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialMedia('youtube')}
                activeOpacity={0.7}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$3"
                  space="$2"
                  alignItems="center"
                  minWidth={140}
                >
                  <Feather name="youtube" size={24} color="#FF0000" />
                  <Text color={colors.white} fontSize="$4" fontWeight="500">
                    YouTube
                  </Text>
                </XStack>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialMedia('facebook')}
                activeOpacity={0.7}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$3"
                  space="$2"
                  alignItems="center"
                  minWidth={140}
                >
                  <Feather name="facebook" size={24} color="#1877F2" />
                  <Text color={colors.white} fontSize="$4" fontWeight="500">
                    Facebook
                  </Text>
                </XStack>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSocialMedia('twitter')}
                activeOpacity={0.7}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$3"
                  space="$2"
                  alignItems="center"
                  minWidth={140}
                >
                  <Feather name="twitter" size={24} color="#1DA1F2" />
                  <Text color={colors.white} fontSize="$4" fontWeight="500">
                    Twitter
                  </Text>
                </XStack>
              </TouchableOpacity>
            </XStack>
          </YStack>

          {/* Quick Help */}
          <YStack space="$3">
            <Text color={colors.midGray} fontSize="$5" fontWeight="600" textTransform="uppercase">
              Quick Help
            </Text>
            <YStack space="$2">
              <TouchableOpacity onPress={handleFAQ} activeOpacity={0.7}>
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$4"
                  space="$3"
                  alignItems="center"
                >
                  <YStack
                    width={48}
                    height={48}
                    borderRadius="$2"
                    backgroundColor={colors.niceOrange}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <HelpCircle size={24} color={colors.white} />
                  </YStack>
                  <Text color={colors.white} fontSize="$5" fontWeight="600" flex={1}>
                    FAQ
                  </Text>
                  <ChevronRight size={20} color={colors.midGray} />
                </XStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleUserGuide} activeOpacity={0.7}>
                <XStack
                  backgroundColor={colors.darkGray}
                  borderRadius="$3"
                  padding="$4"
                  space="$3"
                  alignItems="center"
                >
                  <YStack
                    width={48}
                    height={48}
                    borderRadius="$2"
                    backgroundColor={colors.niceOrange}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <BookOpen size={24} color={colors.white} />
                  </YStack>
                  <Text color={colors.white} fontSize="$5" fontWeight="600" flex={1}>
                    User Guide
                  </Text>
                  <ChevronRight size={20} color={colors.midGray} />
                </XStack>
              </TouchableOpacity>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
