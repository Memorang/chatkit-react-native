import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

export interface ChatComposerProps {
  onSend: (message: string) => void | Promise<void>;
  onAttachPress?: () => void;
  onVoicePress?: () => void;
  placeholder?: string;
  sendLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: React.ComponentProps<typeof View>['style'];
}

export function ChatComposer({
  onSend,
  onAttachPress,
  onVoicePress,
  placeholder = 'Message Assistant…',
  sendLabel = 'Send',
  disabled = false,
  autoFocus = false,
  style,
}: ChatComposerProps) {
  const [value, setValue] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const handleSend = React.useCallback(async () => {
    if (!value.trim() || disabled || isSending) return;
    setIsSending(true);
    try {
      await onSend(value.trim());
      setValue('');
    } finally {
      setIsSending(false);
    }
  }, [disabled, isSending, onSend, value]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}
    >
      <View style={styles.inner}>
        <TouchableOpacity
          accessibilityLabel="Attach"
          accessibilityRole="button"
          onPress={onAttachPress}
          style={styles.iconButton}
          disabled={disabled || isSending}
        >
          <Text style={styles.iconLabel}>＋</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          multiline
          value={value}
          autoFocus={autoFocus}
          editable={!disabled && !isSending}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          accessibilityLabel="Voice"
          accessibilityRole="button"
          onPress={onVoicePress}
          style={styles.iconButton}
          disabled={disabled || isSending}
        >
          <Text style={styles.iconLabel}>🎤</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={handleSend}
          style={[styles.sendButton, (disabled || isSending || !value.trim()) && styles.sendButtonDisabled]}
          disabled={disabled || isSending || !value.trim()}
        >
          <Text style={styles.sendLabel}>{isSending ? '…' : sendLabel}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  iconLabel: {
    fontSize: 20,
    color: '#4B5563',
  },
  input: {
    flex: 1,
    maxHeight: 160,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    lineHeight: 22,
    color: '#111827',
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#111827',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
