import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../api/client';
import type { ListingDetail } from '../types';
import { useNav } from '../navigation';
import {
  feeLabel,
  formatNaira,
  isVerified,
  priceLabel,
  TIER_LABEL,
  TITLE_TYPE_LABEL,
  TITLE_TYPE_RISK,
  tierColor,
  totalCostOfAcquisition,
  TYPE_LABEL,
} from '../format';
import { colors, radius } from '../theme';

export function ListingDetailScreen({ id }: { id: string }) {
  const nav = useNav();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listing(id)
      .then(setListing)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't load this listing</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Pressable onPress={nav.goBack}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      </View>
    );
  }
  if (!listing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const gallery = listing.media.flatMap((m) => m.sizes.filter((s) => s.width >= 800));
  const tca = totalCostOfAcquisition(listing.priceNaira, listing.feeLines);
  const verified = isVerified(listing.verificationTier);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.topBar}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.typeTag}>{TYPE_LABEL[listing.type]}</Text>
      </View>

      {/* Photo gallery — evidence, not decoration. First eager, rest lazy. */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {gallery.length > 0 ? (
          gallery.map((s, i) => (
            <Image
              key={i}
              source={{ uri: s.webp }}
              style={styles.hero}
              resizeMode="cover"
            />
          ))
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Text style={styles.imageFallbackText}>No photos yet</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.pad}>
        <Text style={styles.price}>
          {priceLabel(listing.priceNaira, listing.quoteBasis)}
        </Text>
        {listing.quoteBasis === 'per_annum' && listing.upfrontYears ? (
          <Text style={styles.upfront}>
            {listing.upfrontYears} year{listing.upfrontYears > 1 ? 's' : ''} upfront
          </Text>
        ) : null}
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.landmark}>
          {listing.landmark} · {listing.area}, {listing.city}
        </Text>
      </View>

      {/* ── Trust Panel (Step 4 fills this out; real data shown now) ── */}
      <View style={[styles.panel, styles.pad]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Trust Panel</Text>
          <View
            style={[styles.badge, { backgroundColor: tierColor(listing.verificationTier) }]}
          >
            {verified && <Text style={styles.badgeCheck}>✓</Text>}
            <Text style={styles.badgeText}>{TIER_LABEL[listing.verificationTier]}</Text>
          </View>
        </View>

        <Row label="Title type" value={TITLE_TYPE_LABEL[listing.titleType]} />
        <Text style={styles.risk}>{TITLE_TYPE_RISK[listing.titleType]}</Text>

        <Row
          label="Registry check"
          value={
            listing.verificationCheckedAt
              ? `Checked ${new Date(listing.verificationCheckedAt).toLocaleDateString()}`
              : 'Not checked'
          }
        />
        {listing.verifyingFirmName ? (
          <Row
            label="Verified by"
            value={`${listing.verifyingFirmName}${
              listing.verifyingSolicitorName ? ` · ${listing.verifyingSolicitorName}` : ''
            }`}
          />
        ) : null}
        <Row
          label="Acquisition zone"
          value={
            listing.acquisitionZoneResult === 'clear'
              ? 'Clear'
              : listing.acquisitionZoneResult === 'overlap'
                ? 'Overlap detected'
                : 'Not checked'
          }
        />
        {listing.verificationScopeStatement ? (
          <Text style={styles.scope}>{listing.verificationScopeStatement}</Text>
        ) : null}
      </View>

      {/* ── Total Cost of Acquisition (Step 5 builds the full calculator) ── */}
      <View style={[styles.panel, styles.pad]}>
        <Text style={styles.panelTitle}>Total Cost of Acquisition</Text>
        <Row label="Price" value={formatNaira(listing.priceNaira)} />
        {listing.feeLines.map((f) => (
          <Row
            key={f.id}
            label={`${feeLabel(f)}${f.refundable ? ' (refundable)' : ''}`}
            value={formatNaira(f.amountNaira)}
          />
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Estimated landed cost</Text>
          <Text style={styles.totalValue}>{formatNaira(tca)}</Text>
        </View>
        <Text style={styles.feeNote}>
          Every fee itemised, disclosed up front. No hidden charges.
        </Text>
      </View>

      {/* Core stats */}
      <View style={[styles.pad, styles.statsWrap]}>
        {listing.bedrooms != null && <Stat label="Beds" value={`${listing.bedrooms}`} />}
        {listing.bathrooms != null && <Stat label="Baths" value={`${listing.bathrooms}`} />}
        {listing.internalAreaSqm && <Stat label="Area" value={`${listing.internalAreaSqm} sqm`} />}
        {listing.plotSizeSqm && <Stat label="Plot" value={`${listing.plotSizeSqm} sqm`} />}
        {listing.yearBuilt && <Stat label="Built" value={`${listing.yearBuilt}`} />}
      </View>

      {listing.description ? (
        <View style={styles.pad}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>
      ) : null}

      {listing.agentName ? (
        <View style={[styles.pad, styles.agentCard]}>
          <Text style={styles.agentLabel}>Listed by</Text>
          <Text style={styles.agentName}>{listing.agentName}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  back: { color: colors.brand, fontWeight: '700', fontSize: 15 },
  typeTag: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  hero: { width: 360, height: 240, backgroundColor: colors.border },
  heroFallback: { alignItems: 'center', justifyContent: 'center', width: 360 },
  imageFallbackText: { color: colors.textMuted },
  pad: { paddingHorizontal: 16, paddingVertical: 8 },
  price: { fontSize: 26, fontWeight: '800', color: colors.brand },
  upfront: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 8 },
  landmark: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  panel: {
    marginTop: 12,
    marginHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  panelTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  badgeCheck: { color: '#fff', fontWeight: '800', marginRight: 5, fontSize: 12 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.textMuted, flex: 1 },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  risk: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 4 },
  scope: { fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 17 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.brand,
  },
  totalLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '800', color: colors.brand },
  feeNote: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
  statsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginTop: 8 },
  stat: { minWidth: 60 },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  description: { fontSize: 14, color: colors.text, lineHeight: 20 },
  agentCard: {
    marginTop: 12,
    marginHorizontal: 12,
    backgroundColor: colors.chipBg,
    borderRadius: radius.card,
    paddingVertical: 14,
  },
  agentLabel: { fontSize: 12, color: colors.textMuted },
  agentName: { fontSize: 16, fontWeight: '700', color: colors.brand, marginTop: 2 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  errorBody: { fontSize: 13, color: '#C0392B', textAlign: 'center', marginBottom: 12 },
});
