import Konva from "konva";

export class Eraser extends Tool {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.erasing = false

        this.onSelect = () => {
            this.stage.stage.on("mousedown", this.onMouseDown);
            this.stage.stage.on("mouseup", this.onMouseUp);
            this.stage.stage.on("mousemove", this.onMouseMove);
        }

        this.onDeselect = () => {
            this.stage.stage.off("mousedown", this.onMouseDown);
            this.stage.stage.off("mouseup", this.onMouseUp);
            this.stage.stage.off("mousemove", this.onMouseMove);
        }

        this.onMouseDown = (e) => {
            this.erasing = true
            this.erase(e)
        }

        this.onMouseUp = () => {
            this.erasing = false
        }

        this.onMouseMove = (e) => {
            this.erase(e)
        }

        this.erase = (e) => {
            if (this.erasing && e.target instanceof Konva.Line) {
                e.target.destroy()
            }
        }
    }
}