
export class Load extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.lkc';
            fileInput.style.display = 'none';

            document.body.appendChild(fileInput);

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const data = JSON.parse(reader.result);
                            if (data.snapshot) {
                                this.stage.deserialize(data.snapshot);
                            } else {
                                console.error('File does not contain snapshot data');
                            }
                        } catch (error) {
                            console.error('Failed to parse .lkc file:', error);
                        }
                    };
                    reader.readAsText(file);
                }

                document.body.removeChild(fileInput);
            });

            fileInput.click();
        }

        this.loadFromLocalStorage = () => {
            const savedData = localStorage.getItem("stage");
            if (savedData) {
                this.stage.deserialize(savedData);
                return true;
            }
            return false;
        }
    }
}