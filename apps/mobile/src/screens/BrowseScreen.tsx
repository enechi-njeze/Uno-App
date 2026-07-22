import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { api } from '../api/client';
import type { ListingCard as Card } from '../types';
import { ListingCard } from '../components/ListingCard';
import { useNav } from '../navigation';
import { colors } from '../theme';

type ConnState = 'checking' | 'online' | 'offline';

export function BrowseScreen() {
  const nav = useNav();
  const [listings, setListings] = useState<Card[]>([]);
  const [conn, setConn] = useState<ConnState>('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const health = await api.health();
      setConn(health.db === 'up' ? 'online' : 'offline');
      const data = await api.listings({ verifiedOnly });
      setListings(data);
    } catch (e) {
      setConn('offline');
      setError(e instanceof Error ? e.message : 'Failed to reach the API');
    } finally {
      setLoading(false);
    }
  }, [verifiedOnly]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
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
        <Pressable style={styles.listBtn} onPress={() => nav.navigate({ name: 'create' })}>
          <Text style={styles.listBtnText}>+ List</Text>
        </Pressable>
      </View>

      {/* Trust filter — verified-first is the whole product. */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Verified only</Text>
        <Switch
          value={verifiedOnly}
          onValueChange={setVerifiedOnly}
          trackColor={{ true: colors.verified }}
        />
        <Text style={styles.count}>
          {listings.length} listing{listings.length === 1 ? '' : 's'}
        </Text>
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
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => nav.navigate({ name: 'detail', id: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 28, fontWeight: '800', color: colors.brand },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: colors.textMuted },
  listBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  listBtnText: { color: '#fff', fontWeight: '700' },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  count: { marginLeft: 'auto', fontSize: 12, color: colors.textMuted },
  list: { padding: 16, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  errorBody: { fontSize: 13, color: '#C0392B', textAlign: 'center', marginBottom: 8 },
  errorHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
