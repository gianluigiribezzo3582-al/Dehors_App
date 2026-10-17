import Ionicons from '@expo/vector-icons/Ionicons';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/colors';
import { AppText, Field, type IconName } from './ui';

/** Riga con interruttore. */
export function SwitchRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <AppText variant="label">{label}</AppText>
        {hint ? <AppText variant="caption">{hint}</AppText> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.primary, false: theme.surfaceAlt }}
        thumbColor="#FFFFFF"
      />
    </Pressable>
  );
}

/** Scelta di un'icona da una griglia. */
export function IconPicker({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.grid}>
      {options.map((name) => {
        const active = name === value;
        return (
          <Pressable
            key={name}
            accessibilityLabel={name}
            onPress={() => onChange(name)}
            style={[
              styles.iconCell,
              { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.surfaceAlt : 'transparent' },
            ]}>
            <Ionicons name={name as IconName} size={22} color={active ? theme.primary : theme.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Scelta di un colore. */
export function ColorPicker({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.grid}>
      {options.map((c) => (
        <Pressable
          key={c}
          accessibilityLabel={c}
          onPress={() => onChange(c)}
          style={[styles.swatch, { backgroundColor: c, borderColor: c === value ? theme.text : 'transparent' }]}>
          {c === value ? <Ionicons name="checkmark" size={20} color="#FFFFFF" /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Data e ora: selettori nativi su Android/iOS, testo «GG/MM/AAAA HH:MM» sul web. */
export function DateTimeField({ label, value, onChange }: { label: string; value: Date; onChange: (d: Date) => void }) {
  const theme = useTheme();
  const dateText = value.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const timeText = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  const [webText, setWebText] = useState(
    `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()} ${timeText}`,
  );

  if (Platform.OS === 'web') {
    return (
      <Field
        label={`${label} (GG/MM/AAAA HH:MM)`}
        value={webText}
        onChangeText={(t) => {
          setWebText(t);
          const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
          if (m) onChange(new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]));
        }}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={{ gap: Spacing.xs }}>
        <AppText variant="caption">{label}</AppText>
        <RNDateTimePicker
          value={value}
          mode="datetime"
          display="compact"
          locale="it-IT"
          onChange={(_, d) => d && onChange(d)}
        />
      </View>
    );
  }

  const open = (mode: 'date' | 'time') =>
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: true,
      onChange: (event, d) => {
        if (event.type === 'set' && d) onChange(d);
      },
    });

  return (
    <View style={{ gap: Spacing.xs }}>
      <AppText variant="caption">{label}</AppText>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Pressable onPress={() => open('date')} style={[styles.dateBtn, { flex: 2, borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="calendar-outline" size={18} color={theme.primary} />
          <AppText variant="body">{dateText}</AppText>
        </Pressable>
        <Pressable onPress={() => open('time')} style={[styles.dateBtn, { flex: 1, borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="time-outline" size={18} color={theme.primary} />
          <AppText variant="body">{timeText}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

/** Pulsanti su/giù per riordinare. */
export function MoveButtons({ onUp, onDown }: { onUp?: () => void; onDown?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      <Pressable accessibilityLabel="Sposta su" disabled={!onUp} onPress={onUp} hitSlop={6} style={{ opacity: onUp ? 1 : 0.25 }}>
        <Ionicons name="chevron-up" size={22} color={theme.textSecondary} />
      </Pressable>
      <Pressable accessibilityLabel="Sposta giù" disabled={!onDown} onPress={onDown} hitSlop={6} style={{ opacity: onDown ? 1 : 0.25 }}>
        <Ionicons name="chevron-down" size={22} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

export function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const next = list.slice();
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** «4,50» → 4.5; vuoto o non valido → undefined. */
export function parsePrice(text: string): number | undefined {
  const v = Number(text.replace(',', '.').replace(/[^0-9.]/g, ''));
  return text.trim() && Number.isFinite(v) ? Math.round(v * 100) / 100 : undefined;
}

export function priceToText(v: number | undefined) {
  return v === undefined ? '' : v.toFixed(2).replace('.', ',');
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  iconCell: { width: 48, height: 48, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  dateBtn: {
    minHeight: 50,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
