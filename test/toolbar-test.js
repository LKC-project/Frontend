// describe('ToolbarItem', () => {
//     it('should initialize with stage and toolbar', () => {
//         const stage = {};
//         const toolbar = {};
//         const item = new ToolbarItem(stage, toolbar);
//         expect(item.stage).toBe(stage);
//         expect(item.toolbar).toBe(toolbar);
//         expect(typeof item.onSelect).toBe('function');
//         expect(typeof item.onDeselect).toBe('function');
//     });
// });
//
// describe('Mouse tool', () => {
//     let mockStage, mockTransformer, mockLayer, mouse;
//
//     beforeEach(() => {
//         mockTransformer = {
//             on: jest.fn(),
//             off: jest.fn(),
//             nodes: jest.fn(),
//             enabledAnchors: jest.fn()
//         };
//         mockLayer = {children: [{draggable: jest.fn()}]};
//         mockStage = {
//             stage: {on: jest.fn(), off: jest.fn()},
//             transformer: mockTransformer,
//             getTopLayer: () => mockLayer
//         };
//         mouse = new Mouse(mockStage)
//     })
// })
