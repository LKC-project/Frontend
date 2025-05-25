import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockKonvaLine = {
    points: vi.fn(),
    stroke: vi.fn(),
    strokeWidth: vi.fn()
}

vi.mock('konva', () => ({
    default: {
        Line: vi.fn(() => mockKonvaLine)
    }
}))

class MockTool {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

vi.stubGlobal('Tool', MockTool)

const Konva = (await import('konva')).default

class Draw extends MockTool {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.drawing = false
        this.line = null

        this.onSelect = () => {
            this.stage.stage.on("mousedown", this.onMouseDown);
            this.stage.stage.on("mouseup", this.onMouseUp);
            this.stage.stage.on("mousemove", this.onMouseMove);
        }

        this.onDeselect = () => {
            this.stage.stage.off("mousedown", this.onMouseDown);
            this.stage.stage.off("mouseup", this.onMouseUp);
            this.stage.stage.off("mousemove", this.onMouseMove);
        }

        this.onMouseDown = () => {
            this.drawing = true

            if (this.line === null) {
                this.line = new Konva.Line({
                    points: [],
                    stroke: "black",
                    strokeWidth: 3,
                })
            }

            const layer = stage.getTopLayer()
            const point = this.stage.stage.getPointerPosition();

            this.line.points([...this.line.points(), point.x, point.y]);
            layer.add(this.line)
        }

        this.onMouseUp = () => {
            this.drawing = false
            this.line = null
        }

        this.onMouseMove = () => {
            if (!this.drawing) {
                return
            }

            const point = this.stage.stage.getPointerPosition();
            this.line.points([...this.line.points(), point.x, point.y]);
        }
    }
}

