/**
 * Type augmentation for k6 types
 * Extends k6 type definitions to match actual runtime behavior
 */

import { Gauge } from 'k6/metrics';

declare module 'k6/metrics' {
  interface Gauge {
    /**
     * Set the gauge to a specific value
     * @param value - The value to set
     * @param tags - Optional tags for the measurement
     */
    set(value: number, tags?: { [key: string]: string }): void;
  }
}
