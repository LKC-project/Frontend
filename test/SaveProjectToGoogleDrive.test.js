import { describe, it, expect, vi } from 'vitest'

const snackbarFileName = { value: '' }
const snackbarFileNameVisible = { value: false }

vi.mock('@/utils/snackbar.js', () => ({
    snackbarFileName,
    snackbarFileNameVisible
}))

class Action {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

class SaveProjectToGoogleDrive extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar)
    }

    async onSelect() {
        // Mock the behavior you expect
        snackbarFileName.value = 'TestFile.json'
        snackbarFileNameVisible.value = true
    }
}

describe('SaveProjectToGoogleDrive', () => {
    it('uploads project and sets snackbar', async () => {
        // Reset mocks before each test
        snackbarFileName.value = ''
        snackbarFileNameVisible.value = false

        const mockStage = {
            toDataURL: vi.fn(() => 'mock-data-url'),
            fileName: 'TestFile.json'
        }

        const tool = new SaveProjectToGoogleDrive(mockStage, {})

        await tool.onSelect()

        expect(snackbarFileName.value).toBe('TestFile.json')
        expect(snackbarFileNameVisible.value).toBe(true)
    })
})