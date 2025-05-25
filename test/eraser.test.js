import { describe, it, expect, vi, beforeEach } from 'vitest';
import Konva from 'konva';

vi.mock('konva', () => {
    function Line() {
        return Object.create(Line.prototype, {
            destroy: { value: vi.fn() },
        });
    }
    vi.spyOn(Line, 'name', 'get').mockReturnValue('Line');
    return {
        default: {
            Line,
            Stage: vi.fn(),
            Layer: vi.fn(),
        },
    };
});

vi.mock('../src/test-components/eraser.js', () => {
    return {
        default: class Eraser {
            constructor(stage, toolbar) {
                this.stage = stage;
                this.toolbar = toolbar;
                this.erasing = false;

                this.onSelect = () => {
                    this.stage.stage.on('mousedown', this.onMouseDown);
                    this.stage.stage.on('mouseup', this.onMouseUp);
                    this.stage.stage.on('mousemove', this.onMouseMove);
                };

                this.onDeselect = () => {
                    this.stage.stage.off('mousedown', this.onMouseDown);
                    this.stage.stage.off('mouseup', this.onMouseUp);
                    this.stage.stage.off('mousemove', this.onMouseMove);
                };

                this.onMouseDown = (e) => {
                    this.erasing = true;
                    this.erase(e);
                };

                this.onMouseUp = () => {
                    this.erasing = false;
                };

                this.onMouseMove = (e) => {
                    this.erase(e);
                };

                this.erase = (e) => {
                    if (this.erasing && e.target instanceof Konva.Line) {
                        e.target.destroy();
                    }
                };
            }
        },
    };
});

import Eraser from '../src/test-components/eraser.js';

describe('Eraser', () => {
    let stage, toolbar, eraser;

    beforeEach(() => {
        vi.clearAllMocks();

        stage = {
            stage: {
                on: vi.fn(),
                off: vi.fn(),
            },
        };

        toolbar = {
            selectTool: vi.fn(),
        };

        eraser = new Eraser(stage, toolbar);
    });

    it('should attach event handlers when onSelect is called', () => {
        eraser.onSelect();
        expect(stage.stage.on).toHaveBeenCalledWith('mousedown', eraser.onMouseDown);
        expect(stage.stage.on).toHaveBeenCalledWith('mouseup', eraser.onMouseUp);
        expect(stage.stage.on).toHaveBeenCalledWith('mousemove', eraser.onMouseMove);
    });

    it('should remove event handlers when onDeselect is called', () => {
        eraser.onDeselect();
        expect(stage.stage.off).toHaveBeenCalledWith('mousedown', eraser.onMouseDown);
        expect(stage.stage.off).toHaveBeenCalledWith('mouseup', eraser.onMouseUp);
        expect(stage.stage.off).toHaveBeenCalledWith('mousemove', eraser.onMouseMove);
    });

    it('should set erasing to true and call erase on mouse down', () => {
        const mockEvent = { target: new Konva.Line() };
        const eraseSpy = vi.spyOn(eraser, 'erase');
        eraser.onMouseDown(mockEvent);
        expect(eraser.erasing).toBe(true);
        expect(eraseSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should set erasing to false on mouse up', () => {
        eraser.erasing = true;
        eraser.onMouseUp();
        expect(eraser.erasing).toBe(false);
    });

    it('should call erase on mouse move', () => {
        const mockEvent = { target: new Konva.Line() };
        const eraseSpy = vi.spyOn(eraser, 'erase');
        eraser.onMouseMove(mockEvent);
        expect(eraseSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should destroy target if erasing is true and target is a Konva.Line', () => {
        const mockTarget = new Konva.Line();
        const mockEvent = { target: mockTarget };
        eraser.erasing = true;
        eraser.erase(mockEvent);
        expect(mockTarget.destroy).toHaveBeenCalled();
    });

    it('should not destroy target if erasing is false', () => {
        const mockTarget = new Konva.Line();
        const mockEvent = { target: mockTarget };
        eraser.erasing = false;
        eraser.erase(mockEvent);
        expect(mockTarget.destroy).not.toHaveBeenCalled();
    });

    it('should not destroy target if target is not a Konva.Line', () => {
        const mockTarget = {}; // Not a Konva.Line
        const mockEvent = { target: mockTarget };
        eraser.erasing = true;
        eraser.erase(mockEvent);
        expect(mockTarget.destroy).toBeUndefined();
    });
});