export function addDataToFeatures(features, data) {
  // Normalize continent names in your data (convert to lowercase for comparison)
  data.forEach((item) => {
    item.graphs.labels = item.graphs.labels.map((label) => label.toLowerCase());
  });

  // Iterate over the GeoJSON features
  features.forEach((feature) => {
    // Normalize continent name in the GeoJSON feature
    const continentName = feature.properties?.key.toLowerCase();

    data.forEach((item) => {
      // Find the index of the continent in the labels array
      const index = item.graphs.labels.findIndex(
        (label) => label.toLowerCase() === continentName
      );

      // If the continent is found in the labels array, add the data to the GeoJSON feature
      if (index !== -1) {
        feature.properties[item.name] = {
          value: item.graphs.series[index],
          unit: item.unit,
        };
      }
    });
  });

  return features;
}

export interface ICollections {
  type: 'FeatureCollection';
  name: string;
  crs: Crs;
  features: Feature[];
}

export interface Crs {
  type: string;
  properties: Properties;
}

export interface Properties {
  name: string;
}

export interface Feature {
  type: string;
  properties: Properties2;
  geometry: Geometry;
}

export interface Properties2 {
  CONTINENT: string;
  key: string;
}

export interface Geometry {
  type: string;
  coordinates: number[];
}

export function deepClone(obj, hash = new WeakMap()) {
  // If it's a primitive or null, return the value directly.
  if (obj === null || typeof obj !== 'object') return obj;

  // If the object is already in the hash, return the cloned value.
  // This avoids cyclic references.
  if (hash.has(obj)) return hash.get(obj);

  let clonedObj;

  // Handle special cases: Date, RegExp, Set, Map
  if (obj instanceof Date) {
    clonedObj = new Date(obj);
  } else if (obj instanceof RegExp) {
    clonedObj = new RegExp(obj);
  } else if (obj instanceof Set) {
    clonedObj = new Set([...obj].map((value) => deepClone(value, hash)));
  } else if (obj instanceof Map) {
    clonedObj = new Map(
      Array.from(obj.entries()).map(([key, value]) => [
        key,
        deepClone(value, hash),
      ])
    );
  } else if (Array.isArray(obj)) {
    clonedObj = [];
  } else {
    // If it's a regular object or other custom object, clone it.
    clonedObj = Object.create(Object.getPrototypeOf(obj));
  }

  // Cache the cloned object in the hash.
  hash.set(obj, clonedObj);

  // Clone each property of the object.
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key], hash);
    }
  }

  return clonedObj;
}
