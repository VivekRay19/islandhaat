import { IndianState } from '../culture/CultureTypes';
import { ALLIANCE_CONFIG } from '../farming/CropConfig';

export type AllianceStatus = 'none' | 'pending' | 'active' | 'declined' | 'expired';

export interface AllianceRecord {
  id: string;
  hostId: string;
  hostName: string;
  hostIsland: IndianState;
  visitorId: string;
  visitorName: string;
  status: AllianceStatus;
  requestedAt: number;
  activatedAt?: number;
  expiresAt?: number;
}

export class AllianceSystem {
  private activeAlliances: Map<string, AllianceRecord> = new Map();
  private pendingRequests: Map<string, AllianceRecord> = new Map();

  /**
   * Creates a new pending alliance request from a visitor to the host of an island.
   */
  public requestAlliance(
    visitorId: string,
    visitorName: string,
    hostId: string,
    hostName: string,
    hostIsland: IndianState
  ): AllianceRecord {
    // Check if an alliance already exists between them on this island
    const existing = this.getAllianceBetween(visitorId, hostId, hostIsland);
    if (existing && existing.status === 'active' && !this.isExpired(existing)) {
      return existing;
    }

    const allianceId = `alliance_${hostIsland}_${visitorId}_${Date.now()}`;
    const record: AllianceRecord = {
      id: allianceId,
      hostId,
      hostName,
      hostIsland,
      visitorId,
      visitorName,
      status: 'pending',
      requestedAt: Date.now()
    };

    this.pendingRequests.set(allianceId, record);
    return record;
  }

  /**
   * Host accepts the pending alliance request. Authoritatively starts the countdown timer.
   */
  public acceptAlliance(allianceId: string): AllianceRecord | null {
    const record = this.pendingRequests.get(allianceId);
    if (!record || record.status !== 'pending') return null;

    const now = Date.now();
    record.status = 'active';
    record.activatedAt = now;
    record.expiresAt = now + ALLIANCE_CONFIG.durationSeconds * 1000;

    this.pendingRequests.delete(allianceId);
    this.activeAlliances.set(allianceId, record);

    return record;
  }

  /**
   * Host declines the alliance request.
   */
  public declineAlliance(allianceId: string): AllianceRecord | null {
    const record = this.pendingRequests.get(allianceId);
    if (!record) return null;

    record.status = 'declined';
    this.pendingRequests.delete(allianceId);
    return record;
  }

  /**
   * Checks whether a visitor currently possesses legal temporary building and farming permissions.
   */
  public hasActiveAlliance(
    visitorId: string,
    hostIsland: IndianState
  ): { hasPermission: boolean; record?: AllianceRecord; secondsRemaining: number } {
    this.cleanExpiredAlliances();

    for (const record of this.activeAlliances.values()) {
      if (record.visitorId === visitorId && record.hostIsland === hostIsland && record.status === 'active') {
        const remainingMs = (record.expiresAt || 0) - Date.now();
        if (remainingMs > 0) {
          return {
            hasPermission: true,
            record,
            secondsRemaining: Math.ceil(remainingMs / 1000)
          };
        } else {
          record.status = 'expired';
        }
      }
    }

    return { hasPermission: false, secondsRemaining: 0 };
  }

  public getPendingRequestsForHost(hostId: string): AllianceRecord[] {
    this.cleanExpiredAlliances();
    return Array.from(this.pendingRequests.values()).filter(
      (r) => r.hostId === hostId && r.status === 'pending'
    );
  }

  public getPendingRequestsForVisitor(visitorId: string): AllianceRecord[] {
    this.cleanExpiredAlliances();
    return Array.from(this.pendingRequests.values()).filter(
      (r) => r.visitorId === visitorId && r.status === 'pending'
    );
  }

  public getAllianceById(allianceId: string): AllianceRecord | undefined {
    return this.activeAlliances.get(allianceId) || this.pendingRequests.get(allianceId);
  }

  public getAllianceBetween(
    visitorId: string,
    hostId: string,
    hostIsland: IndianState
  ): AllianceRecord | undefined {
    for (const record of this.activeAlliances.values()) {
      if (record.visitorId === visitorId && record.hostId === hostId && record.hostIsland === hostIsland) {
        return record;
      }
    }
    for (const record of this.pendingRequests.values()) {
      if (record.visitorId === visitorId && record.hostId === hostId && record.hostIsland === hostIsland) {
        return record;
      }
    }
    return undefined;
  }

  /**
   * Checks expiration using authoritative timestamps and transitions status to 'expired'.
   */
  public isExpired(record: AllianceRecord): boolean {
    if (record.status === 'expired') return true;
    if (record.status === 'active' && record.expiresAt && Date.now() >= record.expiresAt) {
      record.status = 'expired';
      return true;
    }
    return false;
  }

  public cleanExpiredAlliances(): void {
    const now = Date.now();
    for (const [id, record] of this.activeAlliances.entries()) {
      if (record.expiresAt && now >= record.expiresAt) {
        record.status = 'expired';
      }
    }
    for (const [id, record] of this.pendingRequests.entries()) {
      if (now - record.requestedAt > ALLIANCE_CONFIG.maxPendingTimeSeconds * 1000) {
        record.status = 'expired';
        this.pendingRequests.delete(id);
      }
    }
  }

  public registerAuthoritativeRecord(record: AllianceRecord): void {
    if (record.status === 'active') {
      this.activeAlliances.set(record.id, record);
      this.pendingRequests.delete(record.id);
    } else if (record.status === 'pending') {
      this.pendingRequests.set(record.id, record);
    } else {
      this.activeAlliances.delete(record.id);
      this.pendingRequests.delete(record.id);
    }
  }
}
