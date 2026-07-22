declare module 'sharp-phash' {
  // Returns a 64-character binary string perceptual hash.
  const phash: (input: Buffer | string) => Promise<string>;
  export default phash;
}
