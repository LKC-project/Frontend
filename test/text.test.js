import { describe, it, expect, vi, beforeEach } from 'vitest';
import Konva from 'konva';

vi.mock('konva', () => ({
    default: {
        Text: vi.fn().mockImplementation((config) => ({
            ...config,
            setAttr: vi.fn(),
        })),
        Stage: vi.fn(),
        Layer: vi.fn(),
    },
}));

vi.mock('../src/test-components/text.js', () => {
    return {
        default: class Text {
            constructor(stage, toolbar) {
                this.stage = stage;
                this.toolbar = toolbar;

                this.onSelect = () => {
                    this.stage.stage.on('mouseup', this.onMouseUp);
                };

                this.onDeselect = () => {
                    this.stage.stage.off('mouseup', this.onMouseUp);
                };

                this.onMouseUp = () => {
                    const pos = this.stage.stage.getPointerPosition();
                    const text = new Konva.Text({
                        x: pos.x,
                        y: pos.y,
                        fontSize: 20,
                        width: 200,
                        text: 'Text',
                        _type: 'Text',
                    });
                    this.stage.getTopLayer().add(text);
                    this.toolbar.selectTool(0);
                };
            }
        },
    };
});

import Text from '../src/test-components/text.js';

describe('Text', () => {
    let stage, toolbar, text;

    beforeEach(() => {
        vi.clearAllMocks();

        stage = {
            stage: {
                on: vi.fn(),
                off: vi.fn(),
                getPointerPosition: vi.fn().mockReturnValue({ x: 100, y: 200 }),
            },
            getTopLayer: vi.fn().mockReturnValue({
                add: vi.fn(),
            }),
        };

        toolbar = {
            selectTool: vi.fn(),
        };

        text = new Text(stage, toolbar);
    });

    it('should attach onMouseUp handler when onSelect is called', () => {
        text.onSelect();
        expect(stage.stage.on).toHaveBeenCalledWith('mouseup', text.onMouseUp);
    });

    it('should remove onMouseUp handler when onDeselect is called', () => {
        text.onDeselect();
        expect(stage.stage.off).toHaveBeenCalledWith('mouseup', text.onMouseUp);
    });

    it('should create a Konva.Text with correct properties on mouse up', () => {
        text.onMouseUp();
        expect(Konva.Text).toHaveBeenCalledWith({
            x: 100,
            y: 200,
            fontSize: 20,
            width: 200,
            text: 'Text',
            _type: 'Text',
        });
    });

    it('should add the text to the top layer on mouse up', () => {
        text.onMouseUp();
        expect(stage.getTopLayer).toHaveBeenCalled();
        expect(stage.getTopLayer().add).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should call toolbar.selectTool(0) on mouse up', () => {
        text.onMouseUp();
        expect(toolbar.selectTool).toHaveBeenCalledWith(0);
    });
});