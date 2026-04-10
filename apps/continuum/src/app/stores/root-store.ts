import { EditorStore } from "./editor";
import { ViewStore } from "./viewstore";

export class RootStore {
  public readonly editor: EditorStore;
  public readonly view: ViewStore;

  constructor() {
    this.editor = new EditorStore();
    this.view = new ViewStore();
  }
}
