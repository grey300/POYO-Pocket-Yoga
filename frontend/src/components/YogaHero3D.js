import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * WebGL hero: loads a real 3D model (a woman in a yoga / meditation pose) and
 * presents it on a glowing meditation ring, slowly rotating.
 *
 * Drop a Mixamo export at  public/models/yoga.fbx  (or a .glb at
 * public/models/yoga.glb). It is auto-centered, auto-scaled to TARGET_HEIGHT,
 * and any embedded animation clip is played. Until a file is present the scene
 * falls back to an ambient ring + particles rather than breaking the hero.
 */

const PUBLIC = process.env.PUBLIC_URL || '';
const FBX_URL = `${PUBLIC}/models/yoga.fbx`;
const GLB_URL = `${PUBLIC}/models/yoga.glb`;
// Tripo FBX ships its base colour as an external texture; load it ourselves so
// we don't depend on the "+"-laden path baked into the FBX (which breaks over
// HTTP). Left null for GLB models, which embed their own textures.
const FBX_TEXTURE_URL = `${PUBLIC}/models/yoga_basecolor.jpg`;
const TARGET_HEIGHT = 1.4;      // world units the model is scaled to
const MODEL_Y_OFFSET = 0;       // nudge up/down if the figure floats or sinks
const INITIAL_ROTATION_Y = 0;   // radians, if the model faces away from camera

export default function YogaHero3D({ className = '' }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
            return undefined; // WebGL unavailable — CSS fallback stays visible
        }

        const width = mount.clientWidth || 600;
        const height = mount.clientHeight || 600;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 1.0, 3.6);
        camera.lookAt(0, 0.75, 0);

        // --- Studio reflections + lighting -----------------------------------
        let pmrem;
        let envRT;
        try {
            pmrem = new THREE.PMREMGenerator(renderer);
            envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
            scene.environment = envRT.texture;
        } catch { /* reflections optional */ }

        const ambient = new THREE.AmbientLight(0x415068, 0.4);
        const keyLight = new THREE.DirectionalLight(0xffe9d5, 0.95);
        keyLight.position.set(2.5, 3.4, 2.6);
        const rimLight = new THREE.DirectionalLight(0x3b8cff, 0.85);
        rimLight.position.set(-3, 1.8, -2.2);
        const fillLight = new THREE.PointLight(0x9fb8e0, 0.3, 12);
        fillLight.position.set(0, 1.1, 3);
        scene.add(ambient, keyLight, rimLight, fillLight);

        // --- Spin group holds the model --------------------------------------
        const spin = new THREE.Group();
        scene.add(spin);

        const disposables = { geometries: [], materials: [], textures: [] };
        const trackGeo = (g) => { disposables.geometries.push(g); return g; };

        const seamMat = new THREE.MeshStandardMaterial({
            color: 0x0a1633, emissive: 0x49b0ff, emissiveIntensity: 1.9, roughness: 0.4,
        });
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x3b8cff, transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        disposables.materials.push(seamMat, haloMat);

        // --- Ground meditation ring (always present) -------------------------
        const ring = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.82, 0.018, 12, 96)), seamMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        scene.add(ring);
        const ringGlow = new THREE.Mesh(trackGeo(new THREE.RingGeometry(0.74, 0.94, 72)), haloMat);
        ringGlow.rotation.x = -Math.PI / 2;
        ringGlow.position.y = 0.005;
        scene.add(ringGlow);

        // --- Ambient particles -----------------------------------------------
        const COUNT = 240;
        const pPos = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i += 1) {
            pPos[i * 3] = (Math.random() - 0.5) * 6;
            pPos[i * 3 + 1] = Math.random() * 3;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
        }
        const pGeo = trackGeo(new THREE.BufferGeometry());
        pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x8ec2ff, size: 0.02, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        disposables.materials.push(particleMat);
        const particles = new THREE.Points(pGeo, particleMat);
        scene.add(particles);

        // --- Load the model ---------------------------------------------------
        let disposed = false;
        let model = null;
        let mixer = null;

        const onModel = (object, animations, textureUrl) => {
            if (disposed) { // effect already cleaned up — drop it immediately
                object.traverse((o) => o.geometry?.dispose?.());
                return;
            }
            model = object;

            // Center on the ring and scale to a consistent height.
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);
            const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
            model.scale.setScalar(scale);
            model.position.set(
                -center.x * scale,
                -box.min.y * scale + MODEL_Y_OFFSET,
                -center.z * scale
            );
            model.rotation.y = INITIAL_ROTATION_Y;
            model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });

            spin.add(model);

            // For the FBX, drop a clean PBR material with the base-colour map
            // (its baked-in texture path 404s over HTTP).
            if (textureUrl) {
                new THREE.TextureLoader().load(textureUrl, (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                    disposables.textures.push(tex);
                    model.traverse((o) => {
                        if (!o.isMesh) return;
                        const std = new THREE.MeshStandardMaterial({
                            map: tex, roughness: 0.8, metalness: 0.05,
                            color: 0xcfcfcf, envMapIntensity: 0.5,
                        });
                        const old = Array.isArray(o.material) ? o.material : [o.material];
                        old.forEach((m) => m?.dispose?.());
                        o.material = std;
                        disposables.materials.push(std);
                    });
                });
            }

            if (animations?.length) {
                mixer = new THREE.AnimationMixer(model);
                mixer.clipAction(animations[0]).play();
            }
        };

        const ambientOnly = () => {
            // No model yet (or failed to load) — the ambient scene remains.
            // eslint-disable-next-line no-console
            console.info(`YogaHero3D: no model at ${FBX_URL} or ${GLB_URL} — showing ambient scene.`);
        };

        // Try the FBX first (with its external texture), then a GLB, then ambient.
        new FBXLoader().load(
            FBX_URL,
            (obj) => onModel(obj, obj.animations, FBX_TEXTURE_URL),
            undefined,
            () => new GLTFLoader().load(
                GLB_URL,
                (gltf) => onModel(gltf.scene, gltf.animations),
                undefined,
                ambientOnly
            )
        );

        // --- Animation --------------------------------------------------------
        let frameId;
        const clock = new THREE.Clock();

        const renderLoop = () => {
            const delta = clock.getDelta();
            const t = clock.elapsedTime;
            if (!reduceMotion) {
                spin.rotation.y = Math.sin(t * 0.22) * 0.5;
                if (mixer) mixer.update(delta);
                seamMat.emissiveIntensity = 1.6 + Math.sin(t * 1.5) * 0.5;
                haloMat.opacity = 0.26 + Math.sin(t * 1.5) * 0.09;
                particles.rotation.y = t * 0.025;
            }
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        const onResize = () => {
            const w = mount.clientWidth || width;
            const h = mount.clientHeight || height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            disposed = true;
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', onResize);
            if (mixer) mixer.stopAllAction();
            if (model) {
                model.traverse((o) => {
                    if (o.isMesh) {
                        o.geometry?.dispose?.();
                        const mats = Array.isArray(o.material) ? o.material : [o.material];
                        mats.forEach((m) => {
                            if (!m) return;
                            Object.values(m).forEach((v) => v?.isTexture && v.dispose());
                            m.dispose();
                        });
                    }
                });
            }
            disposables.geometries.forEach((g) => g.dispose());
            disposables.materials.forEach((m) => m.dispose());
            disposables.textures.forEach((t) => t.dispose());
            envRT?.dispose();
            pmrem?.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className={className} aria-hidden="true" />;
}
