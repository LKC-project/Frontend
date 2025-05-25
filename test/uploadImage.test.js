import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

class MockAction {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

const mockUpload = {
    Image: {
        upload: vi.fn()
    }
}

const mockKonvaImage = vi.fn()

class UploadImage extends MockAction {
    constructor(stage, toolbar) {
        super(stage, toolbar)
        this.fileInput = null
    }

    onSelect() {
        console.log(1123)
        console.log(this.toolbar)

        this.fileInput = document.createElement('input')
        this.fileInput.type = 'file'
        this.fileInput.accept = 'image/*'
        this.fileInput.style.display = 'none'

        this.fileInput.addEventListener('change', this.onChange.bind(this))

        document.body.appendChild(this.fileInput)
        this.fileInput.click()
    }

    onDeselect() {
        if (this.fileInput) {
            this.fileInput.remove()
            this.fileInput = null
        } else {
            throw new Error('No file input to remove')
        }
    }

    async onChange(event) {
        const file = event.target.files[0]
        if (!file) return

        try {
            const uploadResponse = await mockUpload.Image.upload({ file })

            const img = new Image()
            img.crossOrigin = 'Anonymous'

            img.onload = () => {
                const konvaImage = new mockKonvaImage({
                    x: 50,
                    y: 50,
                    image: img,
                    width: img.width,
                    height: img.height
                })

                this.stage.getTopLayer().add(konvaImage)
                this.stage.saveSnapshot()
                this.toolbar.selectTool(0)
            }

            img.src = uploadResponse.url
        } catch (error) {
            throw error
        }
    }
}

describe('UploadImage', () => {
    let mockStage
    let mockToolbar
    let uploadImageInstance
    let mockFileInput
    let mockTopLayer
    let consoleSpy

    beforeEach(() => {
        vi.clearAllMocks()

        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        mockFileInput = {
            type: '',
            accept: '',
            style: { display: '' },
            addEventListener: vi.fn(),
            click: vi.fn(),
            remove: vi.fn(),
            files: []
        }

        global.document = {
            createElement: vi.fn().mockReturnValue(mockFileInput),
            body: {
                appendChild: vi.fn()
            }
        }

        mockTopLayer = {
            add: vi.fn()
        }

        mockStage = {
            getTopLayer: vi.fn().mockReturnValue(mockTopLayer),
            saveSnapshot: vi.fn()
        }

        mockToolbar = {
            selectTool: vi.fn()
        }

        global.Image = vi.fn(() => ({
            crossOrigin: '',
            onload: null,
            src: '',
            width: 100,
            height: 100
        }))

        uploadImageInstance = new UploadImage(mockStage, mockToolbar)
    })

    afterEach(() => {
        consoleSpy.mockRestore()
        vi.restoreAllMocks()
    })

    describe('constructor', () => {
        it('should extend MockAction class', () => {
            expect(uploadImageInstance).toBeInstanceOf(MockAction)
        })

        it('should initialize with stage and toolbar', () => {
            expect(uploadImageInstance.stage).toBe(mockStage)
            expect(uploadImageInstance.toolbar).toBe(mockToolbar)
        })

        it('should initialize fileInput as null', () => {
            expect(uploadImageInstance.fileInput).toBeNull()
        })
    })

    describe('onSelect', () => {
        it('should log debug messages', () => {
            uploadImageInstance.onSelect()
            expect(console.log).toHaveBeenCalledWith(1123)
            expect(console.log).toHaveBeenCalledWith(mockToolbar)
        })

        it('should create file input element with correct properties', () => {
            uploadImageInstance.onSelect()

            expect(document.createElement).toHaveBeenCalledWith('input')
            expect(mockFileInput.type).toBe('file')
            expect(mockFileInput.accept).toBe('image/*')
            expect(mockFileInput.style.display).toBe('none')
        })

        it('should add change event listener', () => {
            uploadImageInstance.onSelect()

            expect(mockFileInput.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
        })

        it('should append file input to document body and click it', () => {
            uploadImageInstance.onSelect()

            expect(document.body.appendChild).toHaveBeenCalledWith(mockFileInput)
            expect(mockFileInput.click).toHaveBeenCalled()
        })

        it('should set fileInput property', () => {
            uploadImageInstance.onSelect()

            expect(uploadImageInstance.fileInput).toBe(mockFileInput)
        })
    })

    describe('onDeselect', () => {
        it('should remove file input and set to null when fileInput exists', () => {
            uploadImageInstance.fileInput = mockFileInput

            uploadImageInstance.onDeselect()

            expect(mockFileInput.remove).toHaveBeenCalled()
            expect(uploadImageInstance.fileInput).toBeNull()
        })

        it('should throw error when fileInput is null', () => {
            uploadImageInstance.fileInput = null

            expect(() => uploadImageInstance.onDeselect()).toThrow('No file input to remove')
        })
    })

    describe('onChange', () => {
        let mockFile
        let mockEvent
        let mockImg

        beforeEach(() => {
            mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
            mockEvent = {
                target: {
                    files: [mockFile]
                }
            }

            mockImg = {
                crossOrigin: '',
                onload: null,
                src: '',
                width: 100,
                height: 100
            }

            global.Image.mockImplementation(() => mockImg)
            mockKonvaImage.mockImplementation((config) => ({
                ...config,
                image: config.image,
                width: config.width,
                height: config.height
            }))
        })

        it('should return early if no file is selected', async () => {
            const eventWithoutFile = { target: { files: [] } }

            const result = await uploadImageInstance.onChange(eventWithoutFile)

            expect(result).toBeUndefined()
            expect(mockUpload.Image.upload).not.toHaveBeenCalled()
        })

        it('should upload file and create image element', async () => {
            const mockUploadResponse = { url: 'https://example.com/image.jpg' }
            mockUpload.Image.upload.mockResolvedValue(mockUploadResponse)

            await uploadImageInstance.onChange(mockEvent)

            expect(mockUpload.Image.upload).toHaveBeenCalledWith({ file: mockFile })
            expect(global.Image).toHaveBeenCalled()
            expect(mockImg.crossOrigin).toBe('Anonymous')
        })

        it('should set image src after upload', async () => {
            const mockUploadResponse = { url: 'https://example.com/image.jpg' }
            mockUpload.Image.upload.mockResolvedValue(mockUploadResponse)

            await uploadImageInstance.onChange(mockEvent)

            expect(mockImg.src).toBe(mockUploadResponse.url)
        })

        it('should create Konva image and add to stage when image loads', async () => {
            const mockUploadResponse = { url: 'https://example.com/image.jpg' }
            mockUpload.Image.upload.mockResolvedValue(mockUploadResponse)

            await uploadImageInstance.onChange(mockEvent)

            mockImg.onload()

            expect(mockKonvaImage).toHaveBeenCalledWith({
                x: 50,
                y: 50,
                image: mockImg,
                width: 100,
                height: 100
            })
            expect(mockTopLayer.add).toHaveBeenCalled()
            expect(mockStage.saveSnapshot).toHaveBeenCalled()
            expect(mockToolbar.selectTool).toHaveBeenCalledWith(0)
        })

        it('should handle upload error', async () => {
            const uploadError = new Error('Upload failed')
            mockUpload.Image.upload.mockRejectedValue(uploadError)

            await expect(uploadImageInstance.onChange(mockEvent)).rejects.toThrow('Upload failed')
            expect(global.Image).not.toHaveBeenCalled()
        })
    })

    describe('integration tests', () => {
        it('should handle complete flow from select to image load', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
            const mockUploadResponse = { url: 'https://example.com/image.jpg' }

            mockUpload.Image.upload.mockResolvedValue(mockUploadResponse)

            uploadImageInstance.onSelect()

            expect(uploadImageInstance.fileInput).toBe(mockFileInput)
            expect(mockFileInput.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

            const mockEvent = { target: { files: [mockFile] } }
            await uploadImageInstance.onChange(mockEvent)

            expect(mockUpload.Image.upload).toHaveBeenCalledWith({ file: mockFile })
        })

        it('should clean up properly on deselect', () => {
            uploadImageInstance.onSelect()
            expect(uploadImageInstance.fileInput).toBe(mockFileInput)

            uploadImageInstance.onDeselect()
            expect(mockFileInput.remove).toHaveBeenCalled()
            expect(uploadImageInstance.fileInput).toBeNull()
        })
    })
})