class VeriStorage {
  constructor() {
    this.storage = new Map();
  }

  set(id, token) {
    this.storage.set(id, token);
  }

  get(id) {
    if (!this.storage.has(id)) {
      throw new Error("Invalid verifyID");
      return;
    }
    return this.storage.get(id);
  }
}

export default new VeriStorage();
