import {GooglePicker} from "@/utils/google_picker.js";

class LoadProjectFromGoogleDrive extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.picker = new GooglePicker()

        this.onSelect = () => {
            this.picker.show(this.callback)
        }

        this.onDeselect = () => {

        }

        this.callback = async (data) => {
            const file = await this.picker.downloadImage(data.file.id)

            this.stage.deserialize(file.snapshot)
        }
    }
}