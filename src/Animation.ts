export class Animation {

  private frames: HTMLCanvasElement[];
  private masks: boolean[][][];
  private frame: number;

  public constructor(frames: HTMLCanvasElement[], masks: boolean[][][]) {
    this.frames = frames;
    this.masks = masks;
    this.frame = 0;
  }

  public width(): number {
    return this.frames[0].width;
  }

  public step(): boolean {
    this.frame = (this.frame + 1) % this.frames.length;
    return this.frame === 0;
  }

  // returns percent complete of animation
  public complete(): number {
    return this.frames.length > 1 ? this.frame / (this.frames.length - 1) : 1;
  }

  public mask(): boolean[][] {
    return this.masks[this.frame];
  }

  public render(context: CanvasRenderingContext2D, scale: number = 1): void {
    const img = this.frames[this.frame];
    if (img) {
      context.drawImage(img, 0, 0, Math.round(scale * img.width), Math.round(scale * img.height));
    }
  }

}
