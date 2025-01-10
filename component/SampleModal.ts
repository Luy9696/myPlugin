import { Modal, App, TFile } from "obsidian";

export class SampleModal extends Modal {
  tags: Set<string>;

  constructor(app: App) {
    super(app);
    this.tags = new Set();
    this.getAllTags();
  }

  getAllTags() {
    const { vault, metadataCache } = this.app;
    console.log(vault,metadataCache)

    vault.getMarkdownFiles().forEach((file: TFile) => {
      const cache = metadataCache.getFileCache(file);
      console.log(cache)
      if (cache?.tags) {
        cache.tags.forEach((tag) => this.tags.add(tag.tag));
      }
    });
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "All Tags in Vault" });
    if (this.tags.size === 0) {
      contentEl.createEl("p", { text: "No tags found in the vault." });
    } else {
      const ul = contentEl.createEl("ul");
      this.tags.forEach((tag) => {
        ul.createEl("li", { text: tag });
      });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
