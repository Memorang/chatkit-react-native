import * as React from 'react';
import { FlatList, StyleSheet, Text, View, type FlatListProps, Image } from 'react-native';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  content: string;
  createdAt?: Date | string | number;
  avatarUri?: string;
  isStreaming?: boolean;
}

export interface ChatListProps extends Partial<FlatListProps<ChatMessage>> {
  messages: ChatMessage[];
  showTimestamps?: boolean;
  showAssistantBadge?: boolean;
  renderMessage?: (item: ChatMessage) => React.ReactElement | null;
  assistantBadgeLabel?: string;
}

const DEFAULT_BADGE_LABEL = 'Assistant';

function formatTimestamp(value?: Date | string | number): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Bubble({ message, showTimestamps, showAssistantBadge, assistantBadgeLabel }: {
  message: ChatMessage;
  showTimestamps?: boolean;
  showAssistantBadge?: boolean;
  assistantBadgeLabel?: string;
}) {
  const isAssistant = message.role === 'assistant';
  const timestamp = showTimestamps ? formatTimestamp(message.createdAt) : undefined;

  return (
    <View style={[styles.row, isAssistant ? styles.rowAssistant : styles.rowUser]}>
      {message.avatarUri ? (
        <Image source={{ uri: message.avatarUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      <View style={[styles.bubble, isAssistant ? styles.bubbleAssistant : styles.bubbleUser]}>
        {showAssistantBadge && isAssistant ? (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{assistantBadgeLabel ?? DEFAULT_BADGE_LABEL}</Text>
          </View>
        ) : null}
        <Text style={styles.content}>{message.content}</Text>
        {message.isStreaming ? <View style={styles.typingIndicator} /> : null}
        {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
      </View>
    </View>
  );
}

export function ChatList({
  messages,
  showAssistantBadge = true,
  showTimestamps = true,
  assistantBadgeLabel = DEFAULT_BADGE_LABEL,
  renderMessage,
  ...flatListProps
}: ChatListProps) {
  const renderItem = React.useCallback<NonNullable<FlatListProps<ChatMessage>['renderItem']>>(
    ({ item }) => {
      if (renderMessage) {
        return renderMessage(item);
      }
      return (
        <Bubble
          message={item}
          showAssistantBadge={showAssistantBadge}
          showTimestamps={showTimestamps}
          assistantBadgeLabel={assistantBadgeLabel}
        />
      );
    },
    [assistantBadgeLabel, renderMessage, showAssistantBadge, showTimestamps],
  );

  const keyExtractor = React.useCallback((item: ChatMessage) => item.id, []);

  return (
    <FlatList
      accessibilityRole="list"
      data={messages}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={[styles.container, flatListProps.contentContainerStyle]}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E1E4E8',
  },
  bubble: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  bubbleAssistant: {
    backgroundColor: '#EEF2FF',
  },
  bubbleUser: {
    backgroundColor: '#D1FAE5',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1F2937',
  },
  typingIndicator: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#A5B4FC',
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'flex-end',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#6366F1',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
