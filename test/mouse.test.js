import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('konva', () => ({
    default: {
        Stage: class MockStage {
            constructor() {
                this.getParent = vi.fn()
            }
        },
        Text: class MockText {
            constructor() {
                this.attrs = {}
                this.getParent = vi.fn()
                this.width = vi.fn()
                this.height = vi.fn()
                this.scaleX = vi.fn()
                this.scaleY = vi.fn()
            }
        },
        Transformer: class MockTransformer {
            constructor() {
                this.getParent = vi.fn()
            }
        }
    }
}))

class MockTool {
    constructor(stage, toolbar) {
        this.stage = stage
        this.toolbar = toolbar
    }
}

const mockSideMenu = {
    show: vi.fn(),
    hide: vi.fn()
}

vi.stubGlobal('Tool', MockTool)
vi.stubGlobal('sideMenu', mockSideMenu)

const Konva = (await import('konva')).default

class Mouse extends MockTool {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = () => {
            this.stage.stage.on("mousedown", this.selectNode)
            this.stage.transformer.on("transform", this.onTransform)
            this.setStageNodesDraggable(true)
        }

        this.onDeselect = () => {
            this.stage.stage.off("mousedown", this.selectNode)
            this.stage.transformer.off("transform", this.onTransform)
            this.stage.transformer.nodes([]);
            this.setStageNodesDraggable(false)
            sideMenu.hide()
        }

        this.selectNode = (e) => {
            this.setStageNodesDraggable(true)
            this.stage.transformer.enabledAnchors(
                ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
            )

            if (e.target instanceof Konva.Stage) {
                this.stage.transformer.nodes([])
                sideMenu.hide()
                return
            }

            if (e.target.getParent() instanceof Konva.Transformer) {
                sideMenu.hide()
                return
            }

            if (e.target instanceof Konva.Text) {
                if (e.target.attrs._type === "Note") {
                    this.stage.transformer.enabledAnchors([])
                }
            }

            this.stage.transformer.nodes([e.target])
            sideMenu.show(e.target)
        }

        this.setStageNodesDraggable = (value) => {
            this.stage.getTopLayer()?.children.forEach(node => {
                node.draggable(value)
            });
        }

        this.onTransform = (e) => {
            if (e.target instanceof Konva.Text) {
                e.target.width(e.target.width() * e.target.scaleX());
                e.target.height(e.target.height() * e.target.scaleY());

                e.target.scaleX(1);
                e.target.scaleY(1);
            }
        }
    }
}

