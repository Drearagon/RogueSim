import React, { useCallback, useEffect, useMemo, useState } from 'react';

type TerminalPalette = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
};

interface FriendRecord {
  id: number;
  friendId: string;
  hackerName: string;
  profileImageUrl: string | null;
  reputation: string | null;
  status: string;
  requestedAt: string;
  respondedAt: string | null;
  direction: 'accepted' | 'incoming' | 'outgoing';
}

interface BlockRecord {
  userId: string;
  hackerName: string;
  profileImageUrl: string | null;
  reputation: string | null;
  blockedAt: string;
}

interface FriendOverviewResponse {
  friends: FriendRecord[];
  incoming: FriendRecord[];
  outgoing: FriendRecord[];
  blocked: BlockRecord[];
}

interface FriendListPanelProps {
  isVisible: boolean;
  terminalSettings: TerminalPalette;
  presenceMap: Record<string, { username: string; online: boolean }>;
  refreshSignal: number;
}

const sortByName = <T extends { hackerName: string }>(items: T[]) =>
  [...items].sort((a, b) => a.hackerName.localeCompare(b.hackerName));

export function FriendListPanel({ isVisible, terminalSettings, presenceMap, refreshSignal }: FriendListPanelProps) {
  const [overview, setOverview] = useState<FriendOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [newFriendTarget, setNewFriendTarget] = useState('');
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/social/friends', {
        method: 'GET',
        credentials: 'include',
      });

      const payload = (await response.json().catch(() => ({}))) as Partial<FriendOverviewResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to load social data');
      }

      setOverview(payload as FriendOverviewResponse);
    } catch (err) {
      console.error('Failed to load friend overview:', err);
      setError(err instanceof Error ? err.message : 'Unable to load friend data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (isVisible) {
      fetchOverview();
    }
  }, [isVisible, fetchOverview, refreshSignal]);

  const runAction = useCallback(
    async (key: string, action: () => Promise<void>) => {
      setPendingActionKey(key);
      setError(null);
      try {
        await action();
      } finally {
        setPendingActionKey(null);
      }
    },
    [],
  );

  const submitFriendRequest = useCallback(
    async (identifier: string) => {
      if (!identifier.trim()) {
        setError('Provide a hacker name to send a request.');
        return;
      }

      await runAction('invite', async () => {
        const response = await fetch('/api/social/friends/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ targetHackerName: identifier.trim() }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to send friend request');
        }

        setOverview(payload.overview ?? null);
        setActionMessage(payload.message || 'Friend request sent.');
        setNewFriendTarget('');
        setError(null);
      });
    },
    [runAction],
  );

  const acceptFriendRequest = useCallback(
    async (requesterId: string) => {
      await runAction(`accept-${requesterId}`, async () => {
        const response = await fetch('/api/social/friends/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ requesterId }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to accept friend request');
        }

        setOverview(payload.overview ?? null);
        setActionMessage(payload.message || 'Friend request accepted.');
        setError(null);
      });
    },
    [runAction],
  );

  const removeFriendship = useCallback(
    async (targetId: string, message: string) => {
      await runAction(`remove-${targetId}`, async () => {
        const response = await fetch(`/api/social/friends/${targetId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to update friendship');
        }

        setOverview(payload.overview ?? null);
        setActionMessage(payload.message || message);
        setError(null);
      });
    },
    [runAction],
  );

  const blockUser = useCallback(
    async (targetId: string, hackerName?: string) => {
      await runAction(`block-${targetId}`, async () => {
        const response = await fetch('/api/social/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ targetUserId: targetId, targetHackerName: hackerName }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to block user');
        }

        setOverview(payload.overview ?? null);
        setActionMessage(payload.message || 'User blocked.');
        setError(null);
      });
    },
    [runAction],
  );

  const unblockUser = useCallback(
    async (targetId: string) => {
      await runAction(`unblock-${targetId}`, async () => {
        const response = await fetch(`/api/social/blocks/${targetId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to unblock user');
        }

        setOverview(payload.overview ?? null);
        setActionMessage(payload.message || 'User unblocked.');
        setError(null);
      });
    },
    [runAction],
  );

  const sortedFriends = useMemo(() => sortByName(overview?.friends ?? []), [overview?.friends]);
  const sortedIncoming = useMemo(() => sortByName(overview?.incoming ?? []), [overview?.incoming]);
  const sortedOutgoing = useMemo(() => sortByName(overview?.outgoing ?? []), [overview?.outgoing]);
  const sortedBlocked = useMemo(() => sortByName(overview?.blocked ?? []), [overview?.blocked]);

  return (
    <div className="flex flex-col h-64">
      <div className="mb-3 space-y-2">
        {actionMessage && (
          <div
            className="text-xs px-2 py-1 rounded border"
            style={{
              color: terminalSettings.primaryColor,
              borderColor: `${terminalSettings.primaryColor}50`,
              backgroundColor: `${terminalSettings.primaryColor}10`,
            }}
          >
            {actionMessage}
          </div>
        )}
        {error && (
          <div className="text-xs px-2 py-1 rounded border border-red-500/60 text-red-400 bg-red-500/10">
            {error}
          </div>
        )}
        <form
          className="flex space-x-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submitFriendRequest(newFriendTarget);
          }}
        >
          <input
            type="text"
            value={newFriendTarget}
            onChange={(event) => setNewFriendTarget(event.target.value)}
            placeholder="Add friend by hacker name"
            className="flex-1 bg-transparent border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
            style={{
              color: terminalSettings.textColor,
              borderColor: `${terminalSettings.primaryColor}50`,
              backgroundColor: `${terminalSettings.backgroundColor}80`,
            }}
          />
          <button
            type="submit"
            disabled={pendingActionKey === 'invite'}
            className="text-xs px-3 py-1 border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: terminalSettings.primaryColor,
              borderColor: `${terminalSettings.primaryColor}60`,
            }}
          >
            Send
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          Syncing with the network...
        </div>
      )}

      {!loading && overview && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          <section>
            <h3 className="font-semibold mb-2" style={{ color: terminalSettings.primaryColor }}>
              Active Connections
            </h3>
            {sortedFriends.length === 0 && (
              <p className="text-gray-400">No confirmed allies yet.</p>
            )}
            <ul className="space-y-2">
              {sortedFriends.map((friend) => {
                const presence = presenceMap[friend.friendId];
                const isOnline = presence?.online ?? false;
                return (
                  <li
                    key={`friend-${friend.id}`}
                    className="border rounded p-2 flex items-center justify-between"
                    style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                      <div>
                        <p className="font-medium" style={{ color: terminalSettings.textColor }}>
                          {friend.hackerName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Linked {new Date(friend.requestedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => void removeFriendship(friend.friendId, 'Connection removed.')}
                        disabled={pendingActionKey === `remove-${friend.friendId}`}
                        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => void blockUser(friend.friendId, friend.hackerName)}
                        disabled={pendingActionKey === `block-${friend.friendId}`}
                        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                      >
                        Block
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: terminalSettings.primaryColor }}>
              Incoming Requests
            </h3>
            {sortedIncoming.length === 0 && <p className="text-gray-400">No pending inbound requests.</p>}
            <ul className="space-y-2">
              {sortedIncoming.map((request) => (
                <li
                  key={`incoming-${request.id}`}
                  className="border rounded p-2 flex items-center justify-between"
                  style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                >
                  <div>
                    <p className="font-medium" style={{ color: terminalSettings.textColor }}>
                      {request.hackerName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Awaiting response since {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => void acceptFriendRequest(request.friendId)}
                      disabled={pendingActionKey === `accept-${request.friendId}`}
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => void removeFriendship(request.friendId, 'Request declined.')}
                      disabled={pendingActionKey === `remove-${request.friendId}`}
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => void blockUser(request.friendId, request.hackerName)}
                      disabled={pendingActionKey === `block-${request.friendId}`}
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                    >
                      Block
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: terminalSettings.primaryColor }}>
              Outgoing Requests
            </h3>
            {sortedOutgoing.length === 0 && <p className="text-gray-400">No outgoing requests at this time.</p>}
            <ul className="space-y-2">
              {sortedOutgoing.map((request) => (
                <li
                  key={`outgoing-${request.id}`}
                  className="border rounded p-2 flex items-center justify-between"
                  style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                >
                  <div>
                    <p className="font-medium" style={{ color: terminalSettings.textColor }}>
                      {request.hackerName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Sent {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => void removeFriendship(request.friendId, 'Request cancelled.')}
                      disabled={pendingActionKey === `remove-${request.friendId}`}
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void blockUser(request.friendId, request.hackerName)}
                      disabled={pendingActionKey === `block-${request.friendId}`}
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                    >
                      Block
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: terminalSettings.primaryColor }}>
              Blocked Operators
            </h3>
            {sortedBlocked.length === 0 && <p className="text-gray-400">No operatives are blocked.</p>}
            <ul className="space-y-2">
              {sortedBlocked.map((blockedUser) => (
                <li
                  key={`blocked-${blockedUser.userId}`}
                  className="border rounded p-2 flex items-center justify-between"
                  style={{ borderColor: `${terminalSettings.primaryColor}30` }}
                >
                  <div>
                    <p className="font-medium" style={{ color: terminalSettings.textColor }}>
                      {blockedUser.hackerName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Blocked since {new Date(blockedUser.blockedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => void unblockUser(blockedUser.userId)}
                    disabled={pendingActionKey === `unblock-${blockedUser.userId}`}
                    className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: `${terminalSettings.primaryColor}40` }}
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {!loading && !overview && !error && (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          No social data available yet.
        </div>
      )}
    </div>
  );
}
