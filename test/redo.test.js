import { describe, it, expect, vi } from 'vitest'

class Action {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

class Redo extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = () => {
            this.stage.redo()
        }
    }
}

describe('Redo Tool', () => {
    it('calls stage.redo() when selected', () => {
        const mockStage = {
            redo: vi.fn(),
        }

        const toolbar = {}

        const redoTool = new Redo(mockStage, toolbar)
        redoTool.onSelect()

        expect(mockStage.redo).toHaveBeenCalled()
    })

    it('creates redo tool with correct stage and toolbar', () => {
        const mockStage = {
            redo: vi.fn(),
        }

        const mockToolbar = { someProperty: 'test' }

        const redoTool = new Redo(mockStage, mockToolbar)

        expect(redoTool.stage).toBe(mockStage)
        expect(redoTool.toolbar).toBe(mockToolbar)
    })
})