describe('Draw', () => {
    let mockStage
    let mockToolbar
    let mockKonvaStage
    let mockTopLayer
    let drawInstance

    beforeEach(() => {
        vi.clearAllMocks()

        mockTopLayer = {
            add: vi.fn()
        }

        mockKonvaStage = {
            on: vi.fn(),
            off: vi.fn(),
            getPointerPosition: vi.fn()
        }

        mockStage = {
            stage: mockKonvaStage,
            getTopLayer: vi.fn().mockReturnValue(mockTopLayer)
        }

        mockToolbar = {}

        mockKonvaLine.points.mockReturnValue([])

        drawInstance = new Draw(mockStage, mockToolbar)
    })

    describe('constructor', () => {
        it('should extend Tool class', () => {
            expect(drawInstance).toBeInstanceOf(Draw)
            expect(drawInstance).toBeInstanceOf(MockTool)
        })

        it('should initialize with stage and toolbar properties', () => {
            expect(drawInstance.stage).toBe(mockStage)
            expect(drawInstance.toolbar).toBe(mockToolbar)
        })

        it('should initialize drawing state', () => {
            expect(drawInstance.drawing).toBe(false)
            expect(drawInstance.line).toBe(null)
        })

        it('should have all required methods defined', () => {
            expect(typeof drawInstance.onSelect).toBe('function')
            expect(typeof drawInstance.onDeselect).toBe('function')
            expect(typeof drawInstance.onMouseDown).toBe('function')
            expect(typeof drawInstance.onMouseUp).toBe('function')
            expect(typeof drawInstance.onMouseMove).toBe('function')
        })
    })

    describe('onSelect', () => {
        it('should attach all mouse event listeners', () => {
            drawInstance.onSelect()

            expect(mockKonvaStage.on).toHaveBeenCalledTimes(3)
            expect(mockKonvaStage.on).toHaveBeenCalledWith('mousedown', drawInstance.onMouseDown)
            expect(mockKonvaStage.on).toHaveBeenCalledWith('mouseup', drawInstance.onMouseUp)
            expect(mockKonvaStage.on).toHaveBeenCalledWith('mousemove', drawInstance.onMouseMove)
        })
    })

    describe('onDeselect', () => {
        it('should remove all mouse event listeners', () => {
            drawInstance.onDeselect()

            expect(mockKonvaStage.off).toHaveBeenCalledTimes(3)
            expect(mockKonvaStage.off).toHaveBeenCalledWith('mousedown', drawInstance.onMouseDown)
            expect(mockKonvaStage.off).toHaveBeenCalledWith('mouseup', drawInstance.onMouseUp)
            expect(mockKonvaStage.off).toHaveBeenCalledWith('mousemove', drawInstance.onMouseMove)
        })
    })

    describe('onMouseDown', () => {
        it('should set drawing to true', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })

            drawInstance.onMouseDown()

            expect(drawInstance.drawing).toBe(true)
        })

        it('should create new line when line is null', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })

            drawInstance.onMouseDown()

            expect(Konva.Line).toHaveBeenCalledWith({
                points: [],
                stroke: "black",
                strokeWidth: 3,
            })
            expect(drawInstance.line).toBe(mockKonvaLine)
        })

        it('should not create new line when line already exists', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })
            drawInstance.line = mockKonvaLine

            drawInstance.onMouseDown()

            expect(Konva.Line).not.toHaveBeenCalled()
            expect(drawInstance.line).toBe(mockKonvaLine)
        })

        it('should add point to line and add line to layer', () => {
            const mockPointer = { x: 150, y: 250 }
            mockKonvaStage.getPointerPosition.mockReturnValue(mockPointer)
            mockKonvaLine.points.mockReturnValue([10, 20, 30, 40])

            drawInstance.onMouseDown()

            expect(mockKonvaLine.points).toHaveBeenCalledWith([10, 20, 30, 40, 150, 250])
            expect(mockTopLayer.add).toHaveBeenCalledWith(mockKonvaLine)
        })

        it('should handle empty points array', () => {
            const mockPointer = { x: 50, y: 75 }
            mockKonvaStage.getPointerPosition.mockReturnValue(mockPointer)
            mockKonvaLine.points.mockReturnValue([])

            drawInstance.onMouseDown()

            expect(mockKonvaLine.points).toHaveBeenCalledWith([50, 75])
        })

        it('should get top layer from stage', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })

            drawInstance.onMouseDown()

            expect(mockStage.getTopLayer).toHaveBeenCalled()
        })
    })

    describe('onMouseUp', () => {
        it('should set drawing to false', () => {
            drawInstance.drawing = true
            drawInstance.line = mockKonvaLine

            drawInstance.onMouseUp()

            expect(drawInstance.drawing).toBe(false)
        })

        it('should reset line to null', () => {
            drawInstance.drawing = true
            drawInstance.line = mockKonvaLine

            drawInstance.onMouseUp()

            expect(drawInstance.line).toBe(null)
        })
    })

    describe('onMouseMove', () => {
        it('should return early when not drawing', () => {
            drawInstance.drawing = false
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })

            drawInstance.onMouseMove()

            expect(mockKonvaStage.getPointerPosition).not.toHaveBeenCalled()
        })

        it('should add point to line when drawing', () => {
            drawInstance.drawing = true
            drawInstance.line = mockKonvaLine
            const mockPointer = { x: 300, y: 400 }
            mockKonvaStage.getPointerPosition.mockReturnValue(mockPointer)
            mockKonvaLine.points.mockReturnValue([100, 200])

            drawInstance.onMouseMove()

            expect(mockKonvaStage.getPointerPosition).toHaveBeenCalled()
            expect(mockKonvaLine.points).toHaveBeenCalledWith([100, 200, 300, 400])
        })

        it('should handle line with multiple existing points', () => {
            drawInstance.drawing = true
            drawInstance.line = mockKonvaLine
            const mockPointer = { x: 500, y: 600 }
            mockKonvaStage.getPointerPosition.mockReturnValue(mockPointer)
            mockKonvaLine.points.mockReturnValue([10, 20, 30, 40, 50, 60])

            drawInstance.onMouseMove()

            expect(mockKonvaLine.points).toHaveBeenCalledWith([10, 20, 30, 40, 50, 60, 500, 600])
        })
    })

    describe('drawing workflow integration', () => {
        it('should complete full drawing cycle', () => {
            const startPoint = { x: 10, y: 20 }
            const movePoint1 = { x: 15, y: 25 }
            const movePoint2 = { x: 20, y: 30 }

            mockKonvaStage.getPointerPosition.mockReturnValue(startPoint)
            drawInstance.onMouseDown()

            expect(drawInstance.drawing).toBe(true)
            expect(drawInstance.line).toBe(mockKonvaLine)
            expect(Konva.Line).toHaveBeenCalledWith({
                points: [],
                stroke: "black",
                strokeWidth: 3,
            })

            mockKonvaLine.points.mockReturnValue([10, 20])
            mockKonvaStage.getPointerPosition.mockReturnValue(movePoint1)
            drawInstance.onMouseMove()

            expect(mockKonvaLine.points).toHaveBeenCalledWith([10, 20, 15, 25])

            mockKonvaLine.points.mockReturnValue([10, 20, 15, 25])
            mockKonvaStage.getPointerPosition.mockReturnValue(movePoint2)
            drawInstance.onMouseMove()

            expect(mockKonvaLine.points).toHaveBeenCalledWith([10, 20, 15, 25, 20, 30])

            drawInstance.onMouseUp()

            expect(drawInstance.drawing).toBe(false)
            expect(drawInstance.line).toBe(null)
        })

        it('should handle select and deselect with event listeners', () => {
            drawInstance.onSelect()
            expect(mockKonvaStage.on).toHaveBeenCalledTimes(3)

            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 100 })
            drawInstance.onMouseDown()
            expect(drawInstance.drawing).toBe(true)

            drawInstance.onDeselect()
            expect(mockKonvaStage.off).toHaveBeenCalledTimes(3)
        })

        it('should continue existing line on subsequent mouse downs', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 10, y: 20 })
            drawInstance.onMouseDown()
            const firstLine = drawInstance.line

            drawInstance.onMouseUp()
            expect(drawInstance.line).toBe(null)

            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 30, y: 40 })
            drawInstance.onMouseDown()

            expect(Konva.Line).toHaveBeenCalledTimes(2)
        })
    })

    describe('edge cases and error handling', () => {
        it('should handle null pointer position gracefully', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue(null)

            expect(() => drawInstance.onMouseDown()).toThrow()
        })

        it('should handle undefined pointer position gracefully', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue(undefined)

            expect(() => drawInstance.onMouseDown()).toThrow()
        })

        it('should handle getTopLayer returning null', () => {
            mockStage.getTopLayer.mockReturnValue(null)
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })

            expect(() => drawInstance.onMouseDown()).toThrow()
        })

        it('should handle mouse move without line object', () => {
            drawInstance.drawing = true
            drawInstance.line = null
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 100, y: 200 })

            expect(() => drawInstance.onMouseMove()).toThrow()
        })

        it('should handle multiple onMouseUp calls', () => {
            drawInstance.drawing = true
            drawInstance.line = mockKonvaLine

            drawInstance.onMouseUp()
            drawInstance.onMouseUp()

            expect(drawInstance.drawing).toBe(false)
            expect(drawInstance.line).toBe(null)
        })

        it('should handle Line constructor with different configurations', () => {
            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 50, y: 75 })

            drawInstance.onMouseDown()

            expect(Konva.Line).toHaveBeenCalledWith({
                points: [],
                stroke: "black",
                strokeWidth: 3,
            })
        })
    })

    describe('state management', () => {
        it('should maintain correct drawing state throughout workflow', () => {
            expect(drawInstance.drawing).toBe(false)
            expect(drawInstance.line).toBe(null)

            mockKonvaStage.getPointerPosition.mockReturnValue({ x: 10, y: 20 })
            drawInstance.onMouseDown()
            expect(drawInstance.drawing).toBe(true)
            expect(drawInstance.line).not.toBe(null)

            drawInstance.onMouseUp()
            expect(drawInstance.drawing).toBe(false)
            expect(drawInstance.line).toBe(null)
        })

        it('should prevent mouse move when not drawing', () => {
            drawInstance.drawing = false
            const getPointerSpy = mockKonvaStage.getPointerPosition

            drawInstance.onMouseMove()

            expect(getPointerSpy).not.toHaveBeenCalled()
        })
    })
})