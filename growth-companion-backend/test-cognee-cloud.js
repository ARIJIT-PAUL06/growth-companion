import {
  addTextMemory,
  cognifyMemory,
  recallMemory
} from "./services/cogneeServices.js";

const test = async () => {
  const add = await addTextMemory(
    "Arijit feels anxious when comparing career progress with peers"
  );
  console.log("ADD:", add);

  const cognify = await cognifyMemory();
  console.log("COGNIFY:", cognify);

  const recall = await recallMemory("What does Arijit feel?");
  console.log("RECALL:", recall);
};

test();