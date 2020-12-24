const CheatCode = {
    press: "00000000000",
    validate: "^^vv<><>BA!",
    success() {
      window.open("https://waterkeeper.org/donate/");
    },
    add(btn) {
      this.press = this.press.slice(1, 11);
      this.press += btn;
      if (this.press === this.validate) {
        this.success();
      }
    },
  };

  export default CheatCode;