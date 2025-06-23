// @ts-nocheck
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';

interface HyperspeedProps {
  effectOptions?: {
    onSpeedUp?: () => void;
    onSlowDown?: () => void;
    distortion?: string;
    length?: number;
    roadWidth?: number;
    islandWidth?: number;
    lanesPerRoad?: number;
    fov?: number;
    fovSpeedUp?: number;
    speedUp?: number;
    carLightsFade?: number;
    totalSideLightSticks?: number;
    lightPairsPerRoadWay?: number;
    shoulderLinesWidthPercentage?: number;
    brokenLinesWidthPercentage?: number;
    brokenLinesLengthPercentage?: number;
    lightStickWidth?: [number, number];
    lightStickHeight?: [number, number];
    movingAwaySpeed?: [number, number];
    movingCloserSpeed?: [number, number];
    carLightsLength?: [number, number];
    carLightsRadius?: [number, number];
    carWidthPercentage?: [number, number];
    carShiftX?: [number, number];
    carFloorSeparation?: [number, number];
    colors?: {
      roadColor?: number;
      islandColor?: number;
      background?: number;
      shoulderLines?: number;
      brokenLines?: number;
      leftCars?: number[];
      rightCars?: number[];
      sticks?: number;
    };
  };
}

const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions = {} }) => {
  const hyperspeed = useRef<HTMLDivElement>(null);

  // Default options with RogueSim cyberpunk theme
  const defaultOptions = {
    onSpeedUp: () => { },
    onSlowDown: () => { },
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3, 1.7] as [number, number],
    movingAwaySpeed: [60, 80] as [number, number],
    movingCloserSpeed: [-120, -160] as [number, number],
    carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
    carLightsRadius: [0.05, 0.14] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    colors: {
      roadColor: 0x0a0a0a,      // Dark gray road
      islandColor: 0x050505,    // Very dark island
      background: 0x000000,     // Black background
      shoulderLines: 0x00ff41,  // Matrix green lines
      brokenLines: 0x00ff41,    // Matrix green lines
      leftCars: [0x00ff41, 0x39ff14, 0x32cd32],  // Various greens
      rightCars: [0x00bfff, 0x1e90ff, 0x0080ff], // Various blues/cyans
      sticks: 0x00ff41,         // Matrix green sticks
    }
  };

  const options = { ...defaultOptions, ...effectOptions };

  useEffect(() => {
    if (!hyperspeed.current) return;

    let nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;

    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
    };

    const distortions = {
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const uFreq = turbulentUniforms.uFreq.value;
          const uAmp = turbulentUniforms.uAmp.value;

          const getX = (p: number) =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;

          const getY = (p: number) =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;

          let distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          );
          let lookAtAmp = new THREE.Vector3(-2, -5, 0);
          let lookAtOffset = new THREE.Vector3(0, 0, -10);
          return distortion.multiply(lookAtAmp).add(lookAtOffset);
        }
      }
    };

    // Simplified App class for RogueSim
    class HyperspeedApp {
      options: any;
      container: HTMLElement;
      renderer: THREE.WebGLRenderer;
      composer: EffectComposer;
      camera: THREE.PerspectiveCamera;
      scene: THREE.Scene;
      clock: THREE.Clock;
      disposed: boolean;
      speedUp: number;
      timeOffset: number;

      constructor(container: HTMLElement, options: any = {}) {
        this.options = options;
        this.options.distortion = distortions.turbulentDistortion;
        this.container = container;
        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.composer = new EffectComposer(this.renderer);
        container.append(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
          options.fov,
          container.offsetWidth / container.offsetHeight,
          0.1,
          10000
        );
        this.camera.position.z = -5;
        this.camera.position.y = 8;
        this.camera.position.x = 0;
        this.scene = new THREE.Scene();
        this.scene.background = null;

        this.clock = new THREE.Clock();
        this.disposed = false;
        this.speedUp = 0;
        this.timeOffset = 0;

        this.tick = this.tick.bind(this);
        this.init = this.init.bind(this);

        window.addEventListener("resize", this.onWindowResize.bind(this));
      }

      onWindowResize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(width, height);
      }

      initPasses() {
        const renderPass = new RenderPass(this.scene, this.camera);
        const bloomPass = new EffectPass(
          this.camera,
          new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 1
          })
        );

        const smaaPass = new EffectPass(
          this.camera,
          new SMAAEffect({
            preset: SMAAPreset.MEDIUM,
          })
        );
        
        renderPass.renderToScreen = false;
        bloomPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        
        this.composer.addPass(renderPass);
        this.composer.addPass(bloomPass);
        this.composer.addPass(smaaPass);
      }

      createSimpleRoad() {
        // Create a simple animated road with lights
        const geometry = new THREE.PlaneGeometry(20, 400, 1, 100);
        const material = new THREE.ShaderMaterial({
          vertexShader: `
            uniform float uTime;
            varying vec2 vUv;
            void main() {
              vec3 pos = position;
              pos.y += sin(pos.y * 0.01 + uTime * 2.0) * 2.0;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              vUv = uv;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            void main() {
              vec2 uv = vUv;
              uv.y = mod(uv.y + uTime * 0.1, 1.0);
              
              float road = step(0.4, uv.x) * step(uv.x, 0.6);
              float lines = step(0.98, mod(uv.y * 10.0, 1.0)) * road;
              
              vec3 color = vec3(0.05, 0.05, 0.05) * road;
              color += vec3(0.0, 1.0, 0.25) * lines;
              
              gl_FragColor = vec4(color, road + lines);
            }
          `,
          uniforms: {
            uTime: { value: 0 }
          },
          transparent: true
        });

        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2;
        road.position.z = -200;
        this.scene.add(road);

        return { road, material };
      }

      createLights() {
        const lights: THREE.Mesh[] = [];
        const colors = [0x00ff41, 0x39ff14, 0x00bfff, 0x1e90ff];

        for (let i = 0; i < 50; i++) {
          const geometry = new THREE.SphereGeometry(0.2, 8, 8);
          const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.8
          });

          const light = new THREE.Mesh(geometry, material);
          light.position.x = (Math.random() - 0.5) * 20;
          light.position.y = Math.random() * 3;
          light.position.z = -Math.random() * 400;

          this.scene.add(light);
          lights.push(light);
        }

        return lights;
      }

      init() {
        this.initPasses();
        const { road, material } = this.createSimpleRoad();
        const lights = this.createLights();

        this.tick();
      }

      update(delta: number) {
        this.timeOffset += delta;
        const time = this.clock.elapsedTime + this.timeOffset;

        // Update road material
        this.scene.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
            if (child.material.uniforms.uTime) {
              child.material.uniforms.uTime.value = time;
            }
          }
        });

        // Animate camera
        if (this.options.distortion.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time);
          this.camera.lookAt(
            new THREE.Vector3(
              this.camera.position.x + distortion.x,
              this.camera.position.y + distortion.y,
              this.camera.position.z + distortion.z
            )
          );
        }
      }

      render(delta: number) {
        this.composer.render(delta);
      }

      dispose() {
        this.disposed = true;
        this.renderer.dispose();
        this.composer.dispose();
      }

      tick() {
        if (this.disposed) return;
        
        const delta = this.clock.getDelta();
        this.render(delta);
        this.update(delta);
        requestAnimationFrame(this.tick);
      }
    }

    // Initialize the app
    let myApp: HyperspeedApp | undefined;
    
    if (hyperspeed.current) {
      myApp = new HyperspeedApp(hyperspeed.current, options);
      myApp.init();
    }

    // Cleanup function
    return () => {
      if (myApp) {
        myApp.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full" ref={hyperspeed}></div>
  );
};

export default Hyperspeed; 