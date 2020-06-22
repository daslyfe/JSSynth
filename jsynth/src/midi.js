import WebMidi from 'webmidi';
import React from 'react';

export const midiPatch = {
    activeNote: {number: 60, name: "C", octave: 4},
    activeDetune: function() {
        return (this.activeNote.number - 60) * 100;
    }
}

function MidiInput() {

    const [midi, setMidi] = React.useState({
        inputs: [],
        createSelector: function () {
            const getOption = input => <option key={input.name} value={input.name}>{input.name}</option>
            const options = this.inputs.map(getOption);
            return (
                <select name="Midi Input" id="midiin" onChange={(e) => handleInputSelect(e.target.value)}>
                    {options}
                </select>
            )
        }
    });

    function handleInputSelect(midiName) {
        const input = WebMidi.getInputByName(midiName);
        input.addListener('noteon', 'all',
            function (e) {
                midiPatch.activeNote = e.note
                console.log(midiPatch.activeNote);
                console.log(midiPatch.activeDetune());
            }
        );

        // type, midi channel, thing to do
        input.addListener('pitchbend', 'all',
            function (e) {
                console.log("Received 'pitchbend' message.", e);
            }
        );
    }

    const midiStart = React.useEffect(() => {
        WebMidi.enable(err => {
            const inputs = WebMidi.inputs;
            //these two lines enable all inputs by default
            const enableAll = input => handleInputSelect(input.name);
            inputs.map(enableAll);

            setMidi({ ...midi, inputs: inputs })
        })

    }, [])

    return midi.createSelector()
}


export default MidiInput;