import { Modal, App, TFile,TFolder, TAbstractFile } from "obsidian";

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

    const depth= Header.createEl('input',{type:'number',placeholder:'Depth 입력',value:'3'})

    // Display subfolders and files
    if (this.children.length > 0) {
      this.setChildren(contentEl,this.children,depth.value)
    } else {
      contentEl.createEl('div', { text: 'No sub-items found in this folder.' });
    }
  }

  setChildren(contentEl: HTMLElement, files: TAbstractFile[],tagDepth : string) {
    // 파일 경로 표시
    files.forEach(file => {
      // 현재 파일/폴더 경로를 표시
      if(file.path.endsWith('.md') ){
      const fileContainer = contentEl.createEl('div', { text: file.path });
      // 입력 필드 추가

      const depth = parseInt(tagDepth,10)
      const pathSplit = file.path.split("/")
      const tagTarget = pathSplit.slice(depth,pathSplit.length-1)
      const input = fileContainer.createEl('input', {
        type: 'text',
        placeholder: 'Enter tag',
        value:tagTarget.map(e=> "#"+e.replace(/ /g, "")).join(" ")
      });
      input.addClass('tag-input');

      // 버튼 추가
      const button = fileContainer.createEl('button', { text: 'Add Tag' });
      button.addClass('add-tag-button');

      // 버튼 클릭 이벤트 처리
      button.addEventListener('click', () => {
        const tag = input.value.trim();
        if (tag) {
          console.log(`Tag "${tag}" added to file: ${file.path}`);
          input.value = ''; // 입력 필드 초기화
        } else {
          console.log('Tag cannot be empty.');
        }
      });
      
      }
      // 폴더인지 확인
      if (file instanceof TFolder) {
        // 하위 항목 탐색 (재귀 호출)
        this.setChildren(contentEl, file.children,tagDepth);
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
