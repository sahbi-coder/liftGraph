import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Linking, TextInput, View } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import {
  Star,
  Dumbbell,
  TrendingUp,
  Smartphone,
  Palette,
  Trophy,
  Users,
  Send,
} from '@tamagui/lucide-icons';

import { colors } from '@/theme/colors';

type LikeFeature =
  | 'workoutPlans'
  | 'progressTracking'
  | 'easyToUse'
  | 'design'
  | 'achievements'
  | 'community';

export default function RateUsScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<LikeFeature>>(new Set());

  const toggleFeature = (feature: LikeFeature) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(feature)) {
        newSet.delete(feature);
      } else {
        newSet.add(feature);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    // TODO: Implement rating submission logic
    console.log('Rating:', rating);
    console.log('Feedback:', feedback);
    console.log('Selected Features:', Array.from(selectedFeatures));
    router.back();
  };

  const handleAppStoreRating = () => {
    // TODO: Replace with actual App Store URL
    Linking.openURL('https://apps.apple.com/app/your-app-id').catch((err) =>
      console.error('Failed to open App Store:', err),
    );
  };

  const handlePlayStoreRating = () => {
    // TODO: Replace with actual Play Store URL
    Linking.openURL('https://play.google.com/store/apps/details?id=your.app.id').catch((err) =>
      console.error('Failed to open Play Store:', err),
    );
  };

  const features = [
    {
      id: 'workoutPlans' as LikeFeature,
      label: 'Workout Plans',
      icon: Dumbbell,
    },
    {
      id: 'progressTracking' as LikeFeature,
      label: 'Progress Tracking',
      icon: TrendingUp,
    },
    {
      id: 'easyToUse' as LikeFeature,
      label: 'Easy to Use',
      icon: Smartphone,
    },
    {
      id: 'design' as LikeFeature,
      label: 'Design',
      icon: Palette,
    },
    {
      id: 'achievements' as LikeFeature,
      label: 'Achievements',
      icon: Trophy,
    },
    {
      id: 'community' as LikeFeature,
      label: 'Community',
      icon: Users,
    },
  ];

  return (
    <YStack flex={1} backgroundColor={colors.darkerGray}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <YStack padding="$4" paddingTop="$10" space="$6" alignItems="center">
          {/* Star Icon */}
          <YStack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor={colors.niceOrange}
            justifyContent="center"
            alignItems="center"
            marginTop="$4"
          >
            <Star size={60} color={colors.white} fill={colors.white} />
          </YStack>

          {/* Main Title */}
          <YStack space="$2" alignItems="center" paddingHorizontal="$4">
            <Text color={colors.white} fontSize="$9" fontWeight="bold" textAlign="center">
              Enjoying PowerLift Pro?
            </Text>
            <Text
              color={colors.midGray}
              fontSize="$5"
              textAlign="center"
              lineHeight="$1"
              paddingHorizontal="$4"
            >
              Your feedback helps us improve and motivates us to keep building great features for
              you!
            </Text>
          </YStack>

          {/* Rating Section */}
          <YStack
            width="100%"
            backgroundColor={colors.darkGray}
            borderRadius="$4"
            padding="$4"
            space="$3"
            marginTop="$2"
          >
            <Text color={colors.white} fontSize="$6" fontWeight="600" textAlign="center">
              How would you rate your experience?
            </Text>
            <XStack justifyContent="center" space="$2" marginTop="$2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Star
                    size={40}
                    color={star <= rating ? colors.niceOrange : colors.midGray}
                    fill={star <= rating ? colors.niceOrange : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </XStack>
          </YStack>

          {/* Feedback Text Area */}
          <YStack width="100%" space="$2">
            <Text color={colors.white} fontSize="$6" fontWeight="600">
              Tell us more (Optional)
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
                placeholder="Share your thoughts, suggestions, or what you love about PowerLift Pro..."
                placeholderTextColor={colors.midGray}
                multiline
                value={feedback}
                onChangeText={setFeedback}
              />
            </YStack>
          </YStack>

          {/* What do you like most */}
          <YStack width="100%" space="$3">
            <Text color={colors.white} fontSize="$6" fontWeight="600">
              What do you like most?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {features.map((feature) => {
                const IconComponent = feature.icon;
                const isSelected = selectedFeatures.has(feature.id);
                return (
                  <TouchableOpacity
                    key={feature.id}
                    onPress={() => toggleFeature(feature.id)}
                    activeOpacity={0.7}
                    style={{ marginRight: 8, marginBottom: 8 }}
                  >
                    <XStack
                      backgroundColor={isSelected ? colors.niceOrange : colors.darkGray}
                      borderRadius="$3"
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      space="$2"
                      alignItems="center"
                    >
                      <IconComponent
                        size={18}
                        color={isSelected ? colors.white : colors.niceOrange}
                      />
                      <Text
                        color={isSelected ? colors.white : colors.white}
                        fontSize="$4"
                        fontWeight="500"
                      >
                        {feature.label}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                );
              })}
            </View>
          </YStack>

          {/* Submit Button */}
          <Button
            width="100%"
            backgroundColor={colors.niceOrange}
            color={colors.white}
            onPress={handleSubmit}
            borderRadius="$3"
            padding="$4"
            marginTop="$2"
          >
            <XStack space="$2" alignItems="center">
              <Send size={20} color={colors.white} />
              <Text fontSize="$5" fontWeight="600" color={colors.white}>
                Submit Rating
              </Text>
            </XStack>
          </Button>

          {/* Maybe Later Link */}
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text color={colors.midGray} fontSize="$4" marginTop="$2">
              Maybe Later
            </Text>
          </TouchableOpacity>

          {/* App Store Rating Section */}
          <YStack width="100%" space="$3" marginTop="$6" alignItems="center">
            <Text color={colors.midGray} fontSize="$4" textAlign="center">
              Love the app? Rate us on your app store!
            </Text>
            <XStack width="100%" space="$3">
              <Button
                flex={1}
                backgroundColor={colors.darkGray}
                color={colors.white}
                onPress={handleAppStoreRating}
                borderRadius="$3"
                padding="$3"
              >
                <XStack space="$2" alignItems="center">
                  <Feather name="smartphone" size={18} color={colors.white} />
                  <Text fontSize="$4" fontWeight="500" color={colors.white}>
                    Rate on App Store
                  </Text>
                </XStack>
              </Button>
              <Button
                flex={1}
                backgroundColor={colors.darkGray}
                color={colors.white}
                onPress={handlePlayStoreRating}
                borderRadius="$3"
                padding="$3"
              >
                <XStack space="$2" alignItems="center">
                  <Feather name="smartphone" size={18} color={colors.white} />
                  <Text fontSize="$4" fontWeight="500" color={colors.white}>
                    Rate on Play Store
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
