import Konva from "konva";

class Mouse extends Tool {
    constructor(stage, toolbar) {
        super(stage, toolbar)

        this.onSelect = () => {
            this.stage.stage.on("mousedown", this.selectNode)
            this.stage.transformer.on("transform", this.onTransform)
            this.setStageNodesDraggable(true)
        }

        this.onDeselect = () => {
            this.stage.stage.off("mousedown", this.selectNode)
            this.stage.transformer.off("transform", this.onTransform)
            this.stage.transformer.nodes([]);
            this.setStageNodesDraggable(false)
            sideMenu.hide()
        }

        this.selectNode = (e) => {
            this.setStageNodesDraggable(true) // - ?
            this.stage.transformer.enabledAnchors(
                ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
            )

            if (e.target instanceof Konva.Stage) {
                this.stage.transformer.nodes([])
                sideMenu.hide()
                return
            }

            if (e.target.getParent() instanceof Konva.Transformer) {
                sideMenu.hide()
                return
            }

            if (e.target instanceof Konva.Text) {
                if (e.target.attrs._type === "Note") {
                    this.stage.transformer.enabledAnchors([])
                }
            }

            this.stage.transformer.nodes([e.target])
            sideMenu.show(e.target)
        }

        this.setStageNodesDraggable = (value) => {
            this.stage.getTopLayer()?.children.forEach(node => {
                node.draggable(value)
            });
        }

        this.onTransform = (e) => {
            if (e.target instanceof Konva.Text) {
                e.target.width(e.target.width() * e.target.scaleX());
                e.target.height(e.target.height() * e.target.scaleY());

                e.target.scaleX(1);
                e.target.scaleY(1);
            }
        }
    }
}