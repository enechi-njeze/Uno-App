import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../api/client';
import type { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';
import { colors } from '../theme';

type ConnState = 'checking' | 'online' | 'offline';

export function HomeScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [conn, setConn] = useState<ConnState>('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      // Ping the backend first so the header can show the live spine status —
      // this is the "hello world, end to end" proof, made visible.
      const health = await api.health();
      setConn(health.db === 'up' ? 'online' : 'offline');
      const data = await api.listings();
      setListings(data);
    } catch (e) {
      setConn('offline');
      setError(e instanceof Error ? e.message : 'Failed to reach the API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Unö</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  conn === 'online'
                    ? colors.verified
                    : conn === 'checking'
                      ? '#C9A227'
                      : '#C0392B',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {conn === 'online'
              ? 'API + DB connected'
              : conn === 'checking'
                ? 'Connecting…'
                : 'Offline'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : error && listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Can't reach the API</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Text style={styles.errorHint}>
            Is the backend running, and is EXPO_PUBLIC_API_URL pointing at it?
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ListingCard listing={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={load} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.brand,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  list: {
    padding: 16,
    paddingTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  errorBody: {
    fontSize: 13,
    color: '#C0392B',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
