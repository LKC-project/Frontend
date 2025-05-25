import Konva from "konva";

export class Stage {
    constructor(projectId = null, api = null, saveIntervalMs = 30000) {
        this.stage = null;
        this.stageContainerRef = null;
        this.transformer = null;
        this.history = [];
        this.historyIndex = -1;
        this.stageContainerResizeObserver = null;
        this.autoSaveInterval = null;
        this.lastSavedData = null;
        this.isSaving = false;
        this.saveIntervalMs = saveIntervalMs;
        this.projectId = projectId;
        this.api = api;

        this.onResize = () => {
            if (!this.stageContainerRef || !this.stageContainerRef.value) return;

            this.stage.width(this.stageContainerRef.value.clientWidth);
            this.stage.height(this.stageContainerRef.value.clientHeight);
        }

        this.init = (stageRef, stageContainerRef) => {
            if (!stageRef || !stageRef.value || !stageContainerRef || !stageContainerRef.value) {
                console.error("Invalid stage or container references");
                return;
            }

            this.stage = stageRef.value.getStage();
            this.stageContainerRef = stageContainerRef;

            this.history = [];
            this.historyIndex = -1;

            this.stageContainerResizeObserver = new ResizeObserver(this.onResize);
            this.stageContainerResizeObserver.observe(stageContainerRef.value);

            const boundSaveSnapshot = this.saveSnapshot.bind(this);
            this.stage.on("mousedown", boundSaveSnapshot);
            this.stage.on("mouseup", boundSaveSnapshot);

            const layer = new Konva.Layer();
            const transformerLayer = new Konva.Layer();

            this.transformer = new Konva.Transformer();
            transformerLayer.add(this.transformer);

            this.stage.add(layer);
            this.stage.add(transformerLayer);

            this.onResize();

            this.saveSnapshot();

            if (this.api && this.projectId) {
                this.startAutoSave();
            }
        }

        this.destroy = () => {
            if (this.stageContainerResizeObserver) {
                this.stageContainerResizeObserver.disconnect();
            }

            if (this.stage) {
                this.stage.off("mousedown");
                this.stage.off("mouseup");
            }
            this.stopAutoSave();
        }

        this.getTopLayer = () => {
            if (!this.stage) return null;

            const layers = this.stage.getLayers();
            return layers.length >= 2 ? layers[layers.length - 2] : null;
        }

        this.serialize = () => {
            const layer = this.getTopLayer();
            if (!layer) return null;

            layer.find('Image').forEach(imageNode => {
                const img = imageNode.image();
                if (img && img.src) {
                    imageNode.setAttr('src', img.src);
                }
            });

            return layer.toJSON();
        }

        this.deserialize = (data) => {
            if (!this.transformer || !this.stage) return;

            this.transformer.nodes([]);
            const layer = this.getTopLayer();
            if (!layer) return;

            layer.destroyChildren();

            let snapshot = data;
            if (typeof data === 'string') {
                try {
                    snapshot = JSON.parse(data);
                } catch (error) {
                    console.error("Failed to parse snapshot data:", error);
                    return;
                }
            }

            if (!snapshot || !snapshot.children) {
                console.error("Invalid snapshot data");
                return;
            }

            const loadPromises = [];

            snapshot.children.forEach((node) => {
                if (node.className === 'Image' && node.attrs.src) {
                    const promise = new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            const imageNode = new Konva.Image({
                                ...node.attrs,
                                image: img,
                            });
                            layer.add(imageNode);
                            resolve();
                        };
                        img.onerror = () => {
                            console.error("Failed to load image:", node.attrs.src);
                            resolve();
                        };
                        img.src = node.attrs.src;
                    });
                    loadPromises.push(promise);
                } else {
                    try {
                        const newNode = Konva.Node.create(JSON.stringify(node));
                        layer.add(newNode);
                    } catch (error) {
                        console.error("Failed to create node:", error);
                    }
                }
            });

            Promise.all(loadPromises).then(() => {
                layer.children.forEach((node) => {
                    if (node.attrs && node.attrs._type === "Note" && typeof noteSceneFunc === 'function') {
                        node.sceneFunc(noteSceneFunc);
                    }
                });
                layer.draw();
            });
        }

        this.undo = () => {
            if (this.historyIndex <= 0) return;

            this.historyIndex -= 1;
            const snapshot = this.history[this.historyIndex];
            this.deserialize(snapshot);
        }

        this.redo = () => {
            if (this.historyIndex >= this.history.length - 1) return;

            this.historyIndex += 1;
            this.deserialize(this.history[this.historyIndex]);
        }

        this.saveSnapshot = () => {
            const serialized = this.serialize();
            if (!serialized) return;

            if (this.history[this.historyIndex] === serialized) {
                return;
            }

            if (this.history.length - 1 > this.historyIndex) {
                this.history.length = this.historyIndex + 1;
            }

            this.history.push(serialized);
            this.historyIndex += 1;
        }

        this.startAutoSave = () => {
            if (this.autoSaveInterval) {
                this.stopAutoSave();
            }

            this.autoSaveInterval = setInterval(() => {
                this.autoSave();
            }, this.saveIntervalMs);
            console.log(`Auto-save started (every ${this.saveIntervalMs / 1000} seconds)`);
        };

        this.stopAutoSave = () => {
            if (this.autoSaveInterval) {
                clearInterval(this.autoSaveInterval);
                this.autoSaveInterval = null;
                console.log('Auto-save stopped');
            }
        };

        this.showSaveNotification = () => {
            const notification = document.getElementById('save-notification');
            if (notification) {
                notification.classList.remove('hidden');
                notification.classList.add('visible');

                setTimeout(() => {
                    notification.classList.remove('visible');
                    notification.classList.add('hidden');
                }, 3000);
            }
        };

        this.autoSave = async () => {
            if (this.isSaving || !this.history.length || this.historyIndex < 0 || !this.api) {
                return;
            }

            const currentData = this.history[this.historyIndex];

            if (this.lastSavedData === currentData) {
                return;
            }

            const contentSize = JSON.stringify(currentData).length;
            console.log(`Content size: ${contentSize} bytes`);

            try {
                this.isSaving = true;
                this.triggerSavingIndicator(true);

                const contentToSend = typeof currentData === 'string'
                    ? JSON.parse(currentData)
                    : currentData;

                await this.api.update({
                    id: this.projectId,
                    content: contentToSend,
                });

                this.lastSavedData = currentData;
                console.log('Save successful');
                this.showSaveNotification();
            } catch (error) {
                console.error('Save error:', error);
            } finally {
                this.isSaving = false;
                this.triggerSavingIndicator(false);
            }
        };

        this.triggerSavingIndicator = (isShowing) => {
            const indicator = document.getElementById('saving-indicator');
            if (indicator) {
                indicator.style.display = isShowing ? 'block' : 'none';
            }
        }
    }
}