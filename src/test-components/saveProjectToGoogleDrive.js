import {GoogleAuth} from "@/utils/google_picker.js";
import * as API from "@/api/index.js";

class SaveProjectToGoogleDrive extends Action {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = async () => {
            const token = await GoogleAuth.google_drive()

            const response = await API.GoogleDrive.uploadProject({
                access_token: token,
                project: JSON.stringify({
                    metadata: {
                        title: 'Board',
                        createdAt: new Date().toISOString(),
                    },
                    snapshot: this.stage.serialize(),
                })
            })

            snackbarFileName.value = response.file_name
            snackbar.value = true
        }
    }
}