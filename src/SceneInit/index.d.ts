export default class MyClass {
    constructor(canvasId: any): MyClass;
    initialize(): void;
    animate(): void;
    render(): void;
    onWindowResize(): void;
    scene: any;
    camera: any;
    renderer: any;
    fov: number;
    nearPlane: number;
    canvasId: string;
    clock: any;
    stats: any;
    controls: any;
    ambientLight: any;
    directionalLight: any;
  }