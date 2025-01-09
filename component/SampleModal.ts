import { Modal, App } from "obsidian";

export class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText("s!");
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
