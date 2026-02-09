/**
 * Reusable Check Functions
 * Common validation checks for HTTP responses
 */

import { check } from 'k6';
import { RefinedResponse, ResponseType } from 'k6/http';

/**
 * Check if response status is 200 OK
 */
export function checkStatusOk(response: RefinedResponse<ResponseType | undefined>): boolean {
  return check(response, {
    'status is 200': (r) => r.status === 200,
  });
}

/**
 * Check if response status is 201 Created
 */
export function checkStatusCreated(response: RefinedResponse<ResponseType | undefined>): boolean {
  return check(response, {
    'status is 201': (r) => r.status === 201,
  });
}

/**
 * Check if response status is 204 No Content
 */
export function checkStatusNoContent(
  response: RefinedResponse<ResponseType | undefined>
): boolean {
  return check(response, {
    'status is 204': (r) => r.status === 204,
  });
}

/**
 * Check if response status is in 2xx range (successful)
 */
export function checkStatusSuccess(response: RefinedResponse<ResponseType | undefined>): boolean {
  return check(response, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
  });
}

/**
 * Check response time is within limit
 */
export function checkResponseTime(
  response: RefinedResponse<ResponseType | undefined>,
  maxMs: number
): boolean {
  return check(response, {
    [`response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

/**
 * Check response body is not empty
 */
export function checkBodyNotEmpty(response: RefinedResponse<ResponseType | undefined>): boolean {
  return check(response, {
    'body is not empty': (r) => {
      const body = r.body;
      if (typeof body === 'string') {
        return body.length > 0;
      }
      if (body instanceof ArrayBuffer) {
        return body.byteLength > 0;
      }
      return body !== null && body !== undefined;
    },
  });
}

/**
 * Check response body contains specific text
 */
export function checkBodyContains(
  response: RefinedResponse<ResponseType | undefined>,
  text: string
): boolean {
  return check(response, {
    [`body contains '${text}'`]: (r) => {
      const body = r.body as string | null;
      return body !== null && typeof body === 'string' && body.includes(text);
    },
  });
}

/**
 * Check response is valid JSON
 */
export function checkValidJson(response: RefinedResponse<ResponseType | undefined>): boolean {
  return check(response, {
    'response is valid JSON': (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    },
  });
}

/**
 * Check JSON response has specific field
 */
export function checkJsonHasField(
  response: RefinedResponse<ResponseType | undefined>,
  fieldPath: string
): boolean {
  return check(response, {
    [`JSON has field '${fieldPath}'`]: (r) => {
      try {
        const json = r.json() as any;
        const fields = fieldPath.split('.');
        let current = json;
        for (const field of fields) {
          if (current[field] === undefined) {
            return false;
          }
          current = current[field];
        }
        return true;
      } catch {
        return false;
      }
    },
  });
}

/**
 * Check JSON field has expected value
 */
export function checkJsonFieldEquals(
  response: RefinedResponse<ResponseType | undefined>,
  fieldPath: string,
  expectedValue: any
): boolean {
  return check(response, {
    [`JSON field '${fieldPath}' equals '${expectedValue}'`]: (r) => {
      try {
        const json = r.json() as any;
        const fields = fieldPath.split('.');
        let current = json;
        for (const field of fields) {
          if (current[field] === undefined) {
            return false;
          }
          current = current[field];
        }
        return current === expectedValue;
      } catch {
        return false;
      }
    },
  });
}

/**
 * Check response headers contain specific header
 */
export function checkHeaderExists(
  response: RefinedResponse<ResponseType | undefined>,
  headerName: string
): boolean {
  return check(response, {
    [`header '${headerName}' exists`]: (r) => r.headers[headerName] !== undefined,
  });
}

/**
 * Check response header has expected value
 */
export function checkHeaderEquals(
  response: RefinedResponse<ResponseType | undefined>,
  headerName: string,
  expectedValue: string
): boolean {
  return check(response, {
    [`header '${headerName}' equals '${expectedValue}'`]: (r) =>
      r.headers[headerName] === expectedValue,
  });
}

/**
 * Comprehensive check for successful API response
 */
export function checkApiSuccess(
  response: RefinedResponse<ResponseType | undefined>,
  maxResponseTime?: number
): boolean {
  const checks: Record<string, (r: RefinedResponse<ResponseType | undefined>) => boolean> = {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response body exists': (r) => r.body !== null && r.body !== undefined,
    'valid JSON response': (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    },
  };

  if (maxResponseTime) {
    checks[`response time < ${maxResponseTime}ms`] = (r) => r.timings.duration < maxResponseTime;
  }

  return check(response, checks);
}

/**
 * Check for common error patterns
 */
export function checkNoErrors(response: RefinedResponse<ResponseType | undefined>): boolean {
  return check(response, {
    'no error status (4xx/5xx)': (r) => r.status < 400,
    'no error field in response': (r) => {
      try {
        const json = r.json() as any;
        return !json.error && !json.errors;
      } catch {
        return true; // Not JSON, consider it as no error field
      }
    },
  });
}

/**
 * Combined check for successful GET request
 */
export function checkGetSuccess(
  response: RefinedResponse<ResponseType | undefined>,
  maxResponseTime: number = 1000
): boolean {
  return check(response, {
    'GET status is 200': (r) => r.status === 200,
    'GET response time OK': (r) => r.timings.duration < maxResponseTime,
    'GET body not empty': (r) => {
      const body = r.body;
      if (typeof body === 'string') {
        return body.length > 0;
      }
      if (body instanceof ArrayBuffer) {
        return body.byteLength > 0;
      }
      return body !== null && body !== undefined;
    },
    'GET valid JSON': (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    },
  });
}

/**
 * Combined check for successful POST request
 */
export function checkPostSuccess(
  response: RefinedResponse<ResponseType | undefined>,
  maxResponseTime: number = 2000
): boolean {
  return check(response, {
    'POST status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'POST response time OK': (r) => r.timings.duration < maxResponseTime,
    'POST valid JSON': (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    },
  });
}
