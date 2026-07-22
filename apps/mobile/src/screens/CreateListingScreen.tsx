import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../api/client';
import type {
  CreateFeeLineInput,
  ListingType,
  QuoteBasis,
  TitleType,
} from '../types';
import { useNav } from '../navigation';
import { TITLE_TYPE_LABEL, TYPE_LABEL } from '../format';
import { colors, radius } from '../theme';

const TYPES: ListingType[] = ['buy', 'rent', 'short-let', 'land', 'off-plan'];
const TITLES: TitleType[] = [
  'c-of-o',
  'governors-consent',
  'deed-of-assignment',
  'letter-of-allocation',
];
const FEE_KINDS = [
  'agency-commission',
  'caution-deposit',
  'legal-fee',
  'service-charge',
  'survey-fee',
  'stamp-duty',
  'governors-consent-fee',
  'registration',
  'platform-fee',
];

// Create listing doubles as training in Unö's standard: title type and at least
// one itemised fee are required, so the agent learns the rules by using them.
export function CreateListingScreen() {
  const nav = useNav();
  const [type, setType] = useState<ListingType>('rent');
  const [title, setTitle] = useState('');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Abuja');
  const [price, setPrice] = useState('');
  const [upfrontYears, setUpfrontYears] = useState('1');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [titleType, setTitleType] = useState<TitleType>('c-of-o');
  const [fees, setFees] = useState<CreateFeeLineInput[]>([
    { kind: 'agency-commission', amountNaira: '' },
    { kind: 'platform-fee', amountNaira: '' },
  ]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRent = type === 'rent' || type === 'short-let';

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const setFee = (i: number, patch: Partial<CreateFeeLineInput>) =>
    setFees((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addFee = () =>
    setFees((f) => [...f, { kind: nextKind(f), amountNaira: '' }]);
  const removeFee = (i: number) => setFees((f) => f.filter((_, j) => j !== i));

  const submit = async () => {
    if (!title || !landmark || !area || !price) {
      Alert.alert('Missing info', 'Title, landmark, area and price are required.');
      return;
    }
    const cleanFees = fees.filter((f) => f.amountNaira.trim().length > 0);
    if (cleanFees.length === 0) {
      Alert.alert('Fees required', 'Add at least one itemised fee line.');
      return;
    }
    setSubmitting(true);
    try {
      const listing = await api.createListing({
        type,
        title,
        landmark,
        area,
        city,
        priceNaira: price.replace(/\D/g, ''),
        quoteBasis: (isRent ? 'per_annum' : 'total') as QuoteBasis,
        upfrontYears: isRent ? Number(upfrontYears) || undefined : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        titleType,
        feeLines: cleanFees.map((f) => ({
          kind: f.kind,
          amountNaira: f.amountNaira.replace(/\D/g, ''),
        })),
      });
      if (photoUri) {
        try {
          await api.uploadMedia(listing.id, photoUri);
        } catch {
          /* non-fatal for the demo */
        }
      }
      nav.navigate({ name: 'detail', id: listing.id });
    } catch (e) {
      Alert.alert('Could not create', e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.topBar}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.back}>← Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>New listing</Text>
      </View>

      <Section label="Type">
        <Chips
          options={TYPES}
          value={type}
          onChange={setType}
          render={(t) => TYPE_LABEL[t]}
        />
      </Section>

      <Section label="Title">
        <Input value={title} onChangeText={setTitle} placeholder="3-Bedroom Serviced Apartment" />
      </Section>

      <Section label="Location (landmark-first)">
        <Input value={landmark} onChangeText={setLandmark} placeholder="Behind Shoprite, Jabi" />
        <View style={{ height: 8 }} />
        <View style={styles.rowInputs}>
          <Input style={{ flex: 1 }} value={area} onChangeText={setArea} placeholder="Area / estate" />
          <Input style={{ flex: 1 }} value={city} onChangeText={setCity} placeholder="City" />
        </View>
      </Section>

      <Section label={isRent ? 'Annual rent (₦)' : 'Price (₦)'}>
        <Input value={price} onChangeText={setPrice} placeholder="4500000" keyboardType="numeric" />
        {isRent ? (
          <>
            <View style={{ height: 8 }} />
            <Text style={styles.subLabel}>Years upfront</Text>
            <Input value={upfrontYears} onChangeText={setUpfrontYears} keyboardType="numeric" />
          </>
        ) : null}
      </Section>

      {!['land'].includes(type) ? (
        <Section label="Rooms">
          <View style={styles.rowInputs}>
            <Input style={{ flex: 1 }} value={bedrooms} onChangeText={setBedrooms} placeholder="Beds" keyboardType="numeric" />
            <Input style={{ flex: 1 }} value={bathrooms} onChangeText={setBathrooms} placeholder="Baths" keyboardType="numeric" />
          </View>
        </Section>
      ) : null}

      <Section label="Title type (required)">
        <Chips
          options={TITLES}
          value={titleType}
          onChange={setTitleType}
          render={(t) => TITLE_TYPE_LABEL[t]}
        />
      </Section>

      <Section label="Fees (itemised, required)">
        {fees.map((f, i) => (
          <View key={i} style={styles.feeRow}>
            <Pressable
              style={styles.feeKind}
              onPress={() => setFee(i, { kind: nextKind(fees, f.kind) })}
            >
              <Text style={styles.feeKindText}>{f.kind}</Text>
            </Pressable>
            <Input
              style={{ flex: 1 }}
              value={f.amountNaira}
              onChangeText={(v) => setFee(i, { amountNaira: v })}
              placeholder="₦ amount"
              keyboardType="numeric"
            />
            {fees.length > 1 ? (
              <Pressable onPress={() => removeFee(i)} hitSlop={8}>
                <Text style={styles.remove}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        <Pressable onPress={addFee}>
          <Text style={styles.addFee}>+ Add fee line</Text>
        </Pressable>
      </Section>

      <Section label="Photo">
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} />
        ) : null}
        <Pressable style={styles.photoBtn} onPress={pickPhoto}>
          <Text style={styles.photoBtnText}>
            {photoUri ? 'Change photo' : '+ Add photo'}
          </Text>
        </Pressable>
      </Section>

      <Pressable
        style={[styles.submit, submitting && { opacity: 0.6 }]}
        onPress={submit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Publishing…' : 'Publish listing'}
        </Text>
      </Pressable>
      <Text style={styles.tierNote}>
        New listings start as “Listed”. Verification tiers are granted by review.
      </Text>
    </ScrollView>
  );
}

function nextKind(fees: CreateFeeLineInput[], current?: string): string {
  const used = new Set(fees.map((f) => f.kind));
  const start = current ? FEE_KINDS.indexOf(current) + 1 : 0;
  for (let k = 0; k < FEE_KINDS.length; k++) {
    const cand = FEE_KINDS[(start + k) % FEE_KINDS.length];
    if (cand === current || !used.has(cand)) return cand;
  }
  return FEE_KINDS[0];
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor={colors.textMuted}
    />
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
  render,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <Pressable
          key={o}
          style={[styles.chip, o === value && styles.chipActive]}
          onPress={() => onChange(o)}
        >
          <Text style={[styles.chipText, o === value && styles.chipTextActive]}>
            {render(o)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { color: colors.brand, fontWeight: '700', fontSize: 15 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.text },
  section: { paddingHorizontal: 16, paddingVertical: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  rowInputs: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  feeKind: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 140,
  },
  feeKindText: { fontSize: 12, color: colors.brandTint, fontWeight: '600' },
  remove: { color: '#C0392B', fontSize: 16, paddingHorizontal: 4 },
  addFee: { color: colors.brand, fontWeight: '700', marginTop: 4 },
  photoBtn: {
    backgroundColor: colors.chipBg,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  photoBtnText: { color: colors.brandTint, fontWeight: '700' },
  preview: { width: '100%', height: 180, borderRadius: radius.card, marginBottom: 8 },
  submit: {
    backgroundColor: colors.brand,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  tierNote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
});
