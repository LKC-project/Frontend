import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGooglePicker = {
    show: vi.fn(),
    downloadImage: vi.fn()
}

vi.mock('@/utils/google_picker.js', () => ({
    GooglePicker: vi.fn(() => mockGooglePicker)
}))

class MockAction {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

vi.stubGlobal('Action', MockAction)

const { GooglePicker } = await import('@/utils/google_picker.js')

class LoadProjectFromGoogleDrive extends MockAction {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.picker = new GooglePicker()

        this.onSelect = () => {
            this.picker.show(this.callback)
        }

        this.onDeselect = () => {

        }

        this.callback = async (data) => {
            const file = await this.picker.downloadImage(data.file.id)

            this.stage.deserialize(file.snapshot)
        }
    }
}

describe('LoadProjectFromGoogleDrive', () => {
    let mockStage
    let mockToolbar
    let loadProjectInstance

    beforeEach(() => {
        vi.clearAllMocks()

        mockStage = {
            deserialize: vi.fn()
        }

        mockToolbar = {}

        loadProjectInstance = new LoadProjectFromGoogleDrive(mockStage, mockToolbar)
    })

    describe('constructor', () => {
        it('should extend Action class', () => {
            expect(loadProjectInstance).toBeInstanceOf(LoadProjectFromGoogleDrive)
            expect(loadProjectInstance).toBeInstanceOf(MockAction)
        })

        it('should initialize with stage and toolbar properties', () => {
            expect(loadProjectInstance.stage).toBe(mockStage)
            expect(loadProjectInstance.toolbar).toBe(mockToolbar)
        })

        it('should create a GooglePicker instance', () => {
            expect(GooglePicker).toHaveBeenCalledOnce()
            expect(loadProjectInstance.picker).toBe(mockGooglePicker)
        })

        it('should have all required methods defined', () => {
            expect(typeof loadProjectInstance.onSelect).toBe('function')
            expect(typeof loadProjectInstance.onDeselect).toBe('function')
            expect(typeof loadProjectInstance.callback).toBe('function')
        })
    })

    describe('onSelect', () => {
        it('should call picker.show with callback function', () => {
            loadProjectInstance.onSelect()

            expect(mockGooglePicker.show).toHaveBeenCalledOnce()
            expect(mockGooglePicker.show).toHaveBeenCalledWith(loadProjectInstance.callback)
        })
    })

    describe('onDeselect', () => {
        it('should be defined but do nothing', () => {
            expect(() => loadProjectInstance.onDeselect()).not.toThrow()

            loadProjectInstance.onDeselect()
        })
    })

    describe('callback', () => {
        it('should download file and deserialize stage', async () => {
            const mockFileData = {
                file: {
                    id: 'test-file-id-123'
                }
            }

            const mockDownloadedFile = {
                snapshot: {
                    version: '1.0',
                    objects: [
                        { type: 'rect', x: 10, y: 20 },
                        { type: 'circle', x: 30, y: 40 }
                    ]
                }
            }

            mockGooglePicker.downloadImage.mockResolvedValue(mockDownloadedFile)

            await loadProjectInstance.callback(mockFileData)

            expect(mockGooglePicker.downloadImage).toHaveBeenCalledOnce()
            expect(mockGooglePicker.downloadImage).toHaveBeenCalledWith('test-file-id-123')
            expect(mockStage.deserialize).toHaveBeenCalledOnce()
            expect(mockStage.deserialize).toHaveBeenCalledWith(mockDownloadedFile.snapshot)
        })

        it('should handle different file IDs correctly', async () => {
            const mockFileData = {
                file: {
                    id: 'another-file-id-456'
                }
            }

            const mockDownloadedFile = {
                snapshot: {
                    version: '2.0',
                    objects: []
                }
            }

            mockGooglePicker.downloadImage.mockResolvedValue(mockDownloadedFile)

            await loadProjectInstance.callback(mockFileData)

            expect(mockGooglePicker.downloadImage).toHaveBeenCalledWith('another-file-id-456')
            expect(mockStage.deserialize).toHaveBeenCalledWith(mockDownloadedFile.snapshot)
        })

        it('should handle downloadImage errors', async () => {
            const mockFileData = {
                file: {
                    id: 'error-file-id'
                }
            }

            const downloadError = new Error('Download failed')
            mockGooglePicker.downloadImage.mockRejectedValue(downloadError)

            await expect(loadProjectInstance.callback(mockFileData)).rejects.toThrow('Download failed')

            expect(mockGooglePicker.downloadImage).toHaveBeenCalledWith('error-file-id')
            expect(mockStage.deserialize).not.toHaveBeenCalled()
        })

        it('should handle missing file data gracefully', async () => {
            const mockFileData = {
                file: {
                    id: undefined
                }
            }

            const mockDownloadedFile = {
                snapshot: { objects: [] }
            }

            mockGooglePicker.downloadImage.mockResolvedValue(mockDownloadedFile)

            await loadProjectInstance.callback(mockFileData)

            expect(mockGooglePicker.downloadImage).toHaveBeenCalledWith(undefined)
        })

        it('should handle empty snapshot data', async () => {
            const mockFileData = {
                file: {
                    id: 'empty-file-id'
                }
            }

            const mockDownloadedFile = {
                snapshot: null
            }

            mockGooglePicker.downloadImage.mockResolvedValue(mockDownloadedFile)

            await loadProjectInstance.callback(mockFileData)

            expect(mockStage.deserialize).toHaveBeenCalledWith(null)
        })
    })

    describe('integration tests', () => {
        it('should handle complete workflow from onSelect to callback', async () => {
            const mockFileData = {
                file: {
                    id: 'integration-test-id'
                }
            }

            const mockDownloadedFile = {
                snapshot: {
                    version: '1.0',
                    objects: [{ type: 'text', content: 'Hello World' }]
                }
            }

            mockGooglePicker.downloadImage.mockResolvedValue(mockDownloadedFile)

            loadProjectInstance.onSelect()

            expect(mockGooglePicker.show).toHaveBeenCalledWith(loadProjectInstance.callback)

            await loadProjectInstance.callback(mockFileData)

            expect(mockGooglePicker.downloadImage).toHaveBeenCalledWith('integration-test-id')
            expect(mockStage.deserialize).toHaveBeenCalledWith(mockDownloadedFile.snapshot)
        })

        it('should create new instances with independent pickers', () => {
            const anotherStage = { deserialize: vi.fn() }
            const anotherToolbar = {}

            const anotherInstance = new LoadProjectFromGoogleDrive(anotherStage, anotherToolbar)

            expect(anotherInstance.picker).toBe(mockGooglePicker)
            expect(anotherInstance.stage).toBe(anotherStage)
            expect(anotherInstance.stage).not.toBe(loadProjectInstance.stage)

            expect(GooglePicker).toHaveBeenCalledTimes(2)
        })
    })

    describe('error handling', () => {
        it('should handle GooglePicker constructor errors', () => {
            const originalGooglePicker = GooglePicker
            vi.mocked(GooglePicker).mockImplementationOnce(() => {
                throw new Error('Picker initialization failed')
            })

            expect(() => new LoadProjectFromGoogleDrive(mockStage, mockToolbar))
                .toThrow('Picker initialization failed')

            vi.mocked(GooglePicker).mockImplementation(() => mockGooglePicker)
        })

        it('should handle picker.show errors', () => {
            mockGooglePicker.show.mockImplementation(() => {
                throw new Error('Show picker failed')
            })

            expect(() => loadProjectInstance.onSelect()).toThrow('Show picker failed')
        })

        it('should handle stage.deserialize errors', async () => {
            const mockFileData = {
                file: {
                    id: 'deserialize-error-id'
                }
            }

            const mockDownloadedFile = {
                snapshot: { invalid: 'data' }
            }

            mockGooglePicker.downloadImage.mockResolvedValue(mockDownloadedFile)
            mockStage.deserialize.mockImplementation(() => {
                throw new Error('Deserialization failed')
            })

            await expect(loadProjectInstance.callback(mockFileData)).rejects.toThrow('Deserialization failed')

            expect(mockGooglePicker.downloadImage).toHaveBeenCalledWith('deserialize-error-id')
            expect(mockStage.deserialize).toHaveBeenCalledWith(mockDownloadedFile.snapshot)
        })
    })
})