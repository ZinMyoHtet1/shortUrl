import Url from "../Models/Url.model.js";
import { randomStr } from "./index.js";

const genTempToken = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doesExist = true;
      let tempToken;
      while (doesExist) {
        tempToken = randomStr(24);
        doesExist = await Url.findOne({ tempToken });
      }
      resolve(tempToken);
    } catch (error) {
      reject(error);
    }
  });
};
export default genTempToken;
