import { furParams } from '../furManager';
/**
 * Vignette shader class to store all data needed for the ThreeJs Shader and Raw Shader Material
 */
export const perlinNoiseShader = {
    uniforms: {
        uResolution: { value: [2060,2060] },
        uPersistence: { value:0.9 },
        uLacunarity: { value: 0.55 }
    }
    ,
    vertexShader:/* glsl */`
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }`
    ,
    fragmentShader:/* glsl */`
    uniform vec2 uResolution;
    uniform float uPersistence;
    uniform float uLacunarity;


    uint hash(uint x, uint seed) {
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process input
    uint k = x;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
    }

    // implementation of MurmurHash (https://sites.google.com/site/murmurhash/) for a  
    // 2-dimensional unsigned integer input vector.

    uint hash(uvec2 x, uint seed){
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process first vector element
    uint k = x.x; 
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // process second vector element
    k = x.y; 
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
    }


    vec2 gradientDirection(uint hash) {
    switch (int(hash) & 3) { // look at the last two bits to pick a gradient direction
    case 0:
    return vec2(1.0, 1.0);
    case 1:
    return vec2(-1.0, 1.0);
    case 2:
    return vec2(1.0, -1.0);
    case 3:
    return vec2(-1.0, -1.0);
     }
    }

    float interpolate(float value1, float value2, float value3, float value4, vec2 t) {
    return mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y);
    }

    vec2 fade(vec2 t) {
    // 6t^5 - 15t^4 + 10t^3
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    int wrap(int v, int period) {
        if (v < 0)
            return (v % period) + period;
        return v % period;
    }

    float perlinNoise(vec2 position, uint seed) {

    vec2 floorPosition = floor(position);
    vec2 fractPosition = position - floorPosition;

    uvec2 cellCoordinates = uvec2(floorPosition);
    float value1 = dot(gradientDirection(hash(cellCoordinates, seed)), fractPosition);
    float value2 = dot(gradientDirection(hash((cellCoordinates + uvec2(1, 0)), seed)), fractPosition - vec2(1.0, 0.0));
    float value3 = dot(gradientDirection(hash((cellCoordinates + uvec2(0, 1)), seed)), fractPosition - vec2(0.0, 1.0));
    float value4 = dot(gradientDirection(hash((cellCoordinates + uvec2(1, 1)), seed)), fractPosition - vec2(1.0, 1.0));
    return interpolate(value1, value2, value3, value4, fade(fractPosition));
    }

    float perlinNoise(vec2 position, int frequency, int octaveCount, float persistence, float lacunarity, uint seed) {
    float value = 0.0;
    float amplitude = 1.0;
    float currentFrequency = float(frequency);
    uint currentSeed = seed;
    for (int i = 0; i < octaveCount; i++) {
    currentSeed = hash(currentSeed, 0x0U); // create a new seed for each octave
    value += perlinNoise(position * currentFrequency, currentSeed) * amplitude;
    amplitude *= persistence;
    currentFrequency *= lacunarity;
    }
    return value;
    }



    
    void main()
    {
    vec2 position = gl_FragCoord.xy / uResolution;
    uint seed = 0x578437adU; // can be set to something else if you want a different set of random values
    // float frequency = 16.0;
    // float value = perlinNoise(position * 200.0, seed); // single octave perlin noise
    float value = perlinNoise(position,2000, 9, uPersistence,uLacunarity, seed); // multiple octaves
    value = (value + 1.0) * 0.5; // convert from range [-1, 1] to range [0, 1]

    gl_FragColor=vec4(vec3(value), 1.0);

    }

`




}


