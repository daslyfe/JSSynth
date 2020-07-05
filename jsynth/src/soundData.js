import sample1 from './samples/boot.mp3'
import sample2 from './samples/NASA_RadioTelescope.mp3';
import sample3 from './samples/SciDrum.mp3'
import sample4 from './samples/Eidolon.mp3'

const SoundData = {
    files: {
      0: [
        {name: "boot.mp3", path: sample1},
        {name: "NASA_RadioTelescope.mp3", path: sample2},
        {name: "SciDrum.mp3", path: sample3},
       {name: "Eidolon.mp3", path: sample4},
      ]
    },
    pageMax: 14,
    currentPage: 0,
    selected: 0,
    next: function () {
      let numPages = Object.keys(this.files).length;
      let numFiles = this.files[this.currentPage].length;
      if (numPages <= 1) {
        this.selected = (this.selected + 1) % numFiles;
      }
      else {
        if (this.selected >= numFiles - 1) {
          this.currentPage = (this.currentPage + 1) % numPages;
          this.selected = 0;
        }
        else {
          this.selected += 1;
        }
      }
      let currentFile = this.files[this.currentPage][this.selected];
      if (currentFile) {
        return currentFile.path;
      }
    },
    prev: function () {
      let numPages = Object.keys(this.files).length;
      let numFiles = this.files[this.currentPage].length;
      if (numPages <= 1) {
        this.selected = (this.selected - 1) % (numFiles);
        if (this.selected < 0) this.selected = numFiles - 1;
      }
      else {
        if (this.selected <= 0) {
          this.currentPage = (this.currentPage - 1) % numPages;
          if (this.currentPage < 0) this.currentPage = numPages - 1;
          numFiles = this.files[this.currentPage].length;
          this.selected = numFiles - 1;
        }
        else {
          this.selected -= 1;
        }
      }
      let currentFile = this.files[this.currentPage][this.selected];
      if (currentFile) {
        return currentFile.path;
      }
    },
    detune: 0,
  }

  export default SoundData;