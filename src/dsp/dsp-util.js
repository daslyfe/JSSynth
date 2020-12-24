import { ar, num } from "../util/utility";
import Modules from "./modules";

const { pitchShift, grainSampler, filter, pitchMix } = Modules;

const DspUtil = {
  isStarted: false, //referenced to keep track of if the DSP code is running
  delayPitch: {
    array: [12, 19, 24, -24, -17, -12, -5, 0, 7],
    nextPitch() {
      ar.move(this.array, 0, 8);
      return this.array[0];
    },
    prevPitch() {
      ar.move(this.array, 8, 0);
      return this.array[0];
    },
    selected() {
      return this.array[0];
    },
  },

  sample: {
    loopLength: 0,
    loopEnd() {
      return this.isStarted
        ? parseFloat(
            (grainSampler.loopStart + this.loopLength) %
              grainSampler.buffer.duration
          ) || 1
        : parseFloat(grainSampler.loopStart + this.loopLength) || 1;
    },
    playbackRate: 0,
  },
};

export default DspUtil;
