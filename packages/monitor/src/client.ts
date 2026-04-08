import { init } from "./init";

export const initializeClient = () => {
  return init({
    runtime: "browser",
  });
};

export { captureException } from "./shared/capture";
