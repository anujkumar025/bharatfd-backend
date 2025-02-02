import { Schema, model } from "mongoose";


const FAQSchema = new Schema({
  question: String,
  answer: String,
  translations: {
    type: Map,
    of: new Schema({
      question: String,
      answer: String
    }, { _id: false }),
    default: new Map()
  }
});

export default model("FAQ", FAQSchema);
