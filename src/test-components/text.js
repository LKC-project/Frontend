import Konva from "konva";

class Text extends Tool {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.onSelect = () => {
            this.stage.stage.on("mouseup", this.onMouseUp);
        }

        this.onDeselect = () => {
            this.stage.stage.off("mouseup", this.onMouseUp);
        }

        this.onMouseUp = () => {
            const pos = this.stage.stage.getPointerPosition()

            const text = new Konva.Text({
                x: pos.x,
                y: pos.y,
                fontSize: 20,
                width: 200,
                text: "Text",
                _type: "Text",
            })

            this.stage.getTopLayer().add(text)
            this.toolbar.selectTool(0)
        }
    }
}