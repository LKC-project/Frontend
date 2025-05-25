import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAction = vi.fn().mockImplementation(function(stage, toolbar) {
    this.stage = stage
    this.toolbar = toolbar
})

vi.mock('@/composables/useBoardFile.js', () => ({
    exportBoardToLKC: vi.fn()
}))

vi.stubGlobal('Action', mockAction)

const { Save } = await import('@/test-components/save.js')
const { exportBoardToLKC } = await import('@/composables/useBoardFile.js')

describe('Save', () => {
    let mockStage
    let mockToolbar
    let saveInstance

    beforeEach(() => {
        vi.clearAllMocks()

        mockStage = {
            autoSave: vi.fn().mockResolvedValue(undefined)
        }

        mockToolbar = {}

        saveInstance = new Save(mockStage, mockToolbar)
    })

    describe('constructor', () => {
        it('should extend Action class', () => {
            expect(saveInstance).toBeInstanceOf(Save)
        })

        it('should call parent constructor with stage and toolbar', () => {
            expect(mockAction).toHaveBeenCalledWith(mockStage, mockToolbar)
        })

        it('should initialize with stage and toolbar properties', () => {
            expect(saveInstance.stage).toBe(mockStage)
            expect(saveInstance.toolbar).toBe(mockToolbar)
        })

        it('should have onSelect method defined', () => {
            expect(typeof saveInstance.onSelect).toBe('function')
        })

        it('should have manualSave method defined', () => {
            expect(typeof saveInstance.manualSave).toBe('function')
        })
    })

    describe('onSelect', () => {
        it('should call exportBoardToLKC with stage', () => {
            const mockResult = 'exported-data'
            exportBoardToLKC.mockReturnValue(mockResult)

            const result = saveInstance.onSelect()

            expect(exportBoardToLKC).toHaveBeenCalledWith(mockStage)
            expect(result).toBe(mockResult)
        })

        it('should return the result from exportBoardToLKC', () => {
            const expectedResult = { data: 'test-export' }
            exportBoardToLKC.mockReturnValue(expectedResult)

            const result = saveInstance.onSelect()

            expect(result).toEqual(expectedResult)
        })
    })

    describe('manualSave', () => {
        it('should call stage.autoSave when it exists', async () => {
            const mockExportResult = 'manual-save-result'
            exportBoardToLKC.mockReturnValue(mockExportResult)

            const result = await saveInstance.manualSave()

            expect(mockStage.autoSave).toHaveBeenCalledOnce()
            expect(exportBoardToLKC).toHaveBeenCalledWith(mockStage)
            expect(result).toBe(mockExportResult)
        })

        it('should not call autoSave when stage.autoSave is undefined', async () => {
            mockStage.autoSave = undefined
            const mockExportResult = 'manual-save-result'
            exportBoardToLKC.mockReturnValue(mockExportResult)

            const result = await saveInstance.manualSave()

            expect(exportBoardToLKC).toHaveBeenCalledWith(mockStage)
            expect(result).toBe(mockExportResult)
        })

        it('should not call autoSave when stage.autoSave is null', async () => {
            mockStage.autoSave = null
            const mockExportResult = 'manual-save-result'
            exportBoardToLKC.mockReturnValue(mockExportResult)

            const result = await saveInstance.manualSave()

            expect(exportBoardToLKC).toHaveBeenCalledWith(mockStage)
            expect(result).toBe(mockExportResult)
        })

        it('should wait for autoSave to complete before calling exportBoardToLKC', async () => {
            const callOrder = []

            mockStage.autoSave = vi.fn().mockImplementation(async () => {
                callOrder.push('autoSave')
                await new Promise(resolve => setTimeout(resolve, 10))
            })

            exportBoardToLKC.mockImplementation(() => {
                callOrder.push('exportBoardToLKC')
                return 'result'
            })

            await saveInstance.manualSave()

            expect(callOrder).toEqual(['autoSave', 'exportBoardToLKC'])
        })

        it('should handle autoSave rejection and propagate error', async () => {
            const error = new Error('AutoSave failed')
            mockStage.autoSave = vi.fn().mockRejectedValue(error)

            await expect(saveInstance.manualSave()).rejects.toThrow('AutoSave failed')
            expect(mockStage.autoSave).toHaveBeenCalledOnce()
            expect(exportBoardToLKC).not.toHaveBeenCalled()
        })

        it('should return the result from exportBoardToLKC', async () => {
            const expectedResult = { saved: true, timestamp: Date.now() }
            exportBoardToLKC.mockReturnValue(expectedResult)

            const result = await saveInstance.manualSave()

            expect(result).toEqual(expectedResult)
        })
    })

    describe('integration tests', () => {
        it('should handle both onSelect and manualSave operations', async () => {
            const selectResult = 'select-result'
            const manualResult = 'manual-result'

            exportBoardToLKC
                .mockReturnValueOnce(selectResult)
                .mockReturnValueOnce(manualResult)

            const onSelectResult = saveInstance.onSelect()
            const manualSaveResult = await saveInstance.manualSave()

            expect(onSelectResult).toBe(selectResult)
            expect(manualSaveResult).toBe(manualResult)
            expect(exportBoardToLKC).toHaveBeenCalledTimes(2)
            expect(mockStage.autoSave).toHaveBeenCalledOnce()
        })
    })
})