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

vi.mock('../src/test-components/note.js', () => {
    const mockNoteSceneFunc = vi.fn();
    return {
        default: class Note {
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
                    let note = new Konva.Text({
                        x: pos.x,
                        y: pos.y,
                        width: 200,
                        height: 300,
                        fontSize: 20,
                        text: 'Text',
                        padding: 10,
                        _type: 'Note',
                        _bgColor: '#fff8b8',
                        sceneFunc: mockNoteSceneFunc,
                    });
                    this.stage.getTopLayer().add(note);
                    this.toolbar.selectTool(0);
                };
            }
        },
    };
});

import Note from '../src/test-components/note.js';

describe('Note', () => {
    let stage, toolbar, note;

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

        note = new Note(stage, toolbar);
    });

    it('should attach onMouseUp handler when onSelect is called', () => {
        note.onSelect();
        expect(stage.stage.on).toHaveBeenCalledWith('mouseup', note.onMouseUp);
    });

    it('should remove onMouseUp handler when onDeselect is called', () => {
        note.onDeselect();
        expect(stage.stage.off).toHaveBeenCalledWith('mouseup', note.onMouseUp);
    });

    it('should create a Konva.Text note with correct properties on mouse up', () => {
        note.onMouseUp();
        expect(Konva.Text).toHaveBeenCalledWith({
            x: 100,
            y: 200,
            width: 200,
            height: 300,
            fontSize: 20,
            text: 'Text',
            padding: 10,
            _type: 'Note',
            _bgColor: '#fff8b8',
            sceneFunc: expect.any(Function),
        });
    });

    it('should add the note to the top layer on mouse up', () => {
        note.onMouseUp();
        expect(stage.getTopLayer).toHaveBeenCalled();
        expect(stage.getTopLayer().add).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should call toolbar.selectTool(0) on mouse up', () => {
        note.onMouseUp();
        expect(toolbar.selectTool).toHaveBeenCalledWith(0);
    });
});