


const Time = {
    bpm: 124,
    noteArray: [
        [1 / 3, true], [1 / 3, false], [1 / 2, false],
        [1, true], [1, false], [2, true], [2, false],
        [3, false], [4, true], [4, false],
        [6, false], [8, true], [8, false],
        [12, false], [16, true], [16, false],
        [32, true], [32, false]
    ],
    note: function (noteData) {
        let note = noteData[0];
        let dot = noteData[1];
        let out = 60 / this.bpm / note

        let display = null
        if (note >= 1) {
            display = "1/" + note;
        }
        else {
            display = 1 / note + "/" + 1;
        }
        if (dot) {
            out += out / 2;
            display += "."
        }

        return { time: out, display: display };
    },
}
export default Time; 