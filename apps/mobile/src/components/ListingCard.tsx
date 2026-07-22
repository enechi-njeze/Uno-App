import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../types';
import { priceLabel, TITLE_TYPE_LABEL, TIER_LABEL } from '../format';
import { colors, radius } from '../theme';

interface Props {
  listing: Listing;
}

// The single most important surface in Phase 1: a listing card that leads with
// trust (verified badge + title type) and quotes money the Nigerian way
// (₦ per annum), located by landmark rather than street address.
export function ListingCard({ listing }: Props) {
  const isVerified =
    listing.verificationTier === 'verified' ||
    listing.verificationTier === 'premium';

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {listing.coverImageUrl ? (
          <Image
            source={{ uri: listing.coverImageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.imageFallbackText}>No photo</Text>
          </View>
        )}

        {isVerified && (
          <View style={styles.badge}>
            <Text style={styles.badgeCheck}>✓</Text>
            <Text style={styles.badgeText}>
              {TIER_LABEL[listing.verificationTier]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.price}>
          {priceLabel(listing.priceNaira, listing.listingType)}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        <Text style={styles.landmark} numberOfLines={1}>
          {listing.landmark} · {listing.city}
        </Text>

        <View style={styles.metaRow}>
          {listing.bedrooms != null && (
            <Text style={styles.meta}>{listing.bedrooms} bed</Text>
          )}
          {listing.bathrooms != null && (
            <Text style={styles.meta}>{listing.bathrooms} bath</Text>
          )}
          <View style={styles.titleChip}>
            <Text style={styles.titleChipText}>
              {TITLE_TYPE_LABEL[listing.titleType]}
            </Text>
          </View>
        </View>
      </View>
    </View>
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
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: colors.textMuted,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.verified,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.chip,
  },
  badgeCheck: {
    color: '#fff',
    fontWeight: '800',
    marginRight: 5,
    fontSize: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  body: {
    padding: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.brand,
  },
  title: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  landmark: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  meta: {
    fontSize: 13,
    color: colors.text,
  },
  titleChip: {
    marginLeft: 'auto',
    backgroundColor: colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.chip,
  },
  titleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandTint,
  },
});
