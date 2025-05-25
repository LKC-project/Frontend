import { describe, it, expect, vi } from 'vitest'

class Action {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

class Undo extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = () => {
            this.stage.undo()
        }
    }
}

describe('Undo Tool', () => {
    it('calls stage.undo() when selected', () => {
        const mockStage = {
            undo: vi.fn(),
        }

        const toolbar = {}

        const undoTool = new Undo(mockStage, toolbar)
        undoTool.onSelect()

        expect(mockStage.undo).toHaveBeenCalled()
    })
})