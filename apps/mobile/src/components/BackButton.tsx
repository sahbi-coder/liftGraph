import { TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';

export function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16, paddingVertical: 8 }}>
      <Feather name="arrow-left" size={24} color={colors.white} />
    </TouchableOpacity>
  );
}
