import * as  os from 'os';

export const bufferCastInt32 = function (buf: Buffer): number {
  return os.endianness() == "LE" ?
    buf.readInt32LE() : buf.readInt32BE();
};
