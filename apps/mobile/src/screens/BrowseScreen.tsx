import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import type { GazetteerSuggestion, ListingCard as Card } from '../types';
import { ListingCard } from '../components/ListingCard';
import { Logo } from '../components/Logo';
import { useNav } from '../navigation';
import { colors, radius } from '../theme';

type ConnState = 'checking' | 'online' | 'offline';

export function BrowseScreen() {
  const nav = useNav();
  const [listings, setListings] = useState<Card[]>([]);
  const [conn, setConn] = useState<ConnState>('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Landmark search state.
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GazetteerSuggestion[]>([]);
  const [selected, setSelected] = useState<GazetteerSuggestion | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const health = await api.health();
      setConn(health.db === 'up' ? 'online' : 'offline');
      const data = selected
        ? await api.searchListings({
            gazetteerId: selected.id,
            verifiedOnly,
            radiusM: 20000,
          })
        : await api.listings({ verifiedOnly });
      setListings(data);
    } catch (e) {
      setConn('offline');
      setError(e instanceof Error ? e.message : 'Failed to reach the API');
    } finally {
      setLoading(false);
    }
  }, [verifiedOnly, selected]);

  useEffect(() => {
    load();
  }, [load]);

  // Typo-tolerant autocomplete, debounced.
  const onQueryChange = (text: string) => {
    setQuery(text);
    if (selected) setSelected(null);
    if (debounce.current) clearTimeout(debounce.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        setSuggestions(await api.searchLandmarks(text.trim()));
      } catch {
        setSuggestions([]);
      }
    }, 200);
  };

  const pickSuggestion = (s: GazetteerSuggestion) => {
    setSelected(s);
    setQuery(s.name);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setSelected(null);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Logo height={30} />
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

      {/* Landmark-first search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search a landmark — “Gwarinpa”, “behind Shoprite Jabi”"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={clearSearch} hitSlop={10} style={styles.clear}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
        {suggestions.length > 0 && (
          <View style={styles.suggestBox}>
            {suggestions.map((s) => (
              <Pressable key={s.id} style={styles.suggestRow} onPress={() => pickSuggestion(s)}>
                <Text style={styles.suggestName}>{s.name}</Text>
                <Text style={styles.suggestMeta}>{s.kind} · {s.city}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Verified only</Text>
        <Switch value={verifiedOnly} onValueChange={setVerifiedOnly} trackColor={{ true: colors.verified }} />
        {selected ? (
          <Pressable style={styles.nearChip} onPress={clearSearch}>
            <Text style={styles.nearChipText}>near {selected.name} ✕</Text>
          </Pressable>
        ) : null}
        <Text style={styles.count}>
          {listings.length} listing{listings.length === 1 ? '' : 's'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brand} /></View>
      ) : error && listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Can't reach the API</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Text style={styles.errorHint}>
            Is the backend running, and is EXPO_PUBLIC_API_URL pointing at it?
          </Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>No listings here yet</Text>
          <Text style={styles.errorHint}>
            {selected ? `Nothing near ${selected.name}. Try a wider area.` : 'Be the first to list.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ListingCard listing={item} onPress={() => nav.navigate({ name: 'detail', id: item.id })} />
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
  listBtn: { backgroundColor: colors.brand, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  listBtnText: { color: '#fff', fontWeight: '700' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 4, zIndex: 10 },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
  },
  clear: { position: 'absolute', right: 28, top: 15 },
  clearText: { color: colors.textMuted, fontSize: 16 },
  suggestBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  suggestRow: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  suggestName: { fontSize: 15, fontWeight: '600', color: colors.text },
  suggestMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  nearChip: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nearChipText: { fontSize: 12, fontWeight: '600', color: colors.brandTint },
  count: { marginLeft: 'auto', fontSize: 12, color: colors.textMuted },
  list: { padding: 16, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  errorBody: { fontSize: 13, color: '#C0392B', textAlign: 'center', marginBottom: 8 },
  errorHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
