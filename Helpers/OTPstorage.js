class TempStorage {
  constructor() {
    this.storage = new Map();
  }

  //set default duration 5 mins
  set(email, otp, duration = 5 * 60 * 1000) {
    this.storage.set(email, otp);
    setTimeout(() => this.delete(email), duration);
  }

  get(email) {
    return this.storage.get(email);
  }

  verify(email, otp) {
    return this.storage.get(email) === Number(otp);
  }

  delete(email) {
    this.storage.delete(email);
  }
}

export default new TempStorage();
