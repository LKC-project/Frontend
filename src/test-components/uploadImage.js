import * as API from "@/api/index.js";
import Konva from "konva";

export class UploadImage extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.fileInput = null

        this.onSelect = () => {
            console.log(1123)
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.accept = 'image/*';
            this.fileInput.style.display = 'none';
            this.fileInput.addEventListener('change', this.onChange);

            document.body.appendChild(this.fileInput);
            this.fileInput.click();

            console.log(this.toolbar)
        }

        this.onDeselect = () => {
            this.fileInput.remove();
            this.fileInput = null;
        }

        this.onChange = async (event) => {
            const file = event.target.files[0];

            if (!file) {
                return
            }

            const imageUrl = (await API.Image.upload({file: file})).url

            const img = new Image()
            img.crossOrigin = "Anonymous";

            img.onload = () => {
                const konvaImage = new Konva.Image({
                    x: 50,
                    y: 50,
                    image: img,
                    width: img.width,
                    height: img.height,
                });

                this.stage.getTopLayer().add(konvaImage)
                this.stage.saveSnapshot()
                this.toolbar.selectTool(0)
            }

            img.src = imageUrl
        }
    }
}