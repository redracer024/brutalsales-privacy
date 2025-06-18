import { View } from 'react-native';
import AnalyticsTest from '../../components/AnalyticsTest';

export default function AnalyticsTestScreen() {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <AnalyticsTest />
    </View>
  );
} 