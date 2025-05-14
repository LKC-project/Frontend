import CanvasBoard from "@/components/CanvasBoard.vue";

export function exportBoardToLKC(stageInstance) {
    if (!stageInstance || typeof stageInstance.serialize !== 'function') {
      console.error('Invalid stage instance or missing serialize method');
      return false;
    }
    
    try {
      const data = {
        metadata: {
          title: 'Board',
          createdAt: new Date().toISOString(),
        },
        snapshot: stageInstance.serialize(),
      };
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'board.lkc';
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Failed to export board:', error);
      return false;
    }
  }
  
  export function importBoardFromLKC(file, stageInstance) {
    if (!file || !stageInstance || typeof stageInstance.deserialize !== 'function') {
      console.error('Invalid file or stage instance');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.snapshot) {
          stageInstance.deserialize(data.snapshot);
        } else {
          console.error('File does not contain snapshot');
        }
      } catch (e) {
        console.error('Failed to parse file', e);
      }
    };
    reader.readAsText(file);
  }