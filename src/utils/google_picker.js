import axios from "axios";

const APP_ID = 509878879845
const CLIENT_ID = "509878879845-pck882gn0mhtga5daip5amvb4jgaq9mt.apps.googleusercontent.com"
const ACCESS_TOKEN = "AIzaSyAjNpSLqw6r15qPn1MZrWSiEkJoD0Dt1ic"


export class GoogleAuth {
    static google_drive() {
        return new Promise((resolve, reject) => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (response) => {
                    if (response.error !== undefined) {
                        reject(response);
                    } else {
                        resolve(response.access_token);
                    }
                },
            });

            tokenClient.requestAccessToken({prompt: ''})
        });
    }
}


export class GooglePicker {
    constructor() {
        if (GooglePicker.instance) { return GooglePicker.instance }

        let userAccessToken = null
        this.callback = null

        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: '',
        })

        this.tokenClient.callback = async (response) => {
            if (response.error !== undefined) { throw response }
            userAccessToken = response.access_token
            this.buildPicker().setVisible(true)
        }

        this.pickerCallback = (data) => {
            if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                this.callback({
                    file: data[google.picker.Response.DOCUMENTS][0],
                    access_token: userAccessToken
                })
            }
        }

        this.buildPicker = () => {
            return new google.picker.PickerBuilder()
                .setAppId(APP_ID)
                .setDeveloperKey(ACCESS_TOKEN)
                .setOAuthToken(userAccessToken)
                .addView(new google.picker.DocsView()
                    .setIncludeFolders(false)
                    .setMimeTypes('application/octet-stream')
                )
                .setCallback(this.pickerCallback)
                .build()
        }

        this.show = (callback) => {
            this.callback = callback
            this.tokenClient.requestAccessToken({prompt: ''});
        }

        this.downloadImage = async (fileId) => {
            const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${userAccessToken}`
                },
            });

            return response.data;
        }

        GooglePicker.instance = this
    }
}