describe('Mouse', () => {
    let mockStage
    let mockToolbar
    let mockTransformer
    let mockKonvaStage
    let mockTopLayer
    let mouseInstance

    beforeEach(() => {
        vi.clearAllMocks()

        const mockNode1 = { draggable: vi.fn() }
        const mockNode2 = { draggable: vi.fn() }

        mockTopLayer = {
            children: [mockNode1, mockNode2]
        }

        mockKonvaStage = {
            on: vi.fn(),
            off: vi.fn()
        }

        mockTransformer = {
            on: vi.fn(),
            off: vi.fn(),
            nodes: vi.fn(),
            enabledAnchors: vi.fn()
        }

        mockStage = {
            stage: mockKonvaStage,
            transformer: mockTransformer,
            getTopLayer: vi.fn().mockReturnValue(mockTopLayer)
        }

        mockToolbar = {}

        mouseInstance = new Mouse(mockStage, mockToolbar)
    })

    describe('constructor', () => {
        it('should extend Tool class', () => {
            expect(mouseInstance).toBeInstanceOf(Mouse)
            expect(mouseInstance).toBeInstanceOf(MockTool)
        })

        it('should initialize with stage and toolbar properties', () => {
            expect(mouseInstance.stage).toBe(mockStage)
            expect(mouseInstance.toolbar).toBe(mockToolbar)
        })

        it('should have all required methods defined', () => {
            expect(typeof mouseInstance.onSelect).toBe('function')
            expect(typeof mouseInstance.onDeselect).toBe('function')
            expect(typeof mouseInstance.selectNode).toBe('function')
            expect(typeof mouseInstance.setStageNodesDraggable).toBe('function')
            expect(typeof mouseInstance.onTransform).toBe('function')
        })
    })

    describe('onSelect', () => {
        it('should attach event listeners and enable dragging', () => {
            mouseInstance.onSelect()

            expect(mockKonvaStage.on).toHaveBeenCalledWith('mousedown', mouseInstance.selectNode)
            expect(mockTransformer.on).toHaveBeenCalledWith('transform', mouseInstance.onTransform)
        })

        it('should make stage nodes draggable', () => {
            mouseInstance.onSelect()

            expect(mockStage.getTopLayer).toHaveBeenCalled()
            expect(mockTopLayer.children[0].draggable).toHaveBeenCalledWith(true)
            expect(mockTopLayer.children[1].draggable).toHaveBeenCalledWith(true)
        })
    })

    describe('onDeselect', () => {
        it('should remove event listeners', () => {
            mouseInstance.onDeselect()

            expect(mockKonvaStage.off).toHaveBeenCalledWith('mousedown', mouseInstance.selectNode)
            expect(mockTransformer.off).toHaveBeenCalledWith('transform', mouseInstance.onTransform)
        })

        it('should clear transformer nodes and disable dragging', () => {
            mouseInstance.onDeselect()

            expect(mockTransformer.nodes).toHaveBeenCalledWith([])
            expect(mockTopLayer.children[0].draggable).toHaveBeenCalledWith(false)
            expect(mockTopLayer.children[1].draggable).toHaveBeenCalledWith(false)
        })

        it('should hide side menu', () => {
            mouseInstance.onDeselect()

            expect(mockSideMenu.hide).toHaveBeenCalled()
        })
    })

    describe('selectNode', () => {
        it('should clear selection when clicking on stage', () => {
            const mockEvent = {
                target: new Konva.Stage()
            }

            mouseInstance.selectNode(mockEvent)

            expect(mockTransformer.nodes).toHaveBeenCalledWith([])
            expect(mockSideMenu.hide).toHaveBeenCalled()
        })

        it('should hide menu when clicking on transformer', () => {
            const mockParent = new Konva.Transformer()
            const mockTarget = {
                getParent: vi.fn().mockReturnValue(mockParent)
            }
            const mockEvent = { target: mockTarget }

            mouseInstance.selectNode(mockEvent)

            expect(mockSideMenu.hide).toHaveBeenCalled()
        })

        it('should disable anchors for Note text nodes', () => {
            const mockTextNode = new Konva.Text()
            mockTextNode.attrs = { _type: 'Note' }
            mockTextNode.getParent.mockReturnValue({})
            const mockEvent = { target: mockTextNode }

            mouseInstance.selectNode(mockEvent)

            expect(mockTransformer.enabledAnchors).toHaveBeenCalledWith([])
            expect(mockTransformer.nodes).toHaveBeenCalledWith([mockTextNode])
            expect(mockSideMenu.show).toHaveBeenCalledWith(mockTextNode)
        })

        it('should enable all anchors for non-Note nodes', () => {
            const mockTarget = {
                getParent: vi.fn().mockReturnValue({})
            }
            const mockEvent = { target: mockTarget }

            mouseInstance.selectNode(mockEvent)

            expect(mockTransformer.enabledAnchors).toHaveBeenCalledWith([
                'top-left', 'top-right', 'bottom-left', 'bottom-right',
                'middle-left', 'middle-right', 'top-center', 'bottom-center'
            ])
            expect(mockTransformer.nodes).toHaveBeenCalledWith([mockTarget])
            expect(mockSideMenu.show).toHaveBeenCalledWith(mockTarget)
        })

        it('should select regular nodes and show side menu', () => {
            const mockTarget = {
                getParent: vi.fn().mockReturnValue({})
            }
            const mockEvent = { target: mockTarget }

            mouseInstance.selectNode(mockEvent)

            expect(mockTransformer.nodes).toHaveBeenCalledWith([mockTarget])
            expect(mockSideMenu.show).toHaveBeenCalledWith(mockTarget)
        })
    })

    describe('setStageNodesDraggable', () => {
        it('should set draggable to true for all nodes', () => {
            mouseInstance.setStageNodesDraggable(true)

            expect(mockStage.getTopLayer).toHaveBeenCalled()
            expect(mockTopLayer.children[0].draggable).toHaveBeenCalledWith(true)
            expect(mockTopLayer.children[1].draggable).toHaveBeenCalledWith(true)
        })

        it('should set draggable to false for all nodes', () => {
            mouseInstance.setStageNodesDraggable(false)

            expect(mockStage.getTopLayer).toHaveBeenCalled()
            expect(mockTopLayer.children[0].draggable).toHaveBeenCalledWith(false)
            expect(mockTopLayer.children[1].draggable).toHaveBeenCalledWith(false)
        })

        it('should handle when getTopLayer returns null', () => {
            mockStage.getTopLayer.mockReturnValue(null)

            expect(() => mouseInstance.setStageNodesDraggable(true)).not.toThrow()
            expect(mockStage.getTopLayer).toHaveBeenCalled()
        })

        it('should handle when getTopLayer returns undefined', () => {
            mockStage.getTopLayer.mockReturnValue(undefined)

            expect(() => mouseInstance.setStageNodesDraggable(true)).not.toThrow()
            expect(mockStage.getTopLayer).toHaveBeenCalled()
        })
    })

    describe('onTransform', () => {
        it('should adjust dimensions for Text nodes during transform', () => {
            const mockTextNode = new Konva.Text()
            mockTextNode.width.mockReturnValue(100)
            mockTextNode.height.mockReturnValue(50)
            mockTextNode.scaleX.mockReturnValue(1.5)
            mockTextNode.scaleY.mockReturnValue(2)

            const mockEvent = { target: mockTextNode }

            mouseInstance.onTransform(mockEvent)

            expect(mockTextNode.width).toHaveBeenCalledWith(150)
            expect(mockTextNode.height).toHaveBeenCalledWith(100)

            expect(mockTextNode.scaleX).toHaveBeenCalledWith(1)
            expect(mockTextNode.scaleY).toHaveBeenCalledWith(1)
        })

        it('should not modify non-Text nodes', () => {
            const mockNode = {
                width: vi.fn(),
                height: vi.fn(),
                scaleX: vi.fn(),
                scaleY: vi.fn()
            }
            const mockEvent = { target: mockNode }

            mouseInstance.onTransform(mockEvent)

            expect(mockNode.width).not.toHaveBeenCalled()
            expect(mockNode.height).not.toHaveBeenCalled()
            expect(mockNode.scaleX).not.toHaveBeenCalled()
            expect(mockNode.scaleY).not.toHaveBeenCalled()
        })
    })

    describe('integration tests', () => {
        it('should properly handle select and deselect cycle', () => {
            mouseInstance.onSelect()
            expect(mockKonvaStage.on).toHaveBeenCalledTimes(1)
            expect(mockTransformer.on).toHaveBeenCalledTimes(1)

            mouseInstance.onDeselect()
            expect(mockKonvaStage.off).toHaveBeenCalledTimes(1)
            expect(mockTransformer.off).toHaveBeenCalledTimes(1)
            expect(mockTransformer.nodes).toHaveBeenCalledWith([])
            expect(mockSideMenu.hide).toHaveBeenCalled()
        })

        it('should handle node selection after onSelect is called', () => {
            mouseInstance.onSelect()

            const mockTarget = {
                getParent: vi.fn().mockReturnValue({})
            }
            const mockEvent = { target: mockTarget }

            mouseInstance.selectNode(mockEvent)

            expect(mockTransformer.nodes).toHaveBeenCalledWith([mockTarget])
            expect(mockSideMenu.show).toHaveBeenCalledWith(mockTarget)
        })
    })
})