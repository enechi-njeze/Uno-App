import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavHost, Route } from './src/navigation';
import { BrowseScreen } from './src/screens/BrowseScreen';
import { ListingDetailScreen } from './src/screens/ListingDetailScreen';
import { CreateListingScreen } from './src/screens/CreateListingScreen';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <NavHost
        screens={{
          browse: () => <BrowseScreen />,
          detail: (r: Route) =>
            r.name === 'detail' ? <ListingDetailScreen id={r.id} /> : <BrowseScreen />,
          create: () => <CreateListingScreen />,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: StatusBar.currentHeight ?? 0,
  },
});
