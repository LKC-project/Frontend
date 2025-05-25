import Konva from "konva";

class Draw extends Tool {
    constructor(stage, toolbar) {
        super(stage, toolbar);

        this.drawing = false
        this.line = null

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

        this.onMouseDown = () => {
            this.drawing = true

            if (this.line === null) {
                this.line = new Konva.Line({
                    points: [],
                    stroke: "black",
                    strokeWidth: 3,
                })
            }

            const layer = stage.getTopLayer()
            const point = this.stage.stage.getPointerPosition();

            this.line.points([...this.line.points(), point.x, point.y]);
            layer.add(this.line)
        }

        this.onMouseUp = () => {
            this.drawing = false
            this.line = null
        }

        this.onMouseMove = () => {
            if (!this.drawing) {
                return
            }

            const point = this.stage.stage.getPointerPosition();
            this.line.points([...this.line.points(), point.x, point.y]);
        }
    }
}