import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ListingCard as Card } from '../types';
import {
  isVerified,
  priceLabel,
  TIER_LABEL,
  TITLE_TYPE_LABEL,
  tierColor,
} from '../format';
import { colors, radius } from '../theme';

interface Props {
  listing: Card;
  onPress?: () => void;
}

// The unit of browsing. Leads with trust (tier badge + title type) and quotes
// money the Nigerian way (₦ per annum), located by landmark. WebP is used
// (universally supported in RN); the API also offers AVIF for capable clients.
export function ListingCard({ listing, onPress }: Props) {
  const verified = isVerified(listing.verificationTier);
  // Smallest derivative (320w WebP) is plenty for a card — low-data rule.
  const heroUri = listing.hero?.sizes?.[0]?.webp ?? null;

  const sizeLine =
    listing.bedrooms != null
      ? `${listing.bedrooms} bed · ${listing.bathrooms ?? 0} bath`
      : listing.plotSizeSqm != null
        ? `${listing.plotSizeSqm} sqm${listing.plotCount ? ` · ${listing.plotCount} plot` : ''}`
        : '';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {heroUri ? (
          <Image source={{ uri: heroUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.imageFallbackText}>No photo</Text>
          </View>
        )}
        <View
          style={[
            styles.badge,
            { backgroundColor: tierColor(listing.verificationTier) },
          ]}
        >
          {verified && <Text style={styles.badgeCheck}>✓</Text>}
          <Text style={styles.badgeText}>
            {TIER_LABEL[listing.verificationTier]}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.price}>
          {priceLabel(listing.priceNaira, listing.quoteBasis)}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.landmark} numberOfLines={1}>
          {listing.landmark} · {listing.city}
        </Text>

        <View style={styles.metaRow}>
          {!!sizeLine && <Text style={styles.meta}>{sizeLine}</Text>}
          <View style={styles.titleChip}>
            <Text style={styles.titleChipText}>
              {TITLE_TYPE_LABEL[listing.titleType]}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 200, backgroundColor: colors.border },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackText: { color: colors.textMuted },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  badgeCheck: { color: '#fff', fontWeight: '800', marginRight: 5, fontSize: 12 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  body: { padding: 14 },
  price: { fontSize: 20, fontWeight: '800', color: colors.brand },
  title: { marginTop: 2, fontSize: 15, fontWeight: '600', color: colors.text },
  landmark: { marginTop: 4, fontSize: 13, color: colors.textMuted },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  meta: { fontSize: 13, color: colors.text },
  titleChip: {
    marginLeft: 'auto',
    backgroundColor: colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
  },
  titleChipText: { fontSize: 12, fontWeight: '600', color: colors.brandTint },
});
