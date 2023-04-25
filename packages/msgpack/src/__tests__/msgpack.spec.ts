import { msgpackEncode, msgpackDecode } from "../";

describe("msgpack", () => {
  const expectedArrayLike = [
    130, 168, 102, 105, 114, 115, 116,  75,
    101, 121, 170, 102, 105, 114, 115, 116,
    86,  97, 108, 117, 101, 169, 115, 101,
    99, 111, 110, 100,  75, 101, 121, 171,
    115, 101,  99, 111, 110, 100,  86,  97,
    108, 117, 101
  ]
  it("Should encode and decode object", () => {
    const customObject = {
      "firstKey": "firstValue",
      "secondKey": "secondValue",
    }
    const encoded = msgpackEncode(customObject)
    expect(encoded).toEqual(Uint8Array.from(expectedArrayLike))
    const decoded = msgpackDecode(encoded)
    expect(decoded).toEqual(customObject);
  });

  it("Should encode and decode map", () => {
    const customMap = new Map()
    customMap.set("firstKey", "firstValue")
    customMap.set("secondKey", "secondValue")

    const encoded = msgpackEncode(customMap)
    const decoded = msgpackDecode(encoded)
    expect(decoded).toEqual(customMap);
  });

  it("Should encode and decode nested map", () => {
    const customMap: Map<string, Map<string, string>> = new Map()
    // @ts-ignore
    customMap.set("firstKey", new Map([["one", "1"]]));
    customMap.set("secondKey", new Map([["second", "2"]]));

    const encoded = msgpackEncode(customMap)
    const decoded = msgpackDecode(encoded)
    expect(decoded).toEqual(customMap);
  });

  it("Should encode and decode map of bytes", () => {
    const customMap: Map<string, Uint8Array> = new Map()
    customMap.set("firstKey", new Uint8Array([1, 2, 3]));
    customMap.set("secondKey", new Uint8Array([3, 2, 1]));

    const encoded = msgpackEncode(customMap)
    const decoded = msgpackDecode(encoded)
    expect(decoded).toEqual(customMap);
  })

});
