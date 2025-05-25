import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

class Action {
    constructor(stage, toolbar) {
        this.stage = stage;
        this.toolbar = toolbar;
    }
}

global.Action = Action;
globalThis.Action = Action;

vi.mock('../src/test-components/action.js', () => ({
    Action: Action
}));

const { Load } = await import('../src/test-components/load.js');

describe('Load', () => {
    let mockStage;
    let mockToolbar;
    let loadInstance;
    let originalCreateElement;
    let originalAppendChild;
    let originalRemoveChild;

    beforeEach(() => {
        mockStage = {
            deserialize: vi.fn()
        };

        mockToolbar = {};

        loadInstance = new Load(mockStage, mockToolbar);

        originalCreateElement = document.createElement;
        originalAppendChild = document.body.appendChild;
        originalRemoveChild = document.body.removeChild;

        document.createElement = vi.fn();
        document.body.appendChild = vi.fn();
        document.body.removeChild = vi.fn();

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
                clear: vi.fn()
            },
            writable: true
        });

        global.FileReader = vi.fn(() => ({
            readAsText: vi.fn(),
            onload: null,
            result: null
        }));

        console.error = vi.fn();
    });

    afterEach(() => {
        document.createElement = originalCreateElement;
        document.body.appendChild = originalAppendChild;
        document.body.removeChild = originalRemoveChild;

        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create Load instance with stage and toolbar', () => {
            expect(loadInstance.stage).toBe(mockStage);
            expect(loadInstance.toolbar).toBe(mockToolbar);
        });

        it('should have onSelect method defined', () => {
            expect(typeof loadInstance.onSelect).toBe('function');
        });

        it('should have loadFromLocalStorage method defined', () => {
            expect(typeof loadInstance.loadFromLocalStorage).toBe('function');
        });
    });

    describe('onSelect method', () => {
        let mockFileInput;
        let mockFile;
        let mockReader;

        beforeEach(() => {
            mockFileInput = {
                type: '',
                accept: '',
                style: { display: '' },
                addEventListener: vi.fn(),
                click: vi.fn()
            };

            mockFile = new File(['{"snapshot": {"test": "data"}}'], 'test.lkc', {
                type: 'application/json'
            });

            mockReader = {
                readAsText: vi.fn(),
                onload: null,
                result: '{"snapshot": {"test": "data"}}'
            };

            document.createElement.mockReturnValue(mockFileInput);
            global.FileReader.mockReturnValue(mockReader);
        });

        it('should create file input with correct attributes', () => {
            loadInstance.onSelect();

            expect(document.createElement).toHaveBeenCalledWith('input');
            expect(mockFileInput.type).toBe('file');
            expect(mockFileInput.accept).toBe('.lkc');
            expect(mockFileInput.style.display).toBe('none');
        });

        it('should append file input to document body', () => {
            loadInstance.onSelect();

            expect(document.body.appendChild).toHaveBeenCalledWith(mockFileInput);
        });

        it('should add change event listener to file input', () => {
            loadInstance.onSelect();

            expect(mockFileInput.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });

        it('should click the file input', () => {
            loadInstance.onSelect();

            expect(mockFileInput.click).toHaveBeenCalled();
        });

        it('should process valid .lkc file with snapshot data', () => {
            loadInstance.onSelect();

            const changeHandler = mockFileInput.addEventListener.mock.calls[0][1];

            changeHandler({ target: { files: [mockFile] } });

            mockReader.onload();

            expect(mockStage.deserialize).toHaveBeenCalledWith({"test": "data"});
        });

        it('should handle file without snapshot data', () => {
            mockReader.result = '{"other": "data"}';

            loadInstance.onSelect();
            const changeHandler = mockFileInput.addEventListener.mock.calls[0][1];
            changeHandler({ target: { files: [mockFile] } });
            mockReader.onload();

            expect(console.error).toHaveBeenCalledWith('File does not contain snapshot data');
            expect(mockStage.deserialize).not.toHaveBeenCalled();
        });

        it('should handle invalid JSON in file', () => {
            mockReader.result = 'invalid json';

            loadInstance.onSelect();
            const changeHandler = mockFileInput.addEventListener.mock.calls[0][1];
            changeHandler({ target: { files: [mockFile] } });
            mockReader.onload();

            expect(console.error).toHaveBeenCalledWith('Failed to parse .lkc file:', expect.any(Error));
            expect(mockStage.deserialize).not.toHaveBeenCalled();
        });

        it('should remove file input from document body after file selection', () => {
            loadInstance.onSelect();
            const changeHandler = mockFileInput.addEventListener.mock.calls[0][1];
            changeHandler({ target: { files: [mockFile] } });

            expect(document.body.removeChild).toHaveBeenCalledWith(mockFileInput);
        });

        it('should handle case when no file is selected', () => {
            loadInstance.onSelect();
            const changeHandler = mockFileInput.addEventListener.mock.calls[0][1];
            changeHandler({ target: { files: [] } });

            expect(document.body.removeChild).toHaveBeenCalledWith(mockFileInput);
            expect(mockStage.deserialize).not.toHaveBeenCalled();
        });
    });

    describe('loadFromLocalStorage method', () => {
        it('should load data from localStorage when data exists', () => {
            const savedData = '{"test": "data"}';
            localStorage.getItem.mockReturnValue(savedData);

            const result = loadInstance.loadFromLocalStorage();

            expect(localStorage.getItem).toHaveBeenCalledWith('stage');
            expect(mockStage.deserialize).toHaveBeenCalledWith(savedData);
            expect(result).toBe(true);
        });

        it('should return false when no data in localStorage', () => {
            localStorage.getItem.mockReturnValue(null);

            const result = loadInstance.loadFromLocalStorage();

            expect(localStorage.getItem).toHaveBeenCalledWith('stage');
            expect(mockStage.deserialize).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should return false when localStorage returns empty string', () => {
            localStorage.getItem.mockReturnValue('');

            const result = loadInstance.loadFromLocalStorage();

            expect(localStorage.getItem).toHaveBeenCalledWith('stage');
            expect(mockStage.deserialize).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('inheritance', () => {
        it('should extend Action class', () => {
            expect(loadInstance).toBeInstanceOf(Action);
        });
    });
});