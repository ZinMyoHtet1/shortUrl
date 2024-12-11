export default {
  getTempToken: async (req, res, next) => {
    try {
      res.send("Get Temporary Access TOken");
    } catch (error) {
      next(error);
    }
  },
};
