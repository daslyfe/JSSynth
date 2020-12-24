import WebMidi from "webmidi";
import React from "react";

let inputs = [];
function MidiInput() {
  const midi = {
    inputs: WebMidi.inputs,
    createSelector() {
      const getOption = (input) => (
        <option key={input.name} value={input.name}>
          {input.name}
        </option>
      );
      const options = this.inputs.map(getOption);
      return (
        <select
          name="Midi Input"
          id="midiin"
          onChange={(e) => handleInputSelect(e.target.value)}
        >
          {options}
        </select>
      );
    },
    activeNote: { number: 60, name: "C", octave: 4 },
    activeDetune: function () {
      return (this.activeNote.number - 60) * 100;
    },
  };

  const handleInputSelect = (midiName) => {
    const input = WebMidi.getInputByName(midiName);
    input.addListener("noteon", "all", function (e) {
      midi.activeNote = e.note;
      // Modules.grainSampler.detune = midi.activeDetune() + SoundData.detune;
      // console.log(e.note)
    });

    // type, midi channel, thing to do
    input.addListener("pitchbend", "all", function (e) {});
  };

  WebMidi.enable((err) => {
    //these two lines enable all inputs by default
    // const enableAll = input => handleInputSelect(input.name);
    // midi.inputs.map(enableAll);
    // setMidi({ ...midi, inputs: midi.inputs })
    midi.createSelector();
  });

  return midi;
}

export default MidiInput;
