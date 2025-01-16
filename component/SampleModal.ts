import { Modal, App, TFile,TFolder, TAbstractFile ,Notice} from "obsidian";

export class SampleModal extends Modal {
  tags: Set<string>;

  folder : TFolder;
  children : TAbstractFile[];

  constructor(app: App, folder : TFolder) {
    super(app);
    console.log(folder)
    this.folder = folder;
    this.children = folder.children; // 하위 항목 저장
    this.tags = new Set();
  }
  onOpen() {
    const { contentEl } = this;
  
    // Display folder name
    const Header = contentEl.createEl('h2', { text: `Folder: ${this.folder.name}` });
  
    const depth = Header.createEl('input', { type: 'number', placeholder: 'Depth 입력', value: '3' });
  
    // Add All Tags 버튼 생성 및 속성 설정
    const addAllButton = Header.createEl('button', { text: 'Add All Tags' });
    addAllButton.disabled = true; // 속성을 생성 후 설정
  
    // 입력란 변경 시 버튼 활성화/비활성화
    depth.addEventListener('input', () => {
      addAllButton.disabled = !depth.value.trim();
    });
  
    // 일괄 버튼 클릭 이벤트
    addAllButton.addEventListener('click', () => {
      const allButtons = contentEl.querySelectorAll('.add-tag-button:not([disabled])');
      allButtons.forEach(button => {
        if (button instanceof HTMLElement && typeof button.click === 'function') {
          button.click();
        }
      });
    });
  
    const button = Header.createEl('button', { text: 'Add Tag' });
    button.addEventListener('click', () => {
      // 기존 리스트 지우기
      const childrenContainer = contentEl.querySelector('.children-container');
      if (childrenContainer) childrenContainer.remove();
  
      // 새 리스트 생성
      const newChildrenContainer = contentEl.createEl('div', { cls: 'children-container' });
      this.setChildren(newChildrenContainer, this.children, depth.value);
    });
  
    // Display subfolders and files
    if (this.children.length > 0) {
      const childrenContainer = contentEl.createEl('div', { cls: 'children-container' });
      this.setChildren(childrenContainer, this.children, depth.value);
    } else {
      contentEl.createEl('div', { text: 'No sub-items found in this folder.' });
    }
  }
  
  
  setChildren(contentEl: HTMLElement, files: TAbstractFile[], tagDepth: string) {
    files.forEach(file => {
      // Markdown 파일인지 확인
      if (file instanceof TFile && file.path.endsWith('.md')) {
        const fileContainer = contentEl.createEl('div', { text: file.path });
  
        // 입력 필드 추가
        const depth = parseInt(tagDepth, 10);
        const pathSplit = file.path.split("/");
        const tagTarget = pathSplit.slice(depth, pathSplit.length - 1);
        const input = fileContainer.createEl('input', {
          type: 'text',
          placeholder: 'Enter tag',
          value: tagTarget.map(e => "#" + e.replace(/ /g, "")).join(" ")
        });
        input.addClass('tag-input');
  
        // 버튼 추가
        const button = fileContainer.createEl('button', { text: 'Add Tag' });
        button.addClass('add-tag-button');
        button.disabled = !input.value.trim(); // 입력값이 없으면 버튼 비활성화
  
        // 입력란 변경 시 버튼 활성화/비활성화
        input.addEventListener('input', () => {
          button.disabled = !input.value.trim();
        });
  
        // 버튼 클릭 이벤트 처리
        button.addEventListener('click', async () => {
          const tag = input.value.trim(); // 입력된 태그
          if (tag) {
            try {
              // 파일 내용 읽기
              const fileContent = await this.app.vault.read(file);
              const lines = fileContent.split("\n");
  
              // 상단에 태그가 이미 있는지 확인
              if (!lines[0].includes(tag)) {
                const newContent = `${tag}\n${fileContent}`; // 태그 추가
                await this.app.vault.modify(file, newContent); // 파일 수정
                new Notice(`Tag "${tag}" added to ${file.path}`);
                input.value = ''; // 입력 필드 초기화
                button.disabled = true; // 버튼 비활성화
              } else {
                new Notice(`Tag "${tag}" already exists in ${file.path}`);
              }
            } catch (error) {
              console.error(`Failed to add tag to ${file.path}:`, error);
              new Notice(`Failed to add tag to ${file.path}`);
            }
          } else {
            new Notice('Tag cannot be empty.');
          }
        });
      }
  
      // 폴더인지 확인
      if (file instanceof TFolder) {
        // 하위 항목 탐색 (재귀 호출)
        this.setChildren(contentEl, file.children, tagDepth);
      }
    });
  }
  

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
