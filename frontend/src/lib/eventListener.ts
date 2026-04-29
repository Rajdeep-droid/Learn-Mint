// ============================================================================
// EVENT LISTENER — Soroban Event Polling
// ============================================================================
// Polls the Soroban RPC for course_passed events emitted by the
// Course & Quiz contract. Converts XDR event data to a readable format.
// ============================================================================

import { COURSE_QUIZ_CONTRACT_ID, getServer } from "./stellar";
import { xdr, Address } from "@stellar/stellar-sdk";

// ── Types ────────────────────────────────────────────────────────────────

export interface CoursePassed {
  id: string;
  address: string;
  courseId: number;
  timestamp: Date;
  ledger: number;
}

// ── Event Listener Class ─────────────────────────────────────────────────

export class CourseEventListener {
  private lastLedger: number = 0;
  private interval: NodeJS.Timeout | null = null;
  private onEvent: (event: CoursePassed) => void;
  private pollIntervalMs: number;

  constructor(
    onEvent: (event: CoursePassed) => void,
    pollIntervalMs: number = 5000
  ) {
    this.onEvent = onEvent;
    this.pollIntervalMs = pollIntervalMs;
  }

  async start() {
    if (this.interval) return; // Already running

    // Get current ledger to start from
    try {
      const server = getServer();
      const health = await server.getHealth();
      this.lastLedger = health.latestLedger;
    } catch {
      // If we can't reach the server, start from 0
      this.lastLedger = 0;
    }

    this.interval = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async poll() {
    if (!COURSE_QUIZ_CONTRACT_ID || this.lastLedger === 0) return;

    try {
      const server = getServer();

      const response = await server.getEvents({
        startLedger: this.lastLedger,
        filters: [
          {
            type: "contract",
            contractIds: [COURSE_QUIZ_CONTRACT_ID],
            topics: [
              // Base64 XDR for Symbol("course") and Symbol("passed")
              ["AAAADwAAAAZjb3Vyc2U=", "AAAADwAAAAZwYXNzZWQ="],
            ],
          },
        ],
        limit: 20,
      });

      if (response.events && response.events.length > 0) {
        for (const event of response.events) {
          try {
            const parsed = this.parseEvent(event);
            if (parsed) {
              this.onEvent(parsed);
            }
          } catch (err) {
            console.warn("Failed to parse event:", err);
          }

          // Update cursor
          this.lastLedger = event.ledger + 1;
        }
      }

      // Update latest ledger even if no events
      if (response.latestLedger) {
        this.lastLedger = response.latestLedger;
      }
    } catch (error) {
      console.warn("Event polling failed:", error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseEvent(event: any): CoursePassed | null {
    try {
      // The event data is a tuple (user_address, course_id)
      const value = event.value;
      if (!value || value.switch().name !== "scvVec") return null;

      const vec = value.vec();
      if (!vec || vec.length < 2) return null;

      // Extract address
      const addressVal = vec[0];
      const address = Address.fromScVal(addressVal).toString();

      // Extract course_id (u32)
      const courseIdVal = vec[1];
      const courseId = courseIdVal.u32();

      return {
        id: event.id || `${event.ledger}-${address}`,
        address,
        courseId,
        timestamp: new Date(event.createdAt || Date.now()),
        ledger: event.ledger,
      };
    } catch {
      return null;
    }
  }
}
