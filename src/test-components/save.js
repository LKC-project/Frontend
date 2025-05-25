import {exportBoardToLKC} from "@/composables/useBoardFile.js";

export class Save extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = () => {
            return exportBoardToLKC(this.stage);
        }

        this.manualSave = async () => {
            if (this.stage.autoSave) {
                await this.stage.autoSave();
            }
            return exportBoardToLKC(this.stage);
        }
    }
}