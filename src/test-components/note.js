import Konva from "konva";

export default class Note extends Tool {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.onSelect = () => {
            this.stage.stage.on("mouseup", this.onMouseUp);
        }

        this.onDeselect = () => {
            this.stage.stage.off("mouseup", this.onMouseUp);
        }

        this.onMouseUp = () => {
            const pos = this.stage.stage.getPointerPosition();

            let note = new Konva.Text({
                x: pos.x,
                y: pos.y,
                width: 200,
                height: 300,
                fontSize: 20,
                text: "Text",
                padding: 10,
                _type: "Note",
                _bgColor: "#fff8b8",
                sceneFunc: noteSceneFunc,
            })

            this.stage.getTopLayer().add(note);
            this.toolbar.selectTool(0)
        }
    }
}
