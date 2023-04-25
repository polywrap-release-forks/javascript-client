import { Encoder, Decoder, ExtensionCodec } from "@msgpack/msgpack";

enum ExtensionTypes {
  // must be in range 0-127
  GENERIC_MAP = 1,
}

const extensionCodec = new ExtensionCodec();

// Generic Map: Map<K, V>
extensionCodec.register({
  type: ExtensionTypes.GENERIC_MAP,
  encode: (object: unknown): Uint8Array | null => {
    if (object instanceof Map) {
      const optimized: Record<string | number, unknown> = {};
      for (const [key, value] of object) {
        optimized[key] = value;
      }
      return msgpackEncode(optimized);
    } else {
      return null;
    }
  },
  decode: (data: Uint8Array) => {
    const obj = msgpackDecode(data) as Record<string | number, unknown>;
    const map = new Map();

    for (const [key, value] of Object.entries(obj)) {
      map.set(key, value);
    }
    return map;
  },
});

const shouldIgnore = (obj: unknown) =>
  obj instanceof ArrayBuffer || ArrayBuffer.isView(obj) || obj instanceof Map;

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  if (shouldIgnore(obj)) {
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "function") {
      delete obj[key];
    } else if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      const sanitized = sanitize(obj[key] as Record<string, unknown>);
      if (Array.isArray(obj[key])) {
        obj[key] = Object.values(sanitized);
      } else {
        obj[key] = sanitized;
      }
    }
  }
  return obj;
}

export function msgpackEncode(
  object: unknown,
  sanitizeObj = false
): Uint8Array {
  const encoder = new Encoder(
    extensionCodec,
    undefined, // context
    undefined, // maxDepth
    undefined, // initialBufferSize
    undefined, // sortKeys
    undefined, // forceFloat32
    true, // ignoreUndefined
    undefined // forceIntegerToFloat
  );

  if (sanitizeObj && typeof object === "object" && !shouldIgnore(object)) {
    const deepClone = JSON.parse(JSON.stringify(object));
    object = sanitize(deepClone);
  }

  return encoder.encode(object);
}

export function msgpackDecode(
  buffer: ArrayLike<number> | BufferSource,
  sanitizeResult = false
): unknown {
  const decoder = new Decoder(extensionCodec);
  const result = decoder.decode(buffer);

  if (sanitizeResult && typeof result === "object" && !shouldIgnore(result)) {
    return sanitize(result as Record<string, unknown>);
  } else {
    return result;
  }
